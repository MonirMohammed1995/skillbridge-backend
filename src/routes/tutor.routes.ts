import { Router } from "express";
import { getTutors, getTutorById, getCategories, updateTutorProfile } from "../controllers/tutor.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router:Router = Router();

router.get("/", getTutors);
router.get("/categories", getCategories);
router.get("/:id", getTutorById);
router.put("/profile", requireAuth, requireRole(["TUTOR"]), updateTutorProfile);

export default router;