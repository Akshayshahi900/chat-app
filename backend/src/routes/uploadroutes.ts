import express , {Request , Response} from 'express';
import { uploadToCloudinary } from '../lib/cloudinary';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../middleware/verifyAuth';

const router = express.Router();
const prisma = new PrismaClient();
