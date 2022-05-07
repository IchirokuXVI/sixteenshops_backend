import { BaseResourceController } from './baseResourceController';
import { Option } from '../model/option';

export class OptionController extends BaseResourceController {
    constructor() {
        super(Option);
    }
}
