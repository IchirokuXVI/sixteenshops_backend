import { Schema, model } from 'mongoose';
import { optionGroupSchema } from './optionGroup';
import { Combination } from './combination';

export const productSchema = new Schema({
    name:  String,
    price: Number,
    discount: { type: Number, default: 0 },
    optionGroups: [
        optionGroupSchema
    ]
}, { timestamps: true });

productSchema.post('save', async function(doc) {
    // doc.optionGroups?.forEach(
    //     (optionGroup: any) =>
    //         optionGroup.options?.forEach((option: any) => {
    //             // Always false... idk why
    //             console.log(option.isNew);
    //         }
    //     )
    // );

    let updateCombinations = false;

    doc.optionGroups?.forEach((optionGroup: any) => {
        if (!updateCombinations && optionGroup.options) {
            updateCombinations = true;
            return;
        }
    });

    if (updateCombinations) {
        let optionGroups = doc.optionGroups.map((optionGroup: any) => optionGroup.options);

        let cartesian = cartesianProduct(...optionGroups);
        
        let combinations: { options: string[] }[] = [];

        for (let i = 0; i < cartesian.length; i++) {
            combinations[i] = { options: [] };
            cartesian[i].forEach((cart: any) => combinations[i].options.push(cart._id));
        }

        try {
            Combination.insertMany(combinations);
        } catch (e) {
            // TO-DO check if the error is from a unique index else rethrow it
        }
        
    }
});

const cartesianProduct = (...a: any) => a.reduce((a: any, b: any) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

export const Product = model('product', productSchema);
