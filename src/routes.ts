import { Router } from "express";
import { permissionsRouter } from "./routes/permissions";
import { productRouter } from "./routes/product";
import { rolesRouter } from "./routes/roles";
import { usersRouter } from "./routes/users";
import { authRouter } from "./routes/auth";

const expressRouter = Router();

expressRouter.use('/auth', authRouter);
expressRouter.use('/users', usersRouter);
expressRouter.use('/roles', rolesRouter);
expressRouter.use('/permissions', permissionsRouter);
expressRouter.use('/products', productRouter);

export const router = expressRouter;

