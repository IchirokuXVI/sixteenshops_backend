import { Schema, model } from 'mongoose';

// Lots of nullable values because the default values will come from the product
const combinationSchema = new Schema({
    name:  { type: String, default: null },
    price: { type: Number, default: null },
    discount: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    options: { type: [{ type: Schema.Types.ObjectId, ref: 'product.optionsGroups.options' }], unique: true }
}, { timestamps: true });

export const Combination = model('combination', combinationSchema);
