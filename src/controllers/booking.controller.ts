import { Request, Response } from "express";
import { prisma } from "../util/prisma";

export const createBooking = async (req: Request, res: Response) => {
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
        status: "CONFIRMED",
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let bookings;

    if (user.role === "STUDENT") {
      bookings = await prisma.booking.findMany({
        where: { studentId: user.id },
        include: { tutor: { include: { user: { select: { name: true, email: true } } } } },
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
      });
    } else {
      bookings = await prisma.booking.findMany({
        include: { student: true, tutor: { include: { user: true } } },
      });
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};