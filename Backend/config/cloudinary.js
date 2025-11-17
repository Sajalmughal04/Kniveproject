import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

// ✅ Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ Use local storage with multer (temporary storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// ✅ Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
    }
    cb(null, true);
  }
});

// ✅ Upload to Cloudinary after multer saves locally
const uploadToCloudinary = async (localFilePath) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: process.env.CLOUDINARY_FOLDER || 'knives-shop',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
      ]
    });

    // Delete local file after uploading to Cloudinary
    fs.unlinkSync(localFilePath);
    
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// ✅ Delete from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      console.log('⚠️ Not a Cloudinary URL, skipping deletion');
      return;
    }
    
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      console.log('⚠️ Invalid Cloudinary URL format');
      return;
    }
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    console.log('🗑️ Deleting from Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Delete result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
  }
};

// ✅ Middleware to handle Cloudinary upload
const handleCloudinaryUpload = async (req, res, next) => {
  try {
    // If using Cloudinary and file was uploaded
    if (process.env.STORAGE_TYPE === 'cloudinary' && req.file) {
      console.log('📤 Uploading to Cloudinary:', req.file.path);
      
      const cloudinaryResult = await uploadToCloudinary(req.file.path);
      
      // Replace file path with Cloudinary URL
      req.file.path = cloudinaryResult.url;
      req.file.cloudinary_id = cloudinaryResult.public_id;
      
      console.log('✅ Uploaded to Cloudinary:', cloudinaryResult.url);
    }
    next();
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    next(error);
  }
};

export { 
  cloudinary, 
  upload, 
  uploadToCloudinary,
  deleteFromCloudinary,
  handleCloudinaryUpload
};