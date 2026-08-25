import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  demoLogin,
  googleOAuth,
  facebookOAuth,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', demoLogin);
router.post('/google', googleOAuth);
router.post('/facebook', facebookOAuth);
router.get('/me', protect, getMe);

export default router;
