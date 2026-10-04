import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Helper: ট্যুটর প্রোফাইল না থাকলে স্বয়ংক্রিয়ভাবে তৈরি (Auto-create) করে নেবে
 */
const getOrCreateTutorProfile = async (userId: string) => {
  let profile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: { category: true },
  });

  if (!profile) {
    // সিড ডাটা থেকে প্রথম ক্যাটাগরি ডিফল্ট হিসেবে নিয়ে নেওয়া
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

// ১. ট্যুটর প্রোফাইল ফেচ করা (অটো-ক্রিয়েট সহ)
export const getTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const profile = await getOrCreateTutorProfile(userId);

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error("Error fetching tutor profile:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ২. ট্যুটর প্রোফাইল এবং বায়ো আপডেট করা
export const updateTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bio, hourlyRate, experience, categoryId } = req.body;

    // প্রথমে নিশ্চিত করা যে প্রোফাইল এক্সিস্ট করে
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

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("Error updating tutor profile:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ৩. অ্যাভেইল্যাবিলিটি টাইম স্লট যোগ করা
export const addTutorAvailability = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { timeSlot } = req.body;

    if (!timeSlot) {
      return res.status(400).json({ message: "Time slot is required" });
    }

    // প্রোফাইল না থাকলে অটো-ক্রিয়েট হবে
    const tutorProfile = await getOrCreateTutorProfile(userId);

    const currentAvailability = (tutorProfile.availability as string[]) || [];
    const updatedAvailability = [...currentAvailability, timeSlot];

    const updatedProfile = await prisma.tutorProfile.update({
      where: { id: tutorProfile.id },
      data: {
        availability: updatedAvailability,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Availability slot added successfully!",
      availability: updatedProfile.availability,
    });
  } catch (error: any) {
    console.error("Error adding availability:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ৪. ট্যুটরের ছাত্র বুকিং বা সেশনগুলো ফেচ করা
export const getTutorSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tutorProfile = await getOrCreateTutorProfile(userId);

    // Booking টেবিল থেকে এই tutorProfile.id এর আন্ডারে থাকা বুকিংগুলো আনা
    const sessions = await prisma.booking.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        student: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ sessions });
  } catch (error: any) {
    console.error("Error fetching tutor sessions:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};