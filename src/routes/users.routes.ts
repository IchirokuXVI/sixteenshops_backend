import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controller/userController';
import { AuthController } from '../controller/authController';
import multer from 'multer';
import fs from 'fs';
import { parseFormDataObjects } from '../middleware/formData.middleware';
import { requirePermission } from '../middleware/permission.middleware';

const tempStorage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        let destinationFolder = `storage/temp`;

        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9));
    }
});

const userStorage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        let id = req.params.id || req.params._id || req.res?.locals.tokenInfo._id;
        let destinationFolder = `storage/${id}`;

        fs.mkdirSync(destinationFolder, { recursive: true });

        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar');
    }
});

const uploadTemp = multer({
    storage: tempStorage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MiB
    }
});

const uploadUser = multer({
    storage: userStorage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MiB
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
router.post('/', AuthController.verifyToken, requirePermission('createUser'), uploadTemp.single('avatar'), parseFormDataObjects, userController.create, userController.moveAvatar);
// Update your own user
router.put('/profile', AuthController.verifyToken, uploadUser.single('avatar'), parseFormDataObjects, userController.updateProfile, userController.update);
// Update an user
router.put('/:id', AuthController.verifyToken, requirePermission('editUser'), uploadUser.single('avatar'), parseFormDataObjects, userController.update);
// Delete an user
router.delete('/:id', AuthController.verifyToken, requirePermission('deleteUser'), userController.delete, userController.deleteFolder);

export const usersRouter = router;