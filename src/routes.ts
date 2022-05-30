import { Router } from "express";
import { permissionsRouter } from "./routes/permissions.routes";
import { productRouter } from "./routes/products.routes";
import { rolesRouter } from "./routes/roles.routes";
import { usersRouter } from "./routes/users.routes";
import { authRouter } from "./routes/auth.routes";

const expressRouter = Router();

expressRouter.use('/auth', authRouter);
expressRouter.use('/users', usersRouter);
expressRouter.use('/roles', rolesRouter);
expressRouter.use('/permissions', permissionsRouter);
expressRouter.use('/products', productRouter);

export const router = expressRouter;

