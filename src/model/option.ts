import { Schema, model } from 'mongoose';

// Lots of nullable values because the default values will come from the product
export const optionSchema = new Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, required: true, default: 0 }
});

export const Option = model('option', optionSchema);
