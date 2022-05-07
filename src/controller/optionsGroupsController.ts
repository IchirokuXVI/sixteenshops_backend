import { BaseResourceController } from './baseResourceController';
import { optionsGroup } from '../model/optionsGroup';

export class OptionsGroupsController extends BaseResourceController {
    constructor() {
        super(optionsGroup);
    }
}
