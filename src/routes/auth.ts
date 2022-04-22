import { Router } from 'express';
import { AuthController } from '../controller/authController';

const router = Router();
let authController = new AuthController();

router.post('/login', authController.login);
router.get('/verify', authController.verifyToken);
router.get('/refresh', authController.refreshToken);

export const authRouter = router;