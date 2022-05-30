import { BaseResourceController } from './baseResourceController';
import { User } from '../models/user';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import sharp from 'sharp';
import { isNaN, isNumber } from 'lodash';

export class UserController extends BaseResourceController {
    constructor() {
        super(User);
    }

    override create(req: Request, res: Response, next: NextFunction) {
        if (req.file) {
            // Avatar field only saves the default avatar path.
            // The custom avatar path is always the same so there is no need to save it
            req.body.avatar = null;
        }
        super.create(req, res, next);
    }

    moveAvatar(req: Request, res: Response, next: NextFunction) {
        if (req.file && req.file.fieldname == 'avatar') {
            fs.rename(req.file.path, `storage/${res.locals.createdObject._id}/avatar`, (err) => {
                if (err) throw err;
                console.log(`Avatar of user ${ res.locals.createdObject._id } moved to corresponding folder`)
            });
        }
    }

    override async update(req: Request, res: Response, next: NextFunction) {
        if (req.file && req.file.fieldname == 'avatar') {
            // Avatar field only saves the default avatar path.
            // The custom avatar path is always the same so there is no need to save it
            req.body.avatar = null;
        } else if (req.body.avatar) {
            // Delete old avatar (doesn't matter if it doesn't exist)
            fs.unlink(`storage/${req.params.id || req.params._id}/avatar`, (err) => {
                if (err) throw err;
                console.log('User id ' + req.params.id || req.params._id + ' avatar deleted');
            });
        }
        super.update(req, res, next);
    }

    /**
     * Shows the avatar of the given user cropped to 1:1 aspect ratio
     */
    async getAvatar(req: Request, res: Response, next: NextFunction) {
        let id = req.params.id || req.params._id;

        let user = await User.findById(id).select('avatar').lean();

        let file;

        // If the user has a default avatar then return it
        // Otherwise return the avatar file that is placed in his folder
        if (user.avatar)
            file = `storage/defaultAvatars/${user.avatar}`;
        else
            file = `storage/${id}/avatar`;

        let transformer = sharp();

        let resolution;

        // There is a bug I didn't want to fix:
        // If the resolution is NaN (an string for example)
        // the original image will be returned with its original aspect ratio
        // It was quite handy for testing
        if (req.query.resolution) {
            // Becomes NaN if the parse fails
            resolution = parseInt((req.query as any).resolution, 10);
        } else {
            // Possible values for the size query param
            const sizes = {
                icon: 32,
                avatar: 64,
                small: 128,
                standard: 256,
                large: 512
            };
            if (req.query.size && typeof req.query.size == 'string')
                resolution = (sizes as any)[req.query.size]; // Fucking typescript
            else
                resolution = sizes.standard;
        }
        
        // Check if resolution isNaN before using it
        if (resolution && !isNaN(resolution))
            transformer.resize({
                width: resolution,
                height: resolution,
                fit: sharp.fit.cover, // Preserving aspect ratio, ensure the image covers both provided dimensions by cropping/clipping to fit
                position: sharp.strategy.entropy // focus on the region with the highest Shannon entropy
            });

        var s = fs.createReadStream(file);

        s.on('open', function () {
            // Avatars are always saved as png
            res.set('content-type', 'image/png');
            // Pipe the transformer and then the img
            s.pipe(transformer)
                .pipe(res);
        });
        s.on('error', function () {
            res.status(404).end('Not found');
        });

        return;
    }
}
