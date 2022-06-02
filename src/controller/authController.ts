import { User } from '../models/user';
import { Request, Response, NextFunction } from 'express';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';


export class AuthController {
    // TO-DO move secret to environment
    private static SECRET_ACCESS = "zCzV.9o83#-xSDPW,nn(z7DBJ";
    private static SECRET_REFRESH = "n51Is!TDtxRC%*CM8nnguJspd6ej.PVep2Qf(s5NZ,bw=F8rEDQ4WXETnO4Q#&Hz<";

    static async login(req: Request, res: Response, next: NextFunction) {
        const email: string = req.body.email;
        const password: string = req.body.password;

        if (!email || !password) {
            res.status(400).send();
            return;
        }
        
        const user = await User.findOne({email: email}).select("+password");

        if (!user) {
            res.status(401).send();
            return;
        }

        const match: boolean = await compare(password, user.password);

        if (!match) {
            res.status(401).send();
            return;
        }

        res.send(await AuthController.generateTokens(user, req.get('User-Agent')));
    }

    static async logConnection(req: Request, res: Response, next: NextFunction) {
        if (res.locals.tokenInfo) {
            User.updateOne({ _id: res.locals.tokenInfo._id || res.locals.tokenInfo.user_id }, { $set: { lastConnection: Date.now() } }).exec();
        }
        next();
    }
    
    static async parseToken(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            next();
            return;
        }
        
        let token = req.headers.authorization!.split(' ')[1];
        
        try {
            res.locals.tokenInfo = jwt.verify(token, AuthController.SECRET_ACCESS);
            next();
        } catch (e) {
            delete res.locals.tokenInfo;
            next();
        }
    };

    static async verifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            if (res.locals.tokenInfo) {
                next();
                return;
            } else
                throw new Error("invalid token");
        } catch (e) {
            res.status(401).send();
        }
    }

    static async checkToken(req: Request, res: Response, next: NextFunction) {
        res.send(res.locals.tokenInfo);
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            res.status(400);
            return;
        }

        try {
            let token = req.headers.authorization.split(' ')[1];

            const oldPayload: any = jwt.verify(token, AuthController.SECRET_REFRESH);

            if (!oldPayload) {
                res.status(403);
                return;
            }

            let signature = token.split('.')[2];

            let user = await User.findOne({ _id: oldPayload.user_id, "refresh_tokens.signature": signature })
                                    .select({ id: 1, email: 1, role: 1, permissions: 1, refresh_tokens: { $elemMatch: { signature: signature } } });

            if (!user) {
                throw new Error("token not found");
            }
            
            if (!user.refresh_tokens[0].status) {
                // $[] Modifica todos los elementos del array
                // https://www.mongodb.com/docs/manual/reference/operator/update/positional-all/
                await User.updateOne({ _id: user._id }, { $set: { "refresh_tokens.$[].status": false } });
                throw new Error("expired token");
            }

            let tokens = await AuthController.generateTokens(user, req.get('User-Agent'));

            res.send(tokens);
        } catch (e) {
            next(e);
        }
    }

    private static async generateTokens(user: any, userAgent: any): Promise<{ refresh_token: string, access_token: string, user: any }> {
        const payload = {
            _id: user._id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        }

        // Expires in 600 seconds (10 minutes)
        // iat claim added automatically
        const accessToken = jwt.sign(payload, AuthController.SECRET_ACCESS, { expiresIn: 16 });
        const refreshToken = jwt.sign({ user_id: user._id }, AuthController.SECRET_REFRESH, { expiresIn: "3 days" });

        await User.updateOne({ _id: user._id }, {
            $set: {
                "refresh_tokens.0.status": false
            }
        });

        await User.updateOne({ _id: user._id }, {
            $push: {
                refresh_tokens: {
                    signature: refreshToken.split(".")[2], user_agent: userAgent
                }
            }
        });

        return { refresh_token: refreshToken, access_token: accessToken, user: user };
    }
}
