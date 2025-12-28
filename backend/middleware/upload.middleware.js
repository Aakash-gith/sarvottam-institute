import multer from 'multer';

// Use memory storage for Cloudinary upload (file is stored in buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only .jpg, .png, .webp formats allowed!"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB max size
    }
});

export { upload };
