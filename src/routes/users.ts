import { Router } from 'express';
import { UserController } from '../controller/userController';
import { AuthController } from '../controller/authController';

const router = Router();
let userController = new UserController();
let authController = new AuthController();

router.get('/', authController.verifyToken, userController.filter);
router.post('/', userController.create);
router.post('/filter', authController.verifyToken, userController.filter);

export const usersRouter = router;