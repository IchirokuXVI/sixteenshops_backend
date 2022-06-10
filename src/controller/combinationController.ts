import { BaseResourceController } from './baseResourceController';
import { Combination } from '../models/combination';
import { Request, Response, NextFunction } from 'express';

export class CombinationController extends BaseResourceController {
    constructor() {
        super(Combination);
    }

    /**
     * Get a combination based on the given options
     */
    async getByOptions(req: Request, res: Response, next: NextFunction) {
        try {
            res.send(await Combination.findOne({ 'options': { $all: req.query.options, $size: req.query.options?.length } }));
        } catch (err) {
            next(err);
            return;
        }
    }
}
