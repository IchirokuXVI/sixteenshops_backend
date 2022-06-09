import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { PermissionController } from '../controller/permissionController';

const router = Router();
let permissionController = new PermissionController();

// All endpoints in the router will need to verify the token
router.use(AuthController.verifyToken);

router.get('/', permissionController.filter);
// router.post('/', permissionController.create);
// router.post('/filter', permissionController.filter);

export const permissionsRouter = router;