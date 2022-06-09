import { Router } from 'express';
import { AuthController } from '../controller/authController';

const router = Router();

// Register a new user (simple register, not user creation)
router.post('/register', AuthController.register);
// Login a user to the application
router.post('/login', AuthController.login);
// Revoke given refresh token if valid
router.post('/logout', AuthController.logout);
// Return token info of given access token
router.get('/check', AuthController.verifyToken, AuthController.checkToken);
// Given a valid refresh token return a new pair of tokens
router.post('/refresh', AuthController.refreshToken);

export const authRouter = router;