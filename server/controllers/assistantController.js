import { prisma } from '../prisma/client.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

// Preset avatar definitions
export const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    name: 'JARVIS Tactical Android',
    url: '/assets/avatars/avatar-1.svg',
    theme: 'cyan',
    personality: 'jarvis',
    tagline: 'Hyper-intelligent tactical operations & system commander',
  },
  {
    id: 'avatar-4',
    name: 'NOVA Cyber-Girl Biomech',
    url: '/assets/avatars/avatar-4.svg',
    theme: 'gold',
    personality: 'companion',
    tagline: 'Empathetic life, health & mindfulness companion',
  },
  {
    id: 'avatar-3',
    name: 'CYRA Holographic Synth',
    url: '/assets/avatars/avatar-3.svg',
    theme: 'purple',
    personality: 'cyberpunk',
    tagline: '2099 Cyberpunk netrunner & senior code engineer',
  },
  {
    id: 'avatar-2',
    name: 'ATHENA Quantum Mech',
    url: '/assets/avatars/avatar-2.svg',
    theme: 'emerald',
    personality: 'scholar',
    tagline: 'Scientific analysis, logic, mathematics & research brain',
  },
  {
    id: 'avatar-5',
    name: 'LOKI Crimson Jester',
    url: '/assets/avatars/avatar-5.svg',
    theme: 'crimson',
    personality: 'witty',
    tagline: 'Creative storytelling, humor, entertainment & sarcastic wit',
  },
  {
    id: 'avatar-6',
    name: 'ARES Titan Commander',
    url: '/assets/avatars/avatar-6.svg',
    theme: 'orange',
    personality: 'commander',
    tagline: 'Strategic productivity, execution & chief of staff commander',
  },
];

// @desc    Get preset avatars
// @route   GET /api/assistant/presets
// @access  Public
export const getPresetAvatars = async (req, res) => {
  res.json({
    success: true,
    presets: PRESET_AVATARS,
  });
};

// @desc    Get current user's assistant settings
// @route   GET /api/assistant/settings
// @access  Private
export const getAssistantSettings = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.user?._id);
    if (isNaN(userId)) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let assistantConfig = {};
    try {
      assistantConfig =
        typeof user.assistantConfig === 'string'
          ? JSON.parse(user.assistantConfig)
          : user.assistantConfig;
    } catch (e) {
      assistantConfig = {};
    }

    res.json({
      success: true,
      assistantConfig,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update assistant settings (name, personality, voice, theme, etc.)
// @route   PUT /api/assistant/settings
// @access  Private
export const updateAssistantSettings = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.user?._id);
    if (isNaN(userId)) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let currentConfig = {};
    try {
      currentConfig =
        typeof user.assistantConfig === 'string'
          ? JSON.parse(user.assistantConfig)
          : user.assistantConfig;
    } catch (e) {
      currentConfig = {};
    }

    const {
      name,
      avatarUrl,
      avatarType,
      themeColor,
      personality,
      customPrompt,
      voiceName,
      voiceLang,
      voicePitch,
      voiceSpeed,
      wakeWordEnabled,
      wakeWord,
    } = req.body;

    if (name !== undefined) currentConfig.name = name.trim();
    if (avatarUrl !== undefined) currentConfig.avatarUrl = avatarUrl;
    if (avatarType !== undefined) currentConfig.avatarType = avatarType;
    if (themeColor !== undefined) currentConfig.themeColor = themeColor;
    if (personality !== undefined) currentConfig.personality = personality;
    if (customPrompt !== undefined) currentConfig.customPrompt = customPrompt;
    if (voiceName !== undefined) currentConfig.voiceName = voiceName;
    if (voiceLang !== undefined) currentConfig.voiceLang = voiceLang;
    if (voicePitch !== undefined) currentConfig.voicePitch = voicePitch;
    if (voiceSpeed !== undefined) currentConfig.voiceSpeed = voiceSpeed;
    if (wakeWordEnabled !== undefined) currentConfig.wakeWordEnabled = wakeWordEnabled;
    if (wakeWord !== undefined) currentConfig.wakeWord = wakeWord.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { assistantConfig: JSON.stringify(currentConfig) },
    });

    res.json({
      success: true,
      message: 'Assistant settings updated successfully',
      assistantConfig: currentConfig,
    });
  } catch (error) {
    console.error('Update assistant settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload custom assistant avatar (Multer + Cloudinary with local fallback)
// @route   POST /api/assistant/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload',
      });
    }

    let avatarUrl = '';

    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        avatarUrl = result.secure_url;
      } catch (cloudErr) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr.message);
      }
    }

    // Fallback: save buffer locally
    if (!avatarUrl) {
      const uploadDir = path.resolve('uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname) || '.jpg'}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      avatarUrl = `/uploads/${filename}`;
    }

    // Update user profile in Prisma SQLite
    const userId = Number(req.user?.id || req.user?._id);
    if (!isNaN(userId)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        let currentConfig = {};
        try {
          currentConfig =
            typeof user.assistantConfig === 'string'
              ? JSON.parse(user.assistantConfig)
              : user.assistantConfig;
        } catch (e) {}

        currentConfig.avatarUrl = avatarUrl;
        currentConfig.avatarType = 'custom';

        await prisma.user.update({
          where: { id: userId },
          data: { assistantConfig: JSON.stringify(currentConfig) },
        });
      }
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl,
      avatarType: 'custom',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload avatar image',
    });
  }
};
