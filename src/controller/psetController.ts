import { BaseResourceController } from './baseResourceController';
import { Pset } from '../model/pset';

export class VariantController extends BaseResourceController {
    constructor() {
        super(Pset);
    }
}
