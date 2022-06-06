import { User } from '../models/user';
import { Request, Response, NextFunction } from 'express';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';


export class AuthController {
    // TO-DO move secret to environment
    private static SECRET_ACCESS = "zCzV.9o83#-xSDPW,nn(z7DBJ";
    private static SECRET_REFRESH = "n51Is!TDtxRC%*CM8nnguJspd6ej.PVep2Qf(s5NZ,bw=F8rEDQ4WXETnO4Q#&Hz<";

    static async register(req: Request, res: Response, next: NextFunction) {
        User.validate(req.body).then(async () => {
            let object = new User({ email: req.body.email, password: req.body.password });
            
            try {
                await object.save();
    
                res.status(201).send();
            } catch (e) {
                next(e);
                return;
            }
        }, (err: any) => next(err));
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const email: string = req.body.email;
        const password: string = req.body.password;

        if (!email || !password) {
            res.status(400).send();
            return;
        }
        
        let user = await User.findOne({ email: email }, null, { strict: false })
        .select({ id: 1, email: 1, password: 1, role: 1, permissions: 1 })
        .populate({
            path: 'role',
            // Get friends of friends - populate the 'friends' array for every friend
            populate: { path: 'permissions', select: 'name' }
        }).populate({
            path: 'permissions.permission',
            select: 'name'
        });

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

    static async logout(req: Request, res: Response, next: NextFunction) {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            try {
                let token = req.headers.authorization.split(' ')[1];

                const payload: any = jwt.verify(token, AuthController.SECRET_REFRESH);
        
                if (!payload) {
                    res.status(403);
                    return;
                }
        
                let signature = token.split('.')[2];

                User.updateOne({ _id: payload.user_id, "refresh_tokens.signature": signature  }, {
                    $set: {
                        "refresh_tokens.$.status": false
                    }
                }).exec();
            } catch (err) {
                next(err);
                return;
            }
        }

        res.send(204);
    }

    /**
     * Middleware to keep track of the last user connection
     * @param req 
     * @param res 
     * @param next 
     */
    static async logConnection(req: Request, res: Response, next: NextFunction) {
        if (res.locals.tokenInfo) {
            User.updateOne({ _id: res.locals.tokenInfo._id || res.locals.tokenInfo.user_id }, { $set: { lastConnection: Date.now() } }).exec();
        }
        next();
    }
    
    /**
     * Middleware to parse the token in the Authorization header if present
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
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

            let user = await User.findOne({ _id: oldPayload.user_id, "refresh_tokens.signature": signature }, null, { strict: false })
                                    .select({ id: 1, email: 1, role: 1, permissions: 1, refresh_tokens: { $elemMatch: { signature: signature } } })
                                    .populate({
                                        path: 'role',
                                        // Get friends of friends - populate the 'friends' array for every friend
                                        populate: { path: 'permissions', select: 'name' }
                                    }).populate({
                                        path: 'permissions.permission',
                                        select: 'name'
                                    });

            if (!user) {
                throw new Error("token not found");
            }
            
            if (!user.refresh_tokens[0].status) {
                // $[] Modifica todos los elementos del array
                // https://www.mongodb.com/docs/manual/reference/operator/update/positional-all/
                await User.updateOne({ _id: user._id }, { $set: { "refresh_tokens.$[].status": false } });
                throw new Error("invalid token");
            }

            delete user.refresh_tokens;

            let tokens = await AuthController.generateTokens(user, req.get('User-Agent'), signature);

            res.send(tokens);
        } catch (e) {
            next(e);
        }
    }

    /**
     * Gets a new pair of tokens for a given user
     * Updates the user to revoke the previous token and add the new one
     * @param user The owner of the tokens
     * @param userAgent Browser that requested the tokens
     * @param oldSignature Previous token that generated this request
     * @returns 
     */
    private static async generateTokens(user: any, userAgent: any, oldSignature?: string): Promise<{ refresh_token: string, access_token: string, user: any }> {
        const access_payload = {
            _id: user._id,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        };

        const refresh_payload = {
            user_id: user._id,
            // Generate a unique id for the token so even if two refresh tokens are generated
            // in the same second they will have different signatures
            token_id: new Types.ObjectId()
        };

        // Expires in 600 seconds (10 minutes)
        // iat claim added automatically
        const accessToken = jwt.sign(access_payload, AuthController.SECRET_ACCESS, { expiresIn: 16 });
        const refreshToken = jwt.sign(refresh_payload, AuthController.SECRET_REFRESH, { expiresIn: "3 days" });

        if (oldSignature) {
            // https://www.mongodb.com/docs/manual/reference/operator/update/positional/
            await User.updateOne({ _id: user._id, "refresh_tokens.signature": oldSignature  }, {
                $set: {
                    "refresh_tokens.$.status": false
                }
            });
        }

        await User.updateOne({ _id: user._id }, {
            $push: {
                refresh_tokens: {
                    _id: refresh_payload.token_id, // Get the generated id from the payload
                    signature: refreshToken.split(".")[2], user_agent: userAgent
                }
            }
        });

        return { refresh_token: refreshToken, access_token: accessToken, user: access_payload };
    }
}
