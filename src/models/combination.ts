import { Schema, model } from 'mongoose';

// Lots of nullable values because the default values will come from the product
const combinationSchema = new Schema({
    name:  { type: String, default: null },
    price: { type: Number, default: null },
    discount: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    options: { type: [{ type: Schema.Types.ObjectId, ref: 'product.optionsGroups.options' }] }
}, { timestamps: true });

combinationSchema.pre('save', async function() {
    let dupe = await Combination.exists({ options: this.options });

    if (dupe)
        throw new Error("Combination with those options already exists");
});

export const Combination = model('combination', combinationSchema);
