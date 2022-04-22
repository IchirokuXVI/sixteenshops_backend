import { BaseResourceController } from './baseResourceController';
import { User } from '../model/user';

export class UserController extends BaseResourceController {
    constructor() {
        super(User);
    }
}
