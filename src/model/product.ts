import { Schema, model } from 'mongoose';
import { Double } from 'mongodb';
import { optionsGroupSchema } from './optionsGroup';

export const productSchema = new Schema({
    name:  String,
    price: Double,
    discount: { type: Number, default: 0 },
    optionsGroups: [
        optionsGroupSchema
    ]
});

export const Product = model('product', productSchema);
