import { Request, Response } from "express";
import { prisma } from "../util/prisma";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isBanned: true, createdAt: true },
    });
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isBanned } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isBanned },
    });

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};