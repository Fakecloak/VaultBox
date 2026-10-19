import {prisma} from '../lib/prisma.js';
import path from 'node:path';
import { unlink } from 'node:fs/promises';

export const getFiles = async (req, res) => {
    try{
        const files = await prisma.file.findMany({
            where: {
                ownerId: req.user.userId,
            }
        });

        return res.status(200).json({
            message: 'files retrieved successfully',files,
        });

    } catch(error){
        console.error("Failed to retrieve files:", error);
        return res.status(500).json({error:'failed to retrieve files'});
}
};

export const downloadFile = async(req, res) => {
    try{
        
        const fileID = req.params.id;
        
        const file = await prisma.file.findFirst({
            where:{
                id: fileID,
                ownerId: req.user.userId
            }
        })

        if(!file){            
            return res.status(404).json({error:'file not found'});
        }

        const filePath = path.resolve("uploads", file.storageName);
        return res.download(filePath, file.filename);


    } catch(error){
        console.error("Failed to download file:", error);
        return res.status(500).json({error:'failed to download file'});
    }
} 

export const deleteFile  = async(req, res) => {
    try{
        const fileID = req.params.id;

        const file  = await prisma.file.findFirst({
            where: {
                id: fileID,
                ownerId: req.user.userId

            }
        })

        if(!file){
            return res.status(404).json({error: 'file not exist'});
        }

        const filePath = path.resolve("uploads", file.storageName);
        await unlink(filePath); //deleting the file from the uploads directory.

        const deletedFile = await prisma.file.delete({
            where: {
                id: fileID,
            }
        });

        return res.status(200).json({message: 'file deleted Successfully', deletedFile});

    } catch(error){
        console.error("Failed to delete file:", error);
        return res.status(500).json({error:'failed to delete file'});
    }
};

export const uploadFile = async(req, res) => {
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
                ownerId: req.user.userId,
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
}