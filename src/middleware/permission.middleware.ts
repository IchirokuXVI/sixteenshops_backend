import { Request, Response, NextFunction } from "express";
import { Permission } from "../models/permission";

export const requirePermission = function(permissionName: string) {
    return async function(req: Request, res: Response, next: NextFunction) {
        // let permission = await Permission.findOne({ name: permissionName }).lean();

        if (!res.locals.tokenInfo.permissions) {
            res.status(403).send();
            return;
        }

        let flag = res.locals.tokenInfo.permissions.findIndex((item: any) => item.name == permissionName) != -1;

        if (flag)
            next();
        else
            res.status(403).send();
    }
};