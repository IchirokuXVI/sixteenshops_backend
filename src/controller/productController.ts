import { BaseResourceController } from './baseResourceController';
import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/product';
import fs from 'fs';

export class ProductController extends BaseResourceController {
    constructor() {
        super(Product);
    }

    async addImagesToProduct(req: Request, res: Response, next: NextFunction) {
        if (req.files) {
            if (!req.body.images || !Array.isArray(req.body.images))
                req.body.images = [];

            for (let file of req.files as any) {
                req.body.images.push(file.filename);
            }
        }

        next();
    }

    /**
     * Move images in the temp folder to their corresponding folder
     */
    async moveImages(req: Request, res: Response, next: NextFunction) {
        if (req.files) {
            let productPath = `storage/public/productImgs/${res.locals.createdObject._id}`;
            fs.mkdirSync(productPath, { recursive: true });
            for (let file of req.files as any) {
                fs.rename(file.path, productPath + "/" + file.filename, (err) => {
                    if (err) throw err;
                });
            }
        }
    }

    /**
     * Middleware to delete a folder, called after deleting a product
     */
     deleteFolder(req: Request, res: Response, next: NextFunction) {
        let productPath = `storage/public/productImgs/${req.params._id || req.params.id}`;
        fs.rmSync(productPath, { recursive: true, force: true });
    }

    async addOptions(req: Request, res: Response, next: NextFunction) {
        try {
            let originalProduct = await Product.findById(req.params.id || req.params._id);

            res.locals.documentToUpdate = originalProduct;            

            if (req.body.optionGroups) {
                for (let i = 0; i < originalProduct.optionGroups.length; i++) {
                    let groupIndex = req.body.optionGroups.findIndex((item: any) => originalProduct.optionGroups[i]._id.equals(item._id));                    

                    if (groupIndex === -1) {
                        originalProduct.optionGroups.splice(i, 1);
                    } else if (originalProduct.optionGroups[i].options) {
                        for (let j = 0; j < originalProduct.optionGroups[i].options.length; j++) {
                            let optionIndex = req.body.optionGroups[groupIndex].options.findIndex((item: any) => originalProduct.optionGroups[i].options[j]._id.equals(item._id));

                            if (optionIndex === -1) {
                                originalProduct.optionGroups[i].options.splice(j, 1);
                            }
                        }
                    }
                }

                for (let optionGroup of req.body.optionGroups) {
                    let groupIndex = originalProduct.optionGroups.findIndex((item: any) => item.equals(optionGroup._id));
                    if (groupIndex === -1) {
                        originalProduct.optionGroups.push(optionGroup);
                    } else if (optionGroup.options && optionGroup.options.length > 1) {
                        for (let option of optionGroup.options) {
                            let optionIndex = originalProduct.optionGroups[groupIndex].options.findIndex((item: any) => item.equals(option._id));

                            if (optionIndex === -1) {
                                originalProduct.optionGroups[groupIndex].options.push(option);
                            }
                        }
                    }
                }
                
                delete req.body.optionGroups;
            }
        } catch (err) {
            next(err);
            return;
        }

        next();
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
