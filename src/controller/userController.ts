import { BaseResourceController } from './baseResourceController';
import { User } from '../models/user';

export class UserController extends BaseResourceController {
    constructor() {
        super(User);
    }
}
