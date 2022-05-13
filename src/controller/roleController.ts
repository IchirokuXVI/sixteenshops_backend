import { BaseResourceController } from './baseResourceController';
import { Role } from '../models/role';

export class RoleController extends BaseResourceController {
    constructor() {
        super(Role);
    }
}
