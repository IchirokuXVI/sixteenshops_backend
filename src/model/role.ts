import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
    name: { type: String, unique: true, maxlength: 255 },
    description: String,
    // One Way Embedding
    permissions: [{ type: Schema.Types.ObjectId, ref: 'permission' }]
});

roleSchema.static("unfillablePaths", function() {
    return [ ];
})

roleSchema.static("unqueryablePaths", function() {
    return [ ];
})

export const Role = model('role', roleSchema);
