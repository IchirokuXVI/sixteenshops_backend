import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { RoleController } from '../controller/roleController';

const router = Router();
let roleController = new RoleController();

router.use(AuthController.verifyToken);

router.get('/', roleController.filter);
router.post('/', roleController.create);
router.post('/filter', roleController.filter);

export const rolesRouter = router;