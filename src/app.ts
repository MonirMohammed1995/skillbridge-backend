import express, { Application } from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import tutorRoutes from "./routes/tutor.routes";
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import adminRoutes from "./routes/admin.routes";
import categoryRoutes from "./routes/category.routes";
import { errorHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/admin", adminRoutes);
app.use("/api/admin", adminRoutes);

app.use("/tutors", tutorRoutes);
app.use("/tutor", tutorRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);
app.use("/categories", categoryRoutes);

app.use("/api/tutors", tutorRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to SkillBridge API Server!" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "SkillBridge Server is running successfully!" });
});

app.use(errorHandler);

export default app;