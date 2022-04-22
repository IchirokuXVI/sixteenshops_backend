import { Schema, model } from 'mongoose';
import { Double } from 'mongodb';

const productSchema = new Schema({
    name:  String,
    price: Double,
    discount: { type: Number, default: 0 }
});

export const Product = model('product', productSchema);
