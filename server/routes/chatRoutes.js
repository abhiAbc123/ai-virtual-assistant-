import express from 'express';
import {
  sendMessage,
  sendVoiceMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chatController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', optionalAuth, sendMessage);
router.post('/voice', optionalAuth, sendVoiceMessage);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);

export default router;
