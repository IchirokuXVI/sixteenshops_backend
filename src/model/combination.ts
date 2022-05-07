import { Schema, model } from 'mongoose';
import { Double } from 'mongodb';

// Lots of nullable values because the default values will come from the product
const combinationSchema = new Schema({
    name:  { type: String, default: null },
    price: { type: Double, default: null },
    discount: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    options: [{ type: Schema.Types.ObjectId, ref: 'product.optionsGroups.options' }]
});

export const Combination = model('combination', combinationSchema);
