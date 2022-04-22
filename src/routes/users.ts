import { Router } from 'express';
import { UserController } from '../controller/userController';

const router = Router();
let userController = new UserController();

router.get('/', userController.filter);
router.post('/', userController.create);
router.post('/filter', userController.filter);

export const usersRouter = router;