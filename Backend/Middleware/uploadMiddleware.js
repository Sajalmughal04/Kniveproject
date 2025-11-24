import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let upload;

// Check if using local storage or Cloudinary
if (process.env.USE_LOCAL_STORAGE === "true") {
  // Local storage setup
  const uploadsDir = process.env.UPLOADS_DIR || "uploads";
  
  // Ensure uploads directory exists
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      // File type validation
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Sirf images (jpg, jpeg, png, webp) upload kar sakte hain!'));
      }
    }
  });
} else {
  // Cloudinary storage setup
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: process.env.CLOUDINARY_FOLDER || 'knives-shop',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}` // Unique filename
      };
    },
  });
  
  upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  });
}

// Helper function to delete from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) {
      throw new Error('Image URL provide nahi kiya gaya');
    }

    // Check if URL is from Cloudinary
    if (!imageUrl.includes('cloudinary.com')) {
      console.log('Yeh Cloudinary URL nahi hai, skip kar rahe hain');
      return { result: 'skipped' };
    }

    // Extract public_id from URL
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }
    
    // Get everything after 'upload/vXXXXXXXXXX/' or 'upload/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    // Remove version if exists (starts with 'v' followed by numbers)
    const withoutVersion = pathAfterUpload[0].startsWith('v') && !isNaN(pathAfterUpload[0].substring(1))
      ? pathAfterUpload.slice(1)
      : pathAfterUpload;
    
    // Join to get full path and remove extension
    const fullPath = withoutVersion.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.')) || fullPath;
    
    console.log('Deleting from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Helper function to delete local file
export const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Local file deleted:', filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Local file delete error:', error);
    throw error;
  }
};

// Universal delete function (works for both local and Cloudinary)
export const deleteFile = async (filePathOrUrl) => {
  try {
    if (process.env.USE_LOCAL_STORAGE === "true") {
      return deleteLocalFile(filePathOrUrl);
    } else {
      return await deleteFromCloudinary(filePathOrUrl);
    }
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
};

// Helper to get file URL
export const getFileUrl = (file) => {
  if (process.env.USE_LOCAL_STORAGE === "true") {
    // Local file URL
    return `${process.env.BASE_URL || 'http://localhost:3000'}/${file.path}`;
  } else {
    // Cloudinary URL
    return file.path; // Cloudinary already provides full URL
  }
};

export { cloudinary };
export default upload;