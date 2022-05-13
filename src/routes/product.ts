import { Router } from 'express';
import { ProductController } from '../controller/productController';
import { AuthController } from '../controller/authController';

const router = Router();
let productController = new ProductController();
let authController = new AuthController();

router.get('/', productController.filter);
router.get('/:_id', productController.filter);
router.post('/', authController.verifyToken, productController.create);
router.post('/filter', productController.filter);

router.get('/:product/optionGroups', productController.getOptionGroups);
router.get('/:product/optionGroups/:optionGroup', productController.getOptionGroup);
router.post('/:product/optionGroups', authController.verifyToken, productController.addOptionGroup);
router.delete('/:product/optionGroups/:optionGroup', authController.verifyToken, productController.removeOptionGroup);

router.get('/:product/optionGroups/:optionGroup/options', productController.getOptionsFromOptionGroup);
router.get('/:product/optionGroups/:optionGroup/options/:option', productController.getOptionFromOptionGroup);
router.post('/:product/optionGroups/:optionGroup/options', authController.verifyToken, productController.addOptionToOptionGroup);
router.delete('/:product/optionGroups/:optionGroup/options/:option', authController.verifyToken, productController.removeOptionFromOptionGroup);

export const productRouter = router;