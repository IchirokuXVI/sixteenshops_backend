import { Schema, model } from 'mongoose';
import { optionGroupSchema } from './optionGroup';
import { Combination } from './combination';

export const productSchema = new Schema({
    name:  String,
    brand: String,
    price: { type: Number, default: 0, set: (value: any) => value === null ? 0 : value },
    stock: { type: Number, default: 0, set: (value: any) => value === null ? 0 : value },
    images: [String], // Filename of each image of the product
    discount: { type: Number, default: 0, set: (value: any) => value === null ? 0 : value },
    optionGroups: [
        optionGroupSchema
    ]
}, { timestamps: true });

productSchema.static("unfillablePaths", function() {
    return [ ];
});

productSchema.static("unqueryablePaths", function() {
    return [ ];
});

/**
 * Checks if a option was added to the product and calculate the cartesian product
 * to create all possible combinations
 */
productSchema.pre('save', async function() {
    let updateCombinations = false;

    // let newOptions: any = {  };

    // this.optionGroups?.forEach((optionGroup: any) => {
    //     if (optionGroup.isNew) {
    //         updateCombinations = true;
    //         return;
    //     }
    // });

    // if (!updateCombinations) {
    //     this.optionGroups?.forEach((optionGroup: any) => {
    //         for (let option of optionGroup.options) {
    //             if (option.isNew) {
    //                 if (!Array.isArray(newOptions[optionGroup.name])) {
    //                     newOptions[optionGroup.name] = [];
    //                 }

    //                 newOptions[optionGroup.name].push(option);

    //                 // Combinations shouldn't be updated if only options are
    //                 // added but it is way easier this way so...
    //                 updateCombinations = true;
    //             }
    //         }
    //     });
    // }

    updateCombinations = this.isModified('optionGroups');

    // A option group was added or removed so the cartesian product must be calculated for everything
    if (updateCombinations) {
        let optionGroups = this.optionGroups.map((optionGroup: any) => optionGroup.options);

        let cartesian = cartesianProduct(...optionGroups);
        
        let combinations: { options: string[] }[] = [];

        for (let i = 0; i < cartesian.length; i++) {
            combinations[i] = { options: [] };
            if (Array.isArray(cartesian[i]))
                cartesian[i].forEach((cart: any) => combinations[i].options.push(cart._id));
            else
                combinations[i].options.push(cartesian[i]._id)
        }

        for (let combination of combinations) {
            Combination.create(combination).catch((err) => err);
        }

        // Replaced insertMany for create because of how array unique indexes works
        // and because the validation is way harder with insertMany
        // Combination.insertMany(combinations).catch(err => console.log(err));
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
