import { Router } from 'express';
import { ProductController } from '../controller/productController';
import { AuthController } from '../controller/authController';

const router = Router();
let productController = new ProductController();

router.get('/', productController.filter);
router.get('/:_id', productController.filter);
router.post('/', AuthController.verifyToken, productController.create);
router.post('/filter', productController.filter);

router.get('/:product/optionGroups', productController.getOptionGroups);
router.get('/:product/optionGroups/:optionGroup', productController.getOptionGroup);
router.post('/:product/optionGroups', AuthController.verifyToken, productController.addOptionGroup);
router.delete('/:product/optionGroups/:optionGroup', AuthController.verifyToken, productController.removeOptionGroup);

router.get('/:product/optionGroups/:optionGroup/options', productController.getOptionsFromOptionGroup);
router.get('/:product/optionGroups/:optionGroup/options/:option', productController.getOptionFromOptionGroup);
router.post('/:product/optionGroups/:optionGroup/options', AuthController.verifyToken, productController.addOptionToOptionGroup);
router.delete('/:product/optionGroups/:optionGroup/options/:option', AuthController.verifyToken, productController.removeOptionFromOptionGroup);

export const productRouter = router;