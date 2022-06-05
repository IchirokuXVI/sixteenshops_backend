import { Router } from 'express';
import { AuthController } from '../controller/authController';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/check', AuthController.verifyToken, AuthController.checkToken);
router.post('/refresh', AuthController.refreshToken);

export const authRouter = router;