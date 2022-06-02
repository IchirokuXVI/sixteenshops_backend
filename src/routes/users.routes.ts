import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controller/userController';
import { AuthController } from '../controller/authController';
import multer from 'multer';
import fs from 'fs';
import { parseFormDataObjects } from '../middleware/formData.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        let destinationFolder = `storage/temp`;

        if (req.params.id || req.params._id) {
            destinationFolder = `storage/${req.params.id || req.params._id}`;
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        if (req.method == 'POST')
            cb(null, file.filename + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9));
        else
            cb(null, 'avatar');
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 3, // 3 MiB
    }
})

const router = Router();
let userController = new UserController();

router.get('/', AuthController.verifyToken, requirePermission('getUser'), userController.filter);
router.get('/checkEmail', userController.checkEmail);
router.get('/:id', userController.get);
router.get('/:id/avatar', userController.getAvatar);
router.post('/', upload.single('avatar'), parseFormDataObjects, userController.create, userController.moveAvatar);
router.post('/filter', AuthController.verifyToken, userController.filter);
router.put('/:id', AuthController.verifyToken, upload.single('avatar'), parseFormDataObjects, userController.update);
router.delete('/:id', AuthController.verifyToken, userController.delete, userController.deleteFolder);

export const usersRouter = router;