import { Request, Response } from "express";
import { prisma } from "../util/prisma";

export const getTutors = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, minPrice, maxPrice } = req.query;

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId as string;
    if (minPrice || maxPrice) {
      filters.hourlyRate = {};
      if (minPrice) filters.hourlyRate.gte = parseFloat(minPrice as string);
      if (maxPrice) filters.hourlyRate.lte = parseFloat(maxPrice as string);
    }
    if (search) {
      filters.OR = [
        { bio: { contains: search as string, mode: "insensitive" } },
        { user: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    const tutors = await prisma.tutorProfile.findMany({
      where: filters,
      include: {
        user: { select: { name: true, email: true, image: true } },
        category: true,
        reviews: true,
      },
    });

    res.status(200).json({ success: true, data: tutors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTutorById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // এভাবে type assertion করে নিতে হবে
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        category: true,
        reviews: { include: { student: { select: { name: true, image: true } } } },
      },
    });

    if (!tutor) {
      res.status(404).json({ success: false, error: "Tutor not found" });
      return;
    }

    res.status(200).json({ success: true, data: tutor });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bio, hourlyRate, experience, categoryId, availability } = req.body;

    const updatedProfile = await prisma.tutorProfile.upsert({
      where: { userId },
      update: { bio, hourlyRate, experience, categoryId, availability },
      create: { userId, bio, hourlyRate, experience, categoryId, availability },
    });

    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};