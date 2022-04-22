import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
    name: { type: String, unique: true, maxlength: 255 },
    description: String,
    // One Way Embedding
    permissions: [{ type: Schema.Types.ObjectId, ref: 'permission' }]
});

export const Role = model('role', roleSchema);
