import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { RoleController } from '../controller/roleController';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();
let roleController = new RoleController();

router.use(AuthController.verifyToken);

// Get all or filter roles
router.get('/', roleController.filter);
// Alternative endpoint for filter
router.post('/filter', roleController.filter);
// Get role
router.get('/:id', roleController.get);
// Create role
router.post('/', requirePermission('createRole'), roleController.create);
// Update role
router.put('/:id', requirePermission('editRole'), roleController.update);
// Delete role
router.delete('/:id', requirePermission('deleteRole'), roleController.delete);

export const rolesRouter = router;