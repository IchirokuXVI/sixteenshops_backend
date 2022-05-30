import { Router, Request } from 'express';
import { UserController } from '../controller/userController';
import { AuthController } from '../controller/authController';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        cb(null, `../../storage/${req.res?.locals.tokenInfo._id}`);
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar');
    }
});

const upload = multer({
    storage: storage
})

const router = Router();
let userController = new UserController();

router.get('/', AuthController.verifyToken, userController.filter);
router.get('/:id/avatar', userController.getAvatar);
router.post('/', upload.single('avatar'), userController.create);
router.post('/filter', AuthController.verifyToken, userController.filter);

export const usersRouter = router;