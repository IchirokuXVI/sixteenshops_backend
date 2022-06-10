import { Router, Request, Response, NextFunction } from 'express';
import { ProductController } from '../controller/productController';
import { AuthController } from '../controller/authController';
import multer from 'multer';
import fs from 'fs';
import { parseFormDataObjects } from '../middleware/formData.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        let destinationFolder = `storage/temp`;

        if (req.params.id || req.params._id) {
            destinationFolder = `storage/public/productImgs/${req.params.id || req.params._id}`;
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 8, // 8 MiB
    }
});

const router = Router();
let productController = new ProductController();

router.get('/', productController.filter);
router.get('/:id', productController.get);
router.post('/', AuthController.verifyToken, requirePermission('createProduct'), upload.any(), parseFormDataObjects, productController.addImagesToProduct, productController.create, productController.moveImages);
router.post('/filter', productController.filter);
router.put('/:id', AuthController.verifyToken, requirePermission('editProduct'), upload.any(), parseFormDataObjects, productController.addOptions, productController.addImagesToProduct, productController.update);
router.delete('/:id', AuthController.verifyToken, requirePermission('deleteProduct'), productController.delete, productController.deleteFolder);

router.get('/:product/optionGroups', productController.getOptionGroups);
router.get('/:product/optionGroups/:optionGroup', productController.getOptionGroup);
router.post('/:product/optionGroups', AuthController.verifyToken, productController.addOptionGroup);
router.delete('/:product/optionGroups/:optionGroup', AuthController.verifyToken, productController.removeOptionGroup);

router.get('/:product/optionGroups/:optionGroup/options', productController.getOptionsFromOptionGroup);
router.get('/:product/optionGroups/:optionGroup/options/:option', productController.getOptionFromOptionGroup);
router.post('/:product/optionGroups/:optionGroup/options', AuthController.verifyToken, productController.addOptionToOptionGroup);
router.delete('/:product/optionGroups/:optionGroup/options/:option', AuthController.verifyToken, productController.removeOptionFromOptionGroup);

export const productRouter = router;