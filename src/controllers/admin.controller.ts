import { Request, Response } from "express";
import { prisma } from "../util/prisma";

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const usersCount = await prisma.user.count();
    const bookingsCount = await prisma.booking.count();
    const tutorsCount = await prisma.tutorProfile.count();

    res.status(200).json({ success: true, usersCount, bookingsCount, tutorsCount });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isBanned: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: { isBanned },
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        student: { select: { name: true, email: true } },
        tutor: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, bookings });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    res.status(201).json({ success: true, category });
  } catch (error: any) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};