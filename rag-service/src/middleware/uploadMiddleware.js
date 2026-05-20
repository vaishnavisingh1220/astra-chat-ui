import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDirectory = path.join(process.cwd(), "src", "uploads");

/* =========================
   STORAGE CONFIG
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

/* =========================
   FILE FILTER
========================= */

const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf/;

  const extName = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = fileTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  }

  cb(new Error("Only PDF files are allowed"));
};

/* =========================
   MULTER CONFIG
========================= */

const upload = multer({
  storage,
  fileFilter,
});

export default upload;