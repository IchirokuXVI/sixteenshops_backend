import { Router, Request } from 'express';
import { UserController } from '../controller/userController';
import { AuthController } from '../controller/authController';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        let destinationFolder = `storage/temp`;

        if (req.params.id || req.params._id)
            destinationFolder = `storage/${req.params.id || req.params._id}`;

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

router.get('/', AuthController.verifyToken, userController.filter);
router.get('/:id/avatar', userController.getAvatar);
router.post('/', upload.single('avatar'), userController.create);
router.post('/filter', AuthController.verifyToken, userController.filter);
router.put('/:id', upload.single('avatar'), userController.update);

export const usersRouter = router;