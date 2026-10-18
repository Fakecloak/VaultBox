import { registerUser } from '../controllers/authController.js';
import { registerValidation } from '../middleware/validators/authValidator.js';
import {Router} from "express";

const router = Router();

router.post('/register', registerValidation, registerUser);

export default router;