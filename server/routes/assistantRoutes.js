import express from 'express';
import {
  getPresetAvatars,
  getAssistantSettings,
  updateAssistantSettings,
  uploadAvatar,
} from '../controllers/assistantController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { uploadMemory } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/presets', getPresetAvatars);
router.get('/settings', protect, getAssistantSettings);
router.put('/settings', protect, updateAssistantSettings);
router.post('/upload-avatar', optionalAuth, uploadMemory.single('avatar'), uploadAvatar);

export default router;
