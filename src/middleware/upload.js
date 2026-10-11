import multer from 'multer';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const uploadDir = path.resolve("uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage, 
    limits:{
        fileSize: 5 * 1024 * 1024, // 5MB
        files:1,
    },
});

export default upload;