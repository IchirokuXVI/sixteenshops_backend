import { BaseResourceController } from './baseResourceController';
import { Request, Response, NextFunction } from 'express';
import { Product } from '../model/product';

export class ProductController extends BaseResourceController {
    constructor() {
        super(Product);
    }

    async getOptionGroups(req: Request, res: Response, next: NextFunction) {
        res.send((await Product.findById(req.params.product).select('optionGroups -_id').lean()).optionGroups);
    }

    async getOptionGroup(req: Request, res: Response, next: NextFunction) {
        res.send((await Product.findById(req.params.product).select('optionGroups -_id')).optionGroups.id(req.params.optionGroup));
    }

    async getOptionsFromOptionGroup(req: Request, res: Response, next: NextFunction) {
        res.send((await Product.findById(req.params.product).select('optionGroups -_id')).optionGroups.id(req.params.optionGroup)?.options);
    }

    async getOptionFromOptionGroup(req: Request, res: Response, next: NextFunction) {
        res.send((await Product.findById(req.params.product).select('optionGroups -_id')).optionGroups.id(req.params.optionGroup)?.options.id(req.params.option));
    }

    async addOptionGroup(req: Request, res: Response, next: NextFunction) {
        let product = await Product.findById(req.params.product).select('optionGroups');

        product.optionGroups.push(req.body);

        product.save((err: any) => {
            if (err)
                next(err);
            else
                res.status(201).send();
        });
    }

    async addOptionToOptionGroup(req: Request, res: Response, next: NextFunction) {
        let product = await Product.findById(req.params.product).select('optionGroups');
        
        let optionGroup = product.optionGroups.id(req.params.optionGroup);

        console.log(optionGroup);

        if (!optionGroup) {
            next(new Error('optionGroup not found'));
            return;
        }

        optionGroup.options.push(req.body);

        product.save((err: any) => {
            if (err)
                next(err);
            else
                res.status(201).send();
        });
    }

    async removeOptionGroup(req: Request, res: Response, next: NextFunction) {
        let product = await Product.findById(req.params.product).select('optionGroups');

        product.optionGroups.id(req.params.optionGroup)?.remove();

        product.save((err: any) => {
            if (err)
                next(err);
            else
                res.status(204).send();
        });
    }

    async removeOptionFromOptionGroup(req: Request, res: Response, next: NextFunction) {
        let product = await Product.findById(req.params.product).select('optionGroups');

        product.optionGroups.id(req.params.optionGroup)?.options.id(req.params.option)?.remove();

        product.save((err: any) => {
            if (err)
                next(err);
            else
                res.status(204).send();
        });
    }
}
