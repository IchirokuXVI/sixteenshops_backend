import { BaseResourceController } from './baseResourceController';
import { Invoice } from '../model/invoice';

export class InvoiceController extends BaseResourceController {
    constructor() {
        super(Invoice);
    }
}
