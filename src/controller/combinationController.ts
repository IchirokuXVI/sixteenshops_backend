import { BaseResourceController } from './baseResourceController';
import { Combination } from '../models/combination';

export class CombinationController extends BaseResourceController {
    constructor() {
        super(Combination);
    }
}
