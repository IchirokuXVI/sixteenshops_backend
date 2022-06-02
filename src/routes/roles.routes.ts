import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { RoleController } from '../controller/roleController';

const router = Router();
let roleController = new RoleController();

router.use(AuthController.verifyToken);

router.get('/', roleController.filter);
router.get('/:id', roleController.get);
router.post('/', roleController.create);
router.post('/filter', roleController.filter);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

export const rolesRouter = router;