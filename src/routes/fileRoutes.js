import { Router } from 'express';
import upload from '../middleware/upload.js';

const router = Router();

router.post('/upload', upload.single('file'), (req,res)=>{
    if(!req.file){
        return res.status(400).json({error: 'no file uploaded'});
    }

    res.status(200).json({message: 'file uploaded successfully', file: {
        originalName: req.file.originalname,
        storageName: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
    },
});
});

export default router;