import {Router} from "express";
import { createFolder, getFolders, deleteFolder } from "../controllers/folderController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/', authenticateToken, createFolder);
router.get('/', authenticateToken, getFolders);
router.delete('/:id', authenticateToken, deleteFolder);

export default router;