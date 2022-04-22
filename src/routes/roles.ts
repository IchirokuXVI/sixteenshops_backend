import { Router } from 'express';
import { RoleController } from '../controller/roleController';

const router = Router();
let roleController = new RoleController();

router.get('/', roleController.filter);
router.post('/', roleController.create);
router.post('/filter', roleController.filter);

export const rolesRouter = router;