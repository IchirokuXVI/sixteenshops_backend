import { BaseResourceController } from './baseResourceController';
import { Product } from '../model/product';

export class ProductController extends BaseResourceController {
    constructor() {
        super(Product);
    }
}
