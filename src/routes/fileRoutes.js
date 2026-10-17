import { Router } from 'express';
import upload from '../middleware/upload.js';
import { prisma } from '../lib/prisma.js';
import path from 'node:path';
import { getFiles, downloadFile } from '../controllers/fileController.js';

const uploadDir = path.resolve("uploads");

const router = Router();

router.get('/', getFiles);
router.get('/:id', downloadFile);

router.post('/upload', upload.single('file'), async (req,res)=>{
    try{
    if(!req.file){
        return res.status(400).json({error: 'no file uploaded'});
    }

    const file = await prisma.file.create({
        data: {
            filename: req.file.originalname,
            storageName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            ownerId: "cmv581r2b0000tgtwl918ug7r",
        }
    });
    return res.status(201).json({
        message: 'file uploaded successfully',file,
    });

    }catch(error){
        console.error(error, 'file upload failed');

    if(req.file){
    const filePath =  path.resolve(uploadDir, req.file.filename);

    try{
        await unlink(filePath);
    }catch(cleanupError){
        console.error(cleanupError, 'failed to delete file');
    }
    }

    return res.status(500).json({error:'file to upload file'});
}
});


export default router;