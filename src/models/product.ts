import { Schema, model } from 'mongoose';
import { optionGroupSchema } from './optionGroup';
import { Combination } from './combination';

export const productSchema = new Schema({
    name:  String,
    brand: String,
    price: Number,
    images: [String], // Filename of each image of the product
    discount: { type: Number, default: 0 },
    optionGroups: [
        optionGroupSchema
    ]
}, { timestamps: true });

/**
 * Checks if a option was added to the product and calculate the cartesian product
 * to create all possible combinations
 */
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

    // The product got its options changed so calculate all combinations again
    if (updateCombinations) {
        let optionGroups = doc.optionGroups.map((optionGroup: any) => optionGroup.options);

        let cartesian = cartesianProduct(...optionGroups);
        
        console.log(cartesian);
        

        let combinations: { options: string[] }[] = [];

        for (let i = 0; i < cartesian.length; i++) {
            combinations[i] = { options: [] };
            if (Array.isArray(cartesian[i]))
                cartesian[i].forEach((cart: any) => combinations[i].options.push(cart._id));
            else
                combinations[i].options.push(cartesian[i]._id)
        }

        try {
            Combination.insertMany(combinations);
        } catch (e) {
            // TO-DO check if the error is from a unique index else rethrow it
        }
        
    }
});

/**
 * Horrible to understand one-liner from stackoverflow
 * https://stackoverflow.com/a/43053803
 * 
 * I would like to replace this with a more understandable piece of code
 * but it seems this one-liner (even though it could be written in multiple lines)
 * is the most optimal one and it works seamlessly
 */
const cartesianProduct = (...a: any) => a.reduce((a: any, b: any) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

export const Product = model('product', productSchema);
