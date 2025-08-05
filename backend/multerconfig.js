import multer from "multer";

const storage = multer.memoryStorage();
export const uploadFile = multer({
    storage: storage,
    limits: {
        fieldNameSize: 100,    // Max field name size (bytes)
        fieldSize: 10 * 1024 * 1024, // 10MB for non-file fields
        fileSize: 50 * 1024 * 1024,  // 50MB for files
    }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});