import { Router } from "express";
import { 
  getAllTutors,
  getTutorById,
  getTutorProfile, 
  updateTutorProfile, 
  addTutorAvailability, 
  getTutorSessions 
} from "../controllers/tutor.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router: Router = Router();

// পাবলিক রুটসমূহ
router.get("/", getAllTutors);
router.get("/:id", getTutorById);

// প্রোটেক্টড ট্যুটর রুটসমূহ
router.get("/profile", requireAuth, requireRole(["TUTOR"]), getTutorProfile);
router.patch("/profile", requireAuth, requireRole(["TUTOR"]), updateTutorProfile);
router.post("/availability", requireAuth, requireRole(["TUTOR"]), addTutorAvailability);
router.get("/sessions", requireAuth, requireRole(["TUTOR"]), getTutorSessions);

export default router;