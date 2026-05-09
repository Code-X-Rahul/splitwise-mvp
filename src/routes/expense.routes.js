import { Router } from "express";
import expenseController from "../controllers/expense.controller";
import authMiddleware from "../middlewares/auth.middleware";

const expenseRoutes = Router();

expenseRoutes.post("/expense", authMiddleware, expenseController.add);
expenseRoutes.get("/expense/activity", authMiddleware, expenseController.activity);
expenseRoutes.get("/expense", authMiddleware, expenseController.get);
expenseRoutes.get("/expense/:id", authMiddleware, expenseController.find);
expenseRoutes.put("/expense/:id", authMiddleware, expenseController.update);
expenseRoutes.delete("/expense/:id", authMiddleware, expenseController.delete);

export { expenseRoutes };
