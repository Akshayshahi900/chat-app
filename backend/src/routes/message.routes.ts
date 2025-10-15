import express from 'express';
import { getRoomMessages } from '../controllers/message.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = express.Router();

// All message routes require authentication
router.use(verifyAuth);

// GET /api/messages/:roomId - Get messages for a room with pagination
router.get('/:roomId', getRoomMessages);

export default router;