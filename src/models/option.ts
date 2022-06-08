import { Schema, model } from 'mongoose';

// Lots of nullable values because the default values will come from the product
export const optionSchema = new Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true });

export const Option = model('option', optionSchema);
