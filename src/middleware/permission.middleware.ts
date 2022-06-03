import { Request, Response, NextFunction } from "express";
import { Permission } from "../models/permission";

export const requirePermission = function(permissionName: string) {
    return async function(req: Request, res: Response, next: NextFunction) {
        let permission = await Permission.findOne({ name: permissionName }).lean();

        console.log(permission)
        console.log("------------------------------")
        console.log(res.locals.tokenInfo.permissions)

        let flag = res.locals.tokenInfo.permissions.findIndex((item: any) => item._id == permission._id.toString()) != -1;

        if (flag)
            next();
        else
            res.status(403).send();
    }
};

// const requirePermission = function(req: Request, res: Response, next: NextFunction) {
//     if (res.locals.tokenInfo.permissions) {

//     }
//     next();
// }