import {Router} from "express";
import { createFolder, getFolders, deleteFolder } from "../controllers/folderController.js";

const router = Router();

router.get('/', getFolders);
router.post('/', createFolder);
router.delete('/:id', deleteFolder);

export default router;