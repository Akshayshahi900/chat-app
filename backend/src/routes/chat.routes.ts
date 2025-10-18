import express from 'express';

import {getChatList} from '../controllers/chat.controller'


import { verifyAuth } from '../middleware/verifyAuth';  

const router = express.Router();

// all chat routes require authentication
router.use(verifyAuth);


//GET /api/chat - get user's chat list
router.get('/' , getChatList);



export default router;






