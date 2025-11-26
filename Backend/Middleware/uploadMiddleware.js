import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

// ✅ Load environment variables first
dotenv.config();

// ✅ Verify Cloudinary config is loaded
console.log('🔍 Checking Cloudinary Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('USE_LOCAL_STORAGE:', process.env.USE_LOCAL_STORAGE || 'false');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Verify configuration was successful
const config = cloudinary.config();
console.log('☁️ Cloudinary Config Loaded:', {
  cloud_name: config.cloud_name ? '✅' : '❌',
  api_key: config.api_key ? '✅' : '❌',
  api_secret: config.api_secret ? '✅' : '❌'
});

let upload;

// Check if using local storage or Cloudinary
if (process.env.USE_LOCAL_STORAGE === "true") {
  console.log('📁 Using LOCAL storage');
  
  const uploadsDir = process.env.UPLOADS_DIR || "uploads";
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  });
  
  upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Only images (jpg, jpeg, png, webp) are allowed!'));
      }
    }
  });
  
} else {
  console.log('☁️ Using CLOUDINARY storage');
  
  // ✅ Check if Cloudinary is properly configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ ERROR: Cloudinary credentials missing in .env file!');
    console.error('Please set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    throw new Error('Cloudinary configuration missing');
  }
  
  try {
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        return {
          folder: process.env.CLOUDINARY_FOLDER || 'knives-shop',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ width: 800, height: 800, crop: 'limit' }],
          public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        };
      },
    });
    
    upload = multer({ 
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }
    });
    
    console.log('✅ Cloudinary storage initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Cloudinary storage:', error);
    throw error;
  }
}

// Helper function to delete from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) {
      throw new Error('Image URL not provided');
    }

    if (!imageUrl.includes('cloudinary.com')) {
      console.log('Not a Cloudinary URL, skipping');
      return { result: 'skipped' };
    }

    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    const withoutVersion = pathAfterUpload[0].startsWith('v') && !isNaN(pathAfterUpload[0].substring(1))
      ? pathAfterUpload.slice(1)
      : pathAfterUpload;
    
    const fullPath = withoutVersion.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.')) || fullPath;
    
    console.log('🗑️ Deleting from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Cloudinary delete result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};

// Helper function to delete local file
export const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Local file deleted:', filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Local file delete error:', error);
    throw error;
  }
};

// Universal delete function
export const deleteFile = async (filePathOrUrl) => {
  try {
    if (process.env.USE_LOCAL_STORAGE === "true") {
      return deleteLocalFile(filePathOrUrl);
    } else {
      return await deleteFromCloudinary(filePathOrUrl);
    }
  } catch (error) {
    console.error('❌ File delete error:', error);
    throw error;
  }
};

// Helper to get file URL
export const getFileUrl = (file) => {
  if (process.env.USE_LOCAL_STORAGE === "true") {
    return `${process.env.BASE_URL || 'http://localhost:3000'}/${file.path}`;
  } else {
    return file.path;
  }
};

export { cloudinary };
export default upload;