import { Request, Response, NextFunction } from "express";

// Converts an object or array contained in a string with query string format
// For example
// Query string
// permissions.0.permission: 123123123
// permissions.0.allow: false
// permissions.1.permission: 321321321
// permissions.1.allow: true
// Would become
// permissions: [
//    {
//        permission: '123123123',
//        allow: false
//    },
//    {
//        permission: '321321321',
//        allow: true
//    }
// ]
//
// Major problem with the function: an object using both numeric and string keys will cause an error
// Because the function assumes that every "object" using numeric keys is an array
export const parseFormDataObjects = function (req: Request, res: Response, next: NextFunction) {
    for (let [key, value] of Object.entries(req.body)) {
        let parts = key.split('.');

        if (parts.length > 1) {

            let object;

            if (req.body[parts[0]]) {
                object = req.body[parts[0]];
            } else {
                if (isNaN(Number(parts[1])))
                    object = {};
                else
                    object = [];
            }

            req.body[parts[0]] = object;

            for (let i = 1; i < parts.length; i++) {
                if (i == parts.length - 1) {
                    object[parts[i]] = value;
                } else {
                    if (!object[parts[i]]) {
                        // Create an array if the key is numeric
                        if (isNaN(Number(parts[i + 1]))) {
                            object[parts[i]] = {};
                        }
                        else
                            object[parts[i]] = [];
                    }
                }

                object = object[parts[i]];
            }

            delete req.body[key];
        }
    }

    next();
};