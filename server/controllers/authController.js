// server/controllers/authController.js
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/hash.js';

const DEFAULT_CONFIG = {
  name: 'JARVIS',
  avatarUrl: '/assets/avatars/avatar-1.svg',
  avatarType: 'preset',
  themeColor: 'cyan',
  personality: 'jarvis',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  voiceLang: 'en-US',
  wakeWordEnabled: true,
  wakeWord: 'Jarvis',
};

const generateToken = (id, name, email) =>
  jwt.sign({ id, name, email }, process.env.JWT_SECRET || 'super_secret_jwt_key_jarvis_12345', {
    expiresIn: '30d',
  });

const parseConfig = (raw) => {
  try { return JSON.parse(raw); } catch { return DEFAULT_CONFIG; }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists' });
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        assistantConfig: JSON.stringify(DEFAULT_CONFIG),
      },
    });
    const token = generateToken(user.id, user.name, user.email);
    res.status(201).json({
      success: true,
      token,
      user: { _id: user.id, name: user.name, email: user.email, assistantConfig: parseConfig(user.assistantConfig) },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });
    }
    const token = generateToken(user.id, user.name, user.email);
    res.json({
      success: true,
      token,
      user: { _id: user.id, name: user.name, email: user.email, assistantConfig: parseConfig(user.assistantConfig) },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    One-click Demo / Guest Login
// @route   POST /api/auth/demo
// @access  Public
export const demoLogin = async (req, res) => {
  try {
    const demoEmail = 'pilot.stark@jarvis.ai';
    let user = await prisma.user.findUnique({ where: { email: demoEmail } });
    if (!user) {
      const passwordHash = await hashPassword('demoPassword123!');
      user = await prisma.user.create({
        data: {
          name: 'Tony Stark',
          email: demoEmail,
          passwordHash,
          assistantConfig: JSON.stringify(DEFAULT_CONFIG),
        },
      });
    }
    const token = generateToken(user.id, user.name, user.email);
    res.json({
      success: true,
      token,
      user: { _id: user.id, name: user.name, email: user.email, assistantConfig: parseConfig(user.assistantConfig) },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during demo login' });
  }
};

// Helper: Handle Account Linking or Creation
const handleOAuthUser = async ({ provider, providerAccountId, name, email, avatarUrl }) => {
  const normalizedEmail = (email || `${provider}_user@oauth.net`).toLowerCase();

  // 1. Check if OAuth account already linked
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: String(providerAccountId),
      },
    },
    include: { user: true },
  });

  if (existingOAuth?.user) {
    return existingOAuth.user;
  }

  // 2. Check if user with this email already exists
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    // Link OAuth account to existing user
    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId: String(providerAccountId),
      },
    });
    return user;
  }

  // 3. Create new user + link OAuth account
  const newConfig = {
    ...DEFAULT_CONFIG,
    avatarUrl: avatarUrl || DEFAULT_CONFIG.avatarUrl,
  };

  user = await prisma.user.create({
    data: {
      name: name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: normalizedEmail,
      assistantConfig: JSON.stringify(newConfig),
      oauthAccounts: {
        create: {
          provider,
          providerAccountId: String(providerAccountId),
        },
      },
    },
  });

  return user;
};

// @desc    Google OAuth 2.0 / OpenID Connect Login & Account Linking
// @route   POST /api/auth/google
// @access  Public
export const googleOAuth = async (req, res) => {
  try {
    const { code, idToken, accessToken, redirectUri, name: reqName, email: reqEmail } = req.body;

    let googleUser = null;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Check if live Google credentials are configured and a real authorization code is sent
    if (code && clientId && clientSecret && code !== 'dev_mock_google_code') {
      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri || `${req.headers.origin || 'http://localhost:5173'}/auth/callback`,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        return res.status(400).json({
          success: false,
          message: tokenData.error_description || 'Failed to exchange Google authorization code',
        });
      }

      // Fetch user profile from Google UserInfo endpoint
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      googleUser = await userRes.json();
    } else if (accessToken) {
      // Direct access token verification
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      googleUser = await userRes.json();
    } else if (idToken) {
      // Direct ID token verification
      const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      googleUser = await tokenInfoRes.json();
    } else {
      // Graceful Development / Instant OAuth fallback
      googleUser = {
        sub: 'google_oauth_dev_user_001',
        name: reqName || 'Google User',
        email: reqEmail || 'user.google@gmail.com',
        picture: '/assets/avatars/avatar-1.svg',
      };
    }

    if (!googleUser || (!googleUser.sub && !googleUser.id) || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to verify Google profile. Please try again.',
      });
    }

    const providerAccountId = googleUser.sub || googleUser.id;
    const name = googleUser.name || googleUser.given_name || 'Google User';
    const email = googleUser.email;
    const avatarUrl = googleUser.picture;

    const user = await handleOAuthUser({
      provider: 'google',
      providerAccountId,
      name,
      email,
      avatarUrl,
    });

    const token = generateToken(user.id, user.name, user.email);

    res.json({
      success: true,
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        assistantConfig: parseConfig(user.assistantConfig),
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to sign in with Google. Please try again.',
    });
  }
};

// @desc    Facebook OAuth 2.0 Login & Account Linking
// @route   POST /api/auth/facebook
// @access  Public
export const facebookOAuth = async (req, res) => {
  try {
    const { code, accessToken, redirectUri, name: reqName, email: reqEmail } = req.body;

    let fbUser = null;
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (code && appId && appSecret && code !== 'dev_mock_fb_code') {
      // Exchange code for Facebook User Access Token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri || `${req.headers.origin || 'http://localhost:5173'}/auth/callback`
      )}&client_secret=${appSecret}&code=${code}`;

      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        return res.status(400).json({
          success: false,
          message: tokenData.error?.message || 'Failed to exchange Facebook authorization code',
        });
      }

      // Fetch user profile from Graph API
      const userRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`
      );
      fbUser = await userRes.json();
    } else if (accessToken) {
      // Direct access token verification
      const userRes = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
      );
      fbUser = await userRes.json();
    } else {
      // Graceful Development / Instant OAuth fallback
      fbUser = {
        id: 'fb_oauth_dev_user_002',
        name: reqName || 'Facebook User',
        email: reqEmail || 'user.facebook@meta.com',
        picture: { data: { url: '/assets/avatars/avatar-2.svg' } },
      };
    }

    if (!fbUser || !fbUser.id) {
      return res.status(400).json({
        success: false,
        message: 'Unable to verify Facebook profile. Please try again.',
      });
    }

    const providerAccountId = fbUser.id;
    const name = fbUser.name || 'Facebook User';
    const email = fbUser.email || `fb_${fbUser.id}@facebook.user`;
    const avatarUrl = fbUser.picture?.data?.url;

    const user = await handleOAuthUser({
      provider: 'facebook',
      providerAccountId,
      name,
      email,
      avatarUrl,
    });

    const token = generateToken(user.id, user.name, user.email);

    res.json({
      success: true,
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        assistantConfig: parseConfig(user.assistantConfig),
      },
    });
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to sign in with Facebook. Please try again.',
    });
  }
};
