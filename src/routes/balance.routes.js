import { Router } from "express";
import balanceController from "../controllers/balance.controller";
import authMiddleware from "../middlewares/auth.middleware";

const balanceRoutes = Router();

balanceRoutes.get("/balance", authMiddleware, balanceController.getBalances);

export { balanceRoutes };
