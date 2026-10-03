import { Request, Response } from "express";
import { prisma } from "../util/prisma";

export const createReview = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const { tutorId, rating, comment } = req.body;

    const review = await prisma.review.create({
      data: { studentId, tutorId, rating, comment },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};