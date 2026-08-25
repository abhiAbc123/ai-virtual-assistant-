# 🤖 JARVIS AI Virtual Assistant (MERN Stack)

An ultra-futuristic, intelligent AI Virtual Assistant built using the **MERN Stack** (MongoDB, Express, React, Node.js), powered by **Google Gemini AI**, **Web Speech API** (Voice Recognition & Voice Synthesis), **JWT + bcryptjs Authentication**, and **Custom Avatar Uploads (Multer + Cloudinary)**.

---

https://ai-virtual-assistant-seven-blue.vercel.app

## 🌟 Key Features

- 🎙️ **Real-Time Voice Input (Speech-To-Text)**:
  - Powered by Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
  - Supports push-to-talk mic orb and hands-free continuous listening.
  - Wake-word detection (e.g. *"Hey Jarvis"*, *"Jarvis"*, or your custom configured wake-word).

- 🔊 **Voice Output (Text-To-Speech)**:
  - Speaks with natural synthesized human voices via Web Speech API (`SpeechSynthesis`).
  - Customizable speech velocity (speed) and pitch.
  - Audio visualizer with real-time waveform reactivity during speech.

- 🧠 **Smart Gemini AI Intelligence**:
  - Connected with Google Gemini AI (`@google/generative-ai`) for advanced conversational intelligence.
  - Contextual conversation memory (remembers previous turns).
  - Configurable AI Personas:
    - **JARVIS**: British Butler, aristocratic, intelligent, dry wit.
    - **NOVA**: Caring, empathetic, encouraging companion.
    - **CYRA**: Cyberpunk netrunner from 2099, edgy and sharp.
    - **ATHENA**: Deep scientific analysis and direct precision.
    - **LOKI**: Sarcastic, humorous quips, and sharp banter.

- ⚡ **Action & Automation Intent Engine**:
  - Detects voice commands and executes actions in the browser:
    - *"Open YouTube"* / *"Play Interstellar soundtrack on YouTube"*
    - *"Open GitHub"* / *"Open Google"* / *"Open Wikipedia"* / *"Open Spotify"*
    - *"What time is it?"* / *"What is today's date?"*
    - *"Calculate 25 * 14"* / math expressions
    - *"Search Google for quantum computing"*

- 🛡️ **JWT + bcryptjs Authentication**:
  - Secure User Signup & Login with password hashing.
  - One-Click **Demo Pilot (Tony Stark)** instant test login.
  - Per-user persisted assistant configurations and chat transcripts in MongoDB.

- 🖼️ **Avatar Customization (Multer + Cloudinary)**:
  - 4 Built-in Cyberpunk & Sci-Fi Avatar presets.
  - Upload custom avatar images via Multer + Cloudinary (with automated local disk storage fallback).

- 🎨 **Futuristic Sci-Fi HUD Interface**:
  - Holographic reactor core and dynamic circular audio wave visualizer.
  - 5 Neon theme accents (JARVIS Cyan, Neon Purple, Solar Gold, Matrix Emerald, Cyber Crimson).
  - Procedural Web Audio API sound effects (wake chimes, telemetry pulses, UI clicks).
  - Full Chat Log Drawer with past voice replay for any previous turn.

---

## 📁 Architecture Overview

```
AI Virtual Assistant/
├── server/
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   ├── cloudinary.js     # Cloudinary configuration
│   │   └── gemini.js         # Google Gemini AI configuration
│   ├── models/
│   │   ├── User.js           # User schema with assistantConfig
│   │   └── ChatHistory.js    # Conversation history schema
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT protection & verification
│   │   └── uploadMiddleware.js # Multer image uploader
│   ├── controllers/
│   │   ├── authController.js # Signup, Login, Demo, Profile
│   │   ├── assistantController.js # Settings, Presets, Cloudinary Upload
│   │   └── chatController.js # Gemini AI, Intent parser, Speech cleaner
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── assistantRoutes.js
│   │   └── chatRoutes.js
│   ├── server.js             # Express application
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top HUD navigation & theme switcher
│   │   │   ├── AssistantAvatar.jsx   # Hologram avatar with status & scanlines
│   │   │   ├── HologramVisualizer.jsx # 360-degree Canvas audio visualizer
│   │   │   ├── VoiceController.jsx   # Mic orb, wake-word toggle & text input
│   │   │   ├── QuickActionGrid.jsx   # Instant protocol shortcuts
│   │   │   ├── ActionBanner.jsx      # Intent execution toast notification
│   │   │   ├── ChatDrawer.jsx        # Full mission transcript with replay
│   │   │   ├── SettingsModal.jsx     # Full calibration & avatar uploader
│   │   │   └── AuthModal.jsx         # Login, Register & Demo Pilot
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── AssistantContext.jsx
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.js
│   │   │   ├── useSpeechSynthesis.js
│   │   │   └── useAudioFx.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── index.css                 # Cyberpunk Sci-Fi Design System
│   └── package.json
└── package.json                      # Monorepo runner
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 2. Configure Environment (`server/.env`)
Create `server/.env` with your API keys:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai_virtual_assistant
JWT_SECRET=your_jwt_secret_key_here

# Google Gemini API Key (Get from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (Optional - local fallback storage is automatic)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Run Application
```bash
# Start both Backend and Frontend concurrently
npm run dev
```

- **Frontend Application**: `http://localhost:5173/`
- **Backend API**: `http://localhost:5000/`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🌐 Deployment

- **Render / Railway (Backend)**: Set root to `server/`, build command `npm install`, start command `node server.js`.
- **Vercel / Netlify (Frontend)**: Set root to `client/`, build command `npm run build`, output directory `dist/`.
