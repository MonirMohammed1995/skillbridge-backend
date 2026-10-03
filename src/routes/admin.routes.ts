import { Router } from "express";
import { getAllUsers, updateUserStatus } from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router:Router = Router();

router.get("/users", requireAuth, requireRole(["ADMIN"]), getAllUsers);
router.patch("/users/:id", requireAuth, requireRole(["ADMIN"]), updateUserStatus);

export default router;