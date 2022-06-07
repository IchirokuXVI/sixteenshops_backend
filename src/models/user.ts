import { Schema, model } from 'mongoose';
import { hashSync } from 'bcrypt';
import { Role } from './role';

const userSchema = new Schema({
    // Emails are saved in lowercase
    email: { type: String, required: true, unique: true, maxlength: 255, set: (email: string) => email.toLowerCase() },
    // Passwords are hashed with bcrypt so their size is always 60
    // Select false makes so that in a query the password isn't selected by default
    password: { type: String, required: true, select: false, set: (pass: string) => hashBCrypt(pass) },
    avatar: { type: String, default: 'user.png' }, // Filename of a default avatar. Null if the avatar is uploaded by the user
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
    permissions: {
        type: [new Schema (
            {
                permission: { type: Schema.Types.ObjectId, ref: 'permission' },
                allow: { type: Boolean }
            }, { _id: false, strict: false } // This might create some problems...
        )],
    },
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

userSchema.post('findOne', async function(result, next) {
    if (result && result.permissions) {
        let permissions: any = [];

        let populated = false;
        
        if (result.role && result.role.permissions) {
            permissions = result.role.permissions;
            populated = true;
        } else if (result.role) {
            let role_id = result.role;

            try {
                let role = (await Role.findOne(role_id).select('permissions').lean());
                permissions = role.permissions;
            } catch (err) { }
        }

        if (result.permissions[0]?.permission?.name)
            populated = true;

        if (populated) {
            for (let permission of result.permissions) {
                if (permission.allow !== null) {
                    let index = permissions.findIndex((item: any) => {
                        if (permission.permission._id) {
                            return item._id.equals(permission.permission._id);
                        } else {
                            return item.equals(permission.permission);
                        }
                    });
        
                    if (permission.allow) {
                        if (index == -1)
                            permissions.push(permission.permission);
                    } else {
                        if (index != -1)
                            permissions.splice(index, 1);
                    }
                }
            }

            result.permissions = permissions;
        }            
    }
    next();
});

export const User = model('users', userSchema);

function hashBCrypt(str: string): string {
    const saltRounds = 10;
    return hashSync(str, saltRounds);
}