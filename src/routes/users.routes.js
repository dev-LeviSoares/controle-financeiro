import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), userController.list);
router.get("/:id/transactions", userController.getTransactions);

export default router;
