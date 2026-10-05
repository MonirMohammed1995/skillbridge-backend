import { Router } from "express";
import { getUserBookings, createBooking } from "../controllers/booking.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router: Router = Router();

// অথেন্টিকেশন বাধ্যতামূলক
router.use(requireAuth);

// স্টুডেন্ট বা অ্যাডমিন উভয়ই যেন বুকিং লিস্ট দেখতে পারে (getUserBookings ব্যবহার করা হলো)
router.get("/", requireRole(["STUDENT", "ADMIN"]), getUserBookings);
router.post("/", requireRole(["STUDENT"]), createBooking);

export default router;