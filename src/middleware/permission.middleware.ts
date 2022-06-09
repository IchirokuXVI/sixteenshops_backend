import { Request, Response, NextFunction } from "express";
import { Permission } from "../models/permission";

export const requirePermission = function(permissionName: string) {
    return async function(req: Request, res: Response, next: NextFunction) {
        // let permission = await Permission.findOne({ name: permissionName }).lean();

        // If there isn't a permissions array return 403 because the user doesn't have any permission
        if (!res.locals.tokenInfo.permissions) {
            res.status(403).send();
            return;
        }

        // Loops the permissions array to find a permission with the given name
        let flag = res.locals.tokenInfo.permissions.findIndex((item: any) => item.name == permissionName) != -1;

        // Go to the next middleware if valid or return 403 otherwise
        if (flag)
            next();
        else
            res.status(403).send();
    }
};