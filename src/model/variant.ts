import { Schema, model } from 'mongoose';

// Lots of nullable values because the default values will come from the product
const variantSchema = new Schema({
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    pset: { type: Schema.Types.ObjectId, ref: 'pset', required: true }
});

// Sets a compound unique index so that two variants
// cannot have the same name in the same set
// https://stackoverflow.com/questions/16061744/mongoose-how-to-define-a-combination-of-fields-to-be-unique
variantSchema.index({ name: 1, set: 1 }, { unique: true });

export const Variant = model('variant', variantSchema);
