import { Router } from "express";
import { 
  getTutorProfile, 
  updateTutorProfile, 
  addTutorAvailability, 
  getTutorSessions 
} from "../controllers/tutor.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router: Router = Router();

router.get("/profile", requireAuth, requireRole(["TUTOR"]), getTutorProfile);
router.patch("/profile", requireAuth, requireRole(["TUTOR"]), updateTutorProfile);
router.post("/availability", requireAuth, requireRole(["TUTOR"]), addTutorAvailability);
router.get("/sessions", requireAuth, requireRole(["TUTOR"]), getTutorSessions);

export default router;