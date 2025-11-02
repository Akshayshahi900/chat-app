import { Request } from 'express';

// Base User interface that matches your Prisma schema
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Required in database
  username: string;
  About?: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User without password for safe client-side usage
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  username: string;
  About?: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  name: string;
  username: string;
  email: string;
  password: string;
  profilePic?: string;
  About?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: SafeUser;
}

export interface LoginResponse {
  token: string;
  user: SafeUser;
}

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}
