import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, SafeUser } from '../types/auth';
import { verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        About: true,
        profilePic: true
      }
    });
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Type assertion to SafeUser since we're excluding password
    req.user = user as SafeUser;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};