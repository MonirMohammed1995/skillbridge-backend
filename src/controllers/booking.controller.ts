import { Request, Response } from "express";
import { prisma } from "../util/prisma";

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { tutorId, date, startTime, endTime } = req.body;

    const booking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        date: new Date(date),
        startTime,
        endTime,
        status: "PENDING",
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let bookings;

    if (user.role === "STUDENT") {
      bookings = await prisma.booking.findMany({
        where: { studentId: user.id },
        include: { tutor: { include: { user: { select: { name: true, email: true } } } } },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "TUTOR") {
      const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
      if (!tutorProfile) {
        res.status(404).json({ success: false, error: "Tutor profile not found" });
        return;
      }
      bookings = await prisma.booking.findMany({
        where: { tutorId: tutorProfile.id },
        include: { student: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      bookings = await prisma.booking.findMany({
        include: { student: true, tutor: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    res.status(200).json({ success: true, bookings, data: bookings });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    if (!id) {
      res.status(400).json({ success: false, error: "Booking ID is required" });
      return;
    }

    const userId = (req as any).user.id;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.status(404).json({ success: false, error: "Booking not found" });
      return;
    }

    if (booking.studentId !== userId) {
      res.status(403).json({ success: false, error: "Unauthorized to cancel this booking" });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};