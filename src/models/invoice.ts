import { Schema, model } from 'mongoose';
import { Double } from 'mongodb';

const invoiceSchema = new Schema({
    date: { type: Date, default: Date.now },
    total_price: { type: Double, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    products: [{
        combination: { type: Schema.Types.ObjectId, ref: 'combination' },
        amount: { type: Number, required: true },
        price: { type: Double, required: true }
    }]
}, { timestamps: true });

export const Invoice = model('invoice', invoiceSchema);
