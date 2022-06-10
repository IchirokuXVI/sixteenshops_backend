import { Router } from 'express';
import { AuthController } from '../controller/authController';
import { CombinationController } from '../controller/combinationController';
import { requirePermission } from '../middleware/permission.middleware';

const router = Router();
let combinationController = new CombinationController();

router.use(AuthController.verifyToken);

// Get all or filter combinations
router.get('/', combinationController.filter);
// Alternative endpoint for filter
router.post('/filter', combinationController.filter);
// Get combination by options
router.get('/byOptions', combinationController.getByOptions);
// Get combination
router.get('/:id', AuthController.verifyToken, combinationController.get);
// Create combination
router.post('/', AuthController.verifyToken, requirePermission('editProduct'), combinationController.create);
// Update combination
router.put('/:id', AuthController.verifyToken, requirePermission('editProduct'), combinationController.update);
// Delete combination
router.delete('/:id', AuthController.verifyToken, requirePermission('editProduct'), combinationController.delete);

export const combinationsRouter = router;