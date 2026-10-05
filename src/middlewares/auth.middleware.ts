import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../util/prisma";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isBanned?: boolean;
    name?: string;
  };
  session?: any;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // বেটার অথ থেকে সেশন ফেচ করার চেষ্টা
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      console.warn("Auth Warning: No session found in request headers. Headers:", req.headers.cookie);
      res.status(401).json({ error: "Unauthorized access. Please login again." });
      return;
    }

    // ডেটাবেজ থেকে সরাসরি ইউজারের লেটেস্ট স্ট্যাটাস ও রোল ফেচ করা
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, role: true, isBanned: true, name: true },
    });

    if (!dbUser) {
      res.status(401).json({ error: "User not found in database." });
      return;
    }

    if (dbUser.isBanned) {
      res.status(403).json({ error: "Your account has been banned by admin." });
      return;
    }

    // রিকোয়েস্ট অবজেক্টে লেটেস্ট ডাটাবেজ ইউজার যুক্ত করে দেওয়া
    req.user = dbUser;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ error: "Internal server error during authentication." });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    // ডিবাগ করার জন্য কনসোলে রোল প্রিন্ট করবে
    console.log(`Role Check -> Required: [${roles.join(", ")}], User Role: ${user?.role || "None"}`);

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ 
        error: `Access forbidden: Required role [${roles.join(", ")}], but got [${user?.role || "None"}]` 
      });
      return;
    }
    next();
  };
};