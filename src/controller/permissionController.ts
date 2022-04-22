import { BaseResourceController } from './baseResourceController';
import { Permission } from '../model/permission';

export class PermissionController extends BaseResourceController {
    constructor() {
        super(Permission);
    }
}
