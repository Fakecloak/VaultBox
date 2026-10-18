import { loginUser, registerUser } from '../controllers/authController.js';
import { loginValidation, registerValidation } from '../middleware/validators/authValidator.js';
import {Router} from "express";

const router = Router();

router.post('/register', registerValidation, registerUser);
router.post('/login',loginValidation, loginUser)

export default router;