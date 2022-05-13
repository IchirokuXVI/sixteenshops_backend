import { Schema, model } from 'mongoose';
import { hashSync } from 'bcrypt';

const userSchema = new Schema({
    // Emails are saved in lowercase
    email: { type: String, required: true, unique: true, maxlength: 255, set: (email: string) => email.toLowerCase() },
    // Passwords are hashed with bcrypt so their size is always 60
    // Select false makes so that in a query the password isn't selected by default
    password: { type: String, required: true, select: false, set: (pass: string) => hashBCrypt(pass) },
    name: String,
    phone: String,
    lastConnection: Date,
    refresh_tokens: {
        type: [{
            signature: { type: String, required: true },
            status: { type: Boolean, default: true },
            user_agent: { type: String, required: true },
            issued_at: { type: Date, default: Date.now() }
        }],
        select: false
    },
    role: { type: Schema.Types.ObjectId, ref: 'role' },
    // One Way Embedding
    // http://learnmongodbthehardway.com/schema/schemabasics/#:~:text=as%20a%20strategy.-,One%20Way%20Embedding,-The%20One%20Way
    permissions: [{
        permission: { type: Schema.Types.ObjectId, ref: 'permission' },
        allow: { type: Boolean, required: true }
    }],
}, { timestamps: true });

userSchema.static("unfillablePaths", function() {
    return [
        "password",
        "refresh_tokens"
    ];
})

userSchema.static("unqueryablePaths", function() {
    return [
        "password",
        "refresh_tokens"
    ];
})

export const User = model('users', userSchema);

function hashBCrypt(str: string): string {
    const saltRounds = 10;
    return hashSync(str, saltRounds);
}