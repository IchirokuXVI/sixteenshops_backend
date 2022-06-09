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

// Paths that cannot be updated or set by the user
// when calling endpoints that handles models dinamically
userSchema.static("unfillablePaths", function() {
    return [
        "password",
        "refresh_tokens"
    ];
})

// Paths that be queried by the user
// when calling endpoints that handles models dinamically
userSchema.static("unqueryablePaths", function() {
    return [
        "password",
        "refresh_tokens"
    ];
})

/**
 * Formats the user permissions in a way that is easier
 * to handle for the client.
 * 
 * Only the allowed permissions are listed in the permissions
 * array after the formatting
 * 
 * If the user has an allowed permission it will be always present
 * in the permissions array.
 * 
 * If the user has a null or undefined permission then it will be
 * present only if the user has a role with that permission.
 * 
 * If the user has a denied permission it will never be present
 * in the permissions array.
 * 
 * The final format of the array is:
 * [
 *  {
 *      _id: permission.id,
 *      name: permission.name
 *  },
 *  {
 *      _id: permission.id,
 *      name: permission.name
 *  },
 *  {
 *      ...
 *  }
 * ]
 */
userSchema.post('findOne', async function(result, next) {
    // Check if the query result isn't null and if permissions were selected
    if (result && result.permissions) {
        let permissions: any = [];

        let populated = false;
        
        // Check if the role is populated
        if (result.role && result.role.permissions) {
            // The role is populated so save its permissions to the permissions array
            permissions = result.role.permissions;
            populated = true;
        } else if (false && result.role) { // Disabled because it isn't needed anymore (atleast for now)
            // The role isn't populated. Query for its permissions and save them
            let role_id = result.role;

            try {
                let role = (await Role.findOne(role_id).select('permissions').lean());
                permissions = role.permissions;
            } catch (err) { }
        }

        // Check if the first permission has a name to know if it is populated
        // Cannot check by _id because it will always be true
        if (result.permissions[0]?.permission.name)
            populated = true;

        // Only alter the permissions array if the query was populated
        if (populated) {
            for (let permission of result.permissions) {
                // If permission.allow is null then don't modify it
                // Otherwise keep going
                if (permission.allow !== null) {
                    // Check if the permission is already in the list of permissions
                    let index = permissions.findIndex((item: any) => {
                        if (permission.permission._id) {
                            return item._id.equals(permission.permission._id);
                        } else {
                            return item.equals(permission.permission);
                        }
                    });
        
                    // If the permission is allowed add it to the permissions array
                    // Otherwise remove the permission from the array
                    // Before adding or removing check if the permission is already in the array 
                    if (permission.allow) {
                        if (index == -1)
                            permissions.push(permission.permission);
                    } else {
                        if (index != -1)
                            permissions.splice(index, 1);
                    }
                }
            }

            // Assign the new array to the result to replace the original one
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