import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    assistantConfig: {
      name: {
        type: String,
        default: 'JARVIS',
        trim: true,
      },
      avatarUrl: {
        type: String,
        default: '/assets/avatars/avatar-1.svg',
      },
      avatarType: {
        type: String,
        enum: ['preset', 'custom'],
        default: 'preset',
      },
      themeColor: {
        type: String,
        enum: ['cyan', 'purple', 'gold', 'emerald', 'crimson', 'orange'],
        default: 'cyan',
      },
      personality: {
        type: String,
        enum: ['jarvis', 'companion', 'cyberpunk', 'scholar', 'witty', 'commander', 'ares'],
        default: 'jarvis',
      },
      customPrompt: {
        type: String,
        default: '',
      },
      voiceName: {
        type: String,
        default: '',
      },
      voiceLang: {
        type: String,
        default: 'en-US',
      },
      voicePitch: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 1.5,
      },
      voiceSpeed: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.0,
      },
      wakeWordEnabled: {
        type: Boolean,
        default: true,
      },
      wakeWord: {
        type: String,
        default: 'Jarvis',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
