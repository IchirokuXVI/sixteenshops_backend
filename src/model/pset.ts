import { Schema, model } from 'mongoose';

// Lots of nullable values because the default values will come from the product
const psetSchema = new Schema({
    name:  { type: String, required: false, default: null },
    variants: [{ type: Schema.Types.ObjectId, ref: 'variant' }],
    product: { type: Schema.Types.ObjectId, ref: 'product', required: true }
});

// Sets a compound unique index so that two sets
// cannot have the same name for the same product
// https://stackoverflow.com/questions/16061744/mongoose-how-to-define-a-combination-of-fields-to-be-unique
psetSchema.index({ name: 1, product: 1 }, { unique: true });

export const Pset = model('pset', psetSchema);
