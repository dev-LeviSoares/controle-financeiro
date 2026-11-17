import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

router.get("/me", transactionController.listMine);
router.get("/", transactionController.list);
router.get("/:id", transactionController.getById);
router.post("/", transactionController.create);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.remove);

export default router;
