import { BaseResourceController } from './baseResourceController';
import { Variant } from '../model/variant';

export class VariantController extends BaseResourceController {
    constructor() {
        super(Variant);
    }
}
