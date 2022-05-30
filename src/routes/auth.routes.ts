import { Router } from 'express';
import { AuthController } from '../controller/authController';

const router = Router();

router.post('/login', AuthController.login);
router.get('/check', AuthController.verifyToken, AuthController.checkToken);
router.get('/refresh', AuthController.refreshToken);

export const authRouter = router;