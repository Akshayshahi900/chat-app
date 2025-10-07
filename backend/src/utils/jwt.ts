import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "secret123",
  expiresIn: "7d"
};

export const generateToken = (payload: { id: string }): string => {
  return jwt.sign(payload, JWT_CONFIG.secret, { 
    expiresIn: JWT_CONFIG.expiresIn 
  } as jwt.SignOptions); // Add type assertion
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_CONFIG.secret) as JwtPayload;
};