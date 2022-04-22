import { Schema, model } from 'mongoose';


const permissionSchema = new Schema({
    name:  { type: String, unique: true, maxlength: 255 },
    description: String
});

export const Permission = model('permission', permissionSchema);