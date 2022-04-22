import { BaseResourceController } from './baseResourceController';
import { Combination } from '../model/combination';

export class CombinationController extends BaseResourceController {
    constructor() {
        super(Combination);
    }
}
