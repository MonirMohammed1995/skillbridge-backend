import { Request, Response } from "express";
import { prisma } from "../util/prisma";

const getOrCreateTutorProfile = async (userId: string) => {
  let profile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: { category: true },
  });

  if (!profile) {
    const defaultCategory = await prisma.category.findFirst();
    
    if (!defaultCategory) {
      throw new Error("No category found in database. Please run database seeding.");
    }

    profile = await prisma.tutorProfile.create({
      data: {
        userId,
        hourlyRate: 50,
        categoryId: defaultCategory.id,
        availability: [],
        bio: "Professional educator dedicated to helping students achieve their learning goals.",
      },
      include: { category: true },
    });
  }

  return profile;
};

export const getTutorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const profile = await getOrCreateTutorProfile(userId);

    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    console.error("Error fetching tutor profile:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const updateTutorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { bio, hourlyRate, experience, categoryId } = req.body;

    await getOrCreateTutorProfile(userId);

    const updatedProfile = await prisma.tutorProfile.update({
      where: { userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
        ...(experience !== undefined && { experience }),
        ...(categoryId !== undefined && { categoryId }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("Error updating tutor profile:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const addTutorAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { timeSlot } = req.body;

    if (!timeSlot) {
      res.status(400).json({ success: false, message: "Time slot is required" });
      return;
    }

    const tutorProfile = await getOrCreateTutorProfile(userId);
    const currentAvailability = (tutorProfile.availability as string[]) || [];
    const updatedAvailability = [...currentAvailability, timeSlot];

    const updatedProfile = await prisma.tutorProfile.update({
      where: { id: tutorProfile.id },
      data: { availability: updatedAvailability },
    });

    res.status(201).json({
      success: true,
      message: "Availability slot added successfully!",
      availability: updatedProfile.availability,
    });
  } catch (error: any) {
    console.error("Error adding availability:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const getTutorSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const tutorProfile = await getOrCreateTutorProfile(userId);

    const sessions = await prisma.booking.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        student: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, sessions });
  } catch (error: any) {
    console.error("Error fetching tutor sessions:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const getAllTutors = async (req: Request, res: Response): Promise<void> => {
  try {
    const tutors = await prisma.tutorProfile.findMany({
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedTutors = tutors.map((t: any) => ({
      ...t,
      name: t.user?.name,
      email: t.user?.email,
      image: t.user?.image,
    }));

    res.status(200).json({ success: true, tutors: formattedTutors });
  } catch (error: any) {
    console.error("Error fetching all tutors:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTutorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tutorId = req.params.id as string;

    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: {
        category: true,
        user: { select: { id: true, name: true, email: true, image: true } },
        reviews: {
          include: { student: { select: { name: true, image: true } } },
        },
      },
    });

    if (!tutor) {
      res.status(404).json({ success: false, message: "Tutor not found" });
      return;
    }

    const tutorAny = tutor as any;
    const formattedTutor = {
      ...tutorAny,
      name: tutorAny.user?.name,
      email: tutorAny.user?.email,
      image: tutorAny.user?.image,
    };

    res.status(200).json({ success: true, tutor: formattedTutor });
  } catch (error: any) {
    console.error("Error fetching tutor by id:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};