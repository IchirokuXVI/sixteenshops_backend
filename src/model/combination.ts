import { Schema, model } from 'mongoose';
import { Double } from 'mongodb';

// Lots of nullable values because the default values will come from the product
const combinationSchema = new Schema({
    name:  { type: String, required: false, default: null },
    price: { type: Double, required: false, default: null },
    discount: { type: Number, required: false, default: null },
    stock: { type: Number, default: 0 },
    variants: [{ type: Schema.Types.ObjectId, ref: 'variant' }]
});

export const Combination = model('combination', combinationSchema);
