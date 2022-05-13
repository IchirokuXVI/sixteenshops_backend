import { BaseResourceController } from './baseResourceController';
import { Permission } from '../models/permission';

export class PermissionController extends BaseResourceController {
    constructor() {
        super(Permission);
    }
}
