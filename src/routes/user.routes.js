import { Router } from "express";
import userController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";

const userRoutes = Router();

userRoutes.post("/user", userController.add);
userRoutes.get("/user/profile", authMiddleware, userController.profile);
userRoutes.get("/user", userController.get);
userRoutes.get("/user/:id", userController.find);
userRoutes.patch("/user", authMiddleware, userController.update);
userRoutes.delete("/user", authMiddleware, userController.delete);

export { userRoutes };
