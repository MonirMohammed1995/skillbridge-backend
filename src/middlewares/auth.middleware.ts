import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({ error: "Unauthorized access. Please login." });
      return;
    }
    if ((session.user as any).isBanned) {
      res.status(403).json({ error: "Your account has been banned by admin." });
      return;
    }

    (req as any).user = session.user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error during authentication." });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Access forbidden: Insufficient permissions." });
      return;
    }
    next();
  };
};