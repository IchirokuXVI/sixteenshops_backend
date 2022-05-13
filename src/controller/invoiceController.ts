import { BaseResourceController } from './baseResourceController';
import { Invoice } from '../models/invoice';

export class InvoiceController extends BaseResourceController {
    constructor() {
        super(Invoice);
    }
}
