import { Schema, model } from 'mongoose';


export const permissionSchema = new Schema({
    name:  { type: String, unique: true, maxlength: 255 },
    description: String,
    long_description: String
}, { timestamps: true });

export const Permission = model('permission', permissionSchema);
