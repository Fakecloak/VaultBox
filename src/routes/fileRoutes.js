import { Router } from 'express';
import upload from '../middleware/upload.js';
import { prisma } from '../lib/prisma.js';
import path from 'node:path';
import { getFiles, downloadFile, deleteFile, uploadFile } from '../controllers/fileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const uploadDir = path.resolve("uploads");

const router = Router();

router.get('/', authenticateToken, getFiles);
router.get('/:id', authenticateToken, downloadFile);
router.delete('/:id', authenticateToken, deleteFile);

router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
    

export default router;