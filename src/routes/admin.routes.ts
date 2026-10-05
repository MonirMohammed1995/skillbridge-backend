import { Router } from "express";
import { getUserBookings, createBooking, cancelBooking } from "../controllers/booking.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(requireAuth);

router.get("/", requireRole(["STUDENT", "TUTOR", "ADMIN"]), getUserBookings);
router.post("/", requireRole(["STUDENT"]), createBooking);
router.patch("/:id/cancel", requireRole(["STUDENT"]), cancelBooking);

export default router;