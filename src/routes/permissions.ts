import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { PermissionController } from '../controller/permissionController';

const router = Router();
let permissionController = new PermissionController();
let authController = new AuthController();

router.use(authController.verifyToken);

router.get('/', permissionController.filter);
router.post('/', permissionController.create);
router.post('/filter', permissionController.filter);

export const permissionsRouter = router;