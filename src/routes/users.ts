import { Router } from 'express';
import { UserController } from '../controller/userController';
import { AuthController } from '../controller/authController';

const router = Router();
let userController = new UserController();

router.get('/', AuthController.verifyToken, userController.filter);
router.post('/', userController.create);
router.post('/filter', AuthController.verifyToken, userController.filter);

export const usersRouter = router;