import multer from "multer";
import path from "path";

let upload;

if (process.env.USE_LOCAL_STORAGE === "true") {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dst = process.env.UPLOADS_DIR || "uploads";
      cb(null, dst);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    }
  });
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  const storage = multer.memoryStorage();
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
}

export default upload;
