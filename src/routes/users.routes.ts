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
});

const router = Router();
let userController = new UserController();

// Get all users or filter them
router.get('/', AuthController.verifyToken, requirePermission('getUser'), userController.filter);
// Alternative endpoint using post for filter
router.post('/filter', AuthController.verifyToken, userController.filter);
// Get your own user
router.get('/profile', AuthController.verifyToken, userController.profile);
// Check if an email exists
router.get('/checkEmail', userController.checkEmail);
// Get user
router.get('/:id', AuthController.verifyToken, requirePermission('getUser'), userController.get);
// Get avatar of user
router.get('/:id/avatar', userController.getAvatar);
// Create new user
router.post('/', AuthController.verifyToken, requirePermission('createUser'), upload.single('avatar'), parseFormDataObjects, userController.create, userController.moveAvatar);
// Update your own user
router.put('/profile', AuthController.verifyToken, upload.single('avatar'), parseFormDataObjects, userController.updateProfile, userController.update);
// Update an user
router.put('/:id', AuthController.verifyToken, requirePermission('editUser'), upload.single('avatar'), parseFormDataObjects, userController.update);
// Delete an user
router.delete('/:id', AuthController.verifyToken, requirePermission('deleteUser'), userController.delete, userController.deleteFolder);

export const usersRouter = router;