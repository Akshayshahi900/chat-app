import express from 'express';
import { signup, login, getMe } from '../controllers/auth.controller';
import { verifyAuth } from "../middleware/verifyAuth";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/me", verifyAuth, getMe);

export default router;