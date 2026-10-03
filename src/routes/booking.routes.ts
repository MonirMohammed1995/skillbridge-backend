import { Router } from "express";
import { createBooking, getUserBookings } from "../controllers/booking.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/", requireAuth, createBooking);
router.get("/", requireAuth, getUserBookings);

export default router;