import { Router } from 'express';
import { PermissionController } from '../controller/permissionController';

const router = Router();
let permissionController = new PermissionController();

router.get('/', permissionController.filter);
router.post('/', permissionController.create);
router.post('/filter', permissionController.filter);

export const permissionsRouter = router;