import { BaseResourceController } from './baseResourceController';
import { Role } from '../model/role';

export class RoleController extends BaseResourceController {
    constructor() {
        super(Role);
    }
}
