import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import {
  CreateUserDto,
  LoginCredentials,
  AuthResponse,
  LoginResponse,
  AuthRequest,
  SafeUser
} from '../types/auth';
import { BCRYPT_CONFIG } from '../utils/constants';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Disable caching for auth responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const { name, username, email, password, profilePic, About }: CreateUserDto = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUserByEmail) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Check if username is taken
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUserByUsername) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_CONFIG.saltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        profilePic: profilePic || null,
        About: About || null
      },
    });

    // Create SafeUser without password
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      About: user.About || undefined,
      profilePic: user.profilePic || undefined
    };

    const response: AuthResponse = {
      message: "User created successfully",
      user: safeUser,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        password: true,
        About: true,
        profilePic: true
      }
    });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken({ id: user.id });

    // Create SafeUser without password
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      About: user.About || undefined,
      profilePic: user.profilePic || undefined
    };

    const response: LoginResponse = {
      token,
      user: safeUser
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    // Type assertion to SafeUser
    res.json({ user: user as SafeUser });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message
    });
  }
};