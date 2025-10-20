import express from 'express';
import { getRoomMessages, uploadFile } from '../controllers/message.controller';
import { verifyAuth } from '../middleware/verifyAuth';
import { upload } from '../middleware/upload';

const router = express.Router();

// All message routes require authentication
router.use(verifyAuth);

// GET /api/messages/:roomId - Get messages for a room with pagination
router.get('/:roomId', getRoomMessages);
router.post('/upload',upload.single('file'), uploadFile);
export default router;