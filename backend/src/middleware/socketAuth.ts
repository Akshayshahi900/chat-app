import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { SocketData } from '../types/socket';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, name: true, email: true }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user data to socket
    socket.data = {
      userId: user.id,
      username: user.username
    } as SocketData;

    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};