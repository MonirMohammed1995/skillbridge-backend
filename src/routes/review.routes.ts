import { Router } from "express";
import { createReview } from "../controllers/review.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router:Router = Router();

router.post("/", requireAuth, requireRole(["STUDENT"]), createReview);

export default router;