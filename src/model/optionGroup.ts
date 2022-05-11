import { Schema, model } from 'mongoose';
import { optionSchema } from './option';

// Lots of nullable values because the default values will come from the product
export const optionGroupSchema = new Schema({
    name:  { type: String, required: false, unique: true },
    options: [
        optionSchema
    ],
});