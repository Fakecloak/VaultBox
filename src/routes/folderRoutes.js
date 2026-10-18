import {Router} from "express";
import { createFolder, getFolders } from "../controllers/folderController.js";

const router = Router();

router.get('/', getFolders);
router.post('/', createFolder);

export default router;