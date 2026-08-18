import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the temporary upload directory exists
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure Multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique, collision-resistant filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${uniqueSuffix}-${sanitizedOriginalName}`);
  },
});

// File filter to restrict uploads to valid video and image types
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/mkv", "video/x-matroska"];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Only JPEG, PNG, WEBP, GIF, and MP4/WEBM/MOV video files are allowed.`
      ),
      false
    );
  }
};

// Create Multer instance with disk storage, size limit (100MB for video), and file filter
export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size
  },
  fileFilter,
});