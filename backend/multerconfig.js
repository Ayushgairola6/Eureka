import multer from "multer";

const AllowedFileTypes = ["docx", "json", "md", "pptx", "csv", "txt", "pdf"];

const storage = multer.memoryStorage();
export const uploadFile = multer({
  storage: storage,
  limits: {
    fieldNameSize: 100, // Max field name size (bytes)
    fieldSize: 10 * 1024 * 1024, // 10MB for non-file fields
    fileSize: 50 * 1024 * 1024, // 50MB for files
  },
  fileFilter: (req, file, cb) => {
    if (AllowedFileTypes.includes(file.originalname.split(".").pop())) {
      cb(null, true);
    } else {
      return;
    }
  },
});

export const multerconfigForSdk = multer({
  storage: storage,
  limits: {
    fieldNameSize: 100, // Max field name size (bytes)
    fieldSize: 10 * 1024 * 1024, // 10MB for non-file fields
    fileSize: 50 * 1024 * 1024, // 50MB for files
  },
  fileFilter: (req, file, cb) => {
    if (AllowedFileTypes.includes(file.originalname.split(".").pop())) {
      cb(null, true);
    } else {
      return "Invalid file type or some other issue";
    }
  },
});
