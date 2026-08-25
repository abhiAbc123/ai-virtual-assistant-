import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_jarvis_12345'
      );

      const userId = Number(decoded.id);
      if (!isNaN(userId)) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          let assistantConfig = {};
          try {
            assistantConfig =
              typeof user.assistantConfig === 'string'
                ? JSON.parse(user.assistantConfig)
                : user.assistantConfig;
          } catch (e) {
            assistantConfig = {};
          }

          req.user = {
            _id: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            assistantConfig,
          };
          return next();
        }
      }

      // Fallback for demo token if not in DB
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Demo Pilot',
        email: decoded.email || 'pilot@jarvis.ai',
        assistantConfig: {
          name: 'JARVIS',
          avatarUrl: '/assets/avatars/avatar-1.svg',
          themeColor: 'cyan',
          personality: 'jarvis',
          voiceSpeed: 1,
          voicePitch: 1,
          wakeWordEnabled: true,
          wakeWord: 'Jarvis',
        },
      };

      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_jarvis_12345'
      );
      const userId = Number(decoded.id);
      if (!isNaN(userId)) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (user) {
          let assistantConfig = {};
          try {
            assistantConfig =
              typeof user.assistantConfig === 'string'
                ? JSON.parse(user.assistantConfig)
                : user.assistantConfig;
          } catch (e) {}
          req.user = { _id: user.id, id: user.id, name: user.name, email: user.email, assistantConfig };
        }
      }
    } catch (error) {
      // Ignore token failure for optional auth
    }
  }
  next();
};
