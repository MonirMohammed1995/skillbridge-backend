import express, { Application } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import tutorRoutes from "./routes/tutor.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Better Auth API routes
app.all("/api/auth/*splat", toNodeHandler(auth));

// Application API Routes
app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to SkillBridge API Server!" });
});
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "SkillBridge Server is running successfully!" });
});

// Global Error Handler
app.use(errorHandler);

export default app;