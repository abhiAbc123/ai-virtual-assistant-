import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssistant } from '../context/AssistantContext';
import { HologramVisualizer } from './HologramVisualizer';
import { SettingsModal } from './SettingsModal';
import { ProfileDropdown } from './ProfileDropdown';
import { 
  Mic, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Settings, 
  Trash2, 
  ExternalLink, 
  Radio, 
  Cpu, 
  Video, 
  Code2, 
  Calculator, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  X, 
  Palette, 
  MessageSquare, 
  Atom, 
  Terminal,
  Edit3,
  Copy,
  Check,
  Globe,
  Bot,
  User as UserIcon,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { isFemaleVoice } from '../hooks/useSpeechSynthesis';

export const UnifiedDashboard = ({ onSwitchAssistant }) => {
  const { user, logout } = useAuth();
  const {
    assistantConfig,
    assistantState,
    messages,
    liveTranscript,
    activeAction,
    setActiveAction,
    isMuted,
    setIsMuted,
    voices,
    isListening,
    audioVolume,
    speechRecError,
    toggleListening,
    processUserPrompt,
    updateSettings,
    clearHistory,
    audioFx,
  } = useAssistant();

  const [inputVal, setInputVal] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll conversation to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript]);

  // Sync spoken words directly into the input textbox in real-time
  useEffect(() => {
    if (liveTranscript) {
      setInputVal(liveTranscript);
    }
  }, [liveTranscript]);

  const themes = [
    { id: 'indigo', name: 'Siri Violet', color: '#6366f1' },
    { id: 'cyan', name: 'Jarvis Blue', color: '#2563eb' },
    { id: 'teal', name: 'Cyber Teal', color: '#0891b2' },
    { id: 'purple', name: 'Amethyst Purple', color: '#7c3aed' },
    { id: 'gold', name: 'Solar Amber', color: '#d97706' },
    { id: 'emerald', name: 'Emerald Green', color: '#059669' },
    { id: 'crimson', name: 'Ruby Crimson', color: '#e11d48' },
    { id: 'orange', name: 'Titan Orange', color: '#ea580c' },
  ];

  const getProtocolsForAssistant = () => {
    const p = assistantConfig.personality || 'companion';
    if (p === 'cyberpunk') {
      return [
        { label: 'Debug React Code', subtitle: '"Analyze code for bugs & optimizations"', prompt: 'Analyze this code snippet for bugs and performance optimizations', icon: Code2, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
        { label: 'Explain Regex', subtitle: '"Explain regular expressions with examples"', prompt: 'Explain regular expressions syntax and provide practical examples', icon: Terminal, iconColor: 'text-pink-600', iconBg: 'bg-pink-50' },
        { label: 'Open GitHub', subtitle: '"Open GitHub repository"', prompt: 'Open GitHub', icon: Video, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
        { label: 'Optimize Database', subtitle: '"Optimize SQL queries & indexing"', prompt: 'How do I optimize complex SQL queries and indexing?', icon: Calculator, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
      ];
    }
    if (p === 'scholar') {
      return [
        { label: 'Calculate 25 * 14', subtitle: '"Calculate math equations"', prompt: 'Calculate 25 * 14', icon: Calculator, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
        { label: 'Quantum Physics', subtitle: '"Explain quantum superposition"', prompt: 'Explain quantum superposition and entanglement concisely', icon: Atom, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
        { label: 'Open Wikipedia', subtitle: '"Open Wikipedia website"', prompt: 'Open Wikipedia', icon: Video, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
        { label: 'Math Equation', subtitle: '"Calculate (144 / 12) * 8 + 50"', prompt: 'Calculate (144 / 12) * 8 + 50', icon: Calculator, iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
      ];
    }
    return [
      { label: 'Open YouTube', subtitle: '"Open YouTube and search videos"', prompt: 'Open YouTube', icon: Video, iconColor: 'text-red-500', iconBg: 'bg-red-50' },
      { label: 'Calculate 15 * 84', subtitle: '"Calculate 15 * 84"', prompt: 'Calculate 15 * 84', icon: Calculator, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
      { label: 'Search AI News', subtitle: '"Search Google for latest technology news"', prompt: 'Search Google for latest technology news', icon: Search, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
      { label: 'Open GitHub', subtitle: '"Open GitHub repository"', prompt: 'Open GitHub', icon: Code2, iconColor: 'text-slate-700', iconBg: 'bg-slate-100' },
    ];
  };

  const quickProtocols = getProtocolsForAssistant();

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    if (audioFx?.playClick) audioFx.playClick();
    processUserPrompt(inputVal.trim());
    setInputVal('');
  };

  const handleSaveEdit = (idx) => {
    if (!editingText.trim()) return;
    if (audioFx?.playClick) audioFx.playClick();
    const revisedText = editingText.trim();
    setEditingIdx(null);
    processUserPrompt(revisedText);
  };

  const handleCopy = (text, idx) => {
    if (audioFx?.playClick) audioFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleReplayVoice = (text, forcedGender) => {
    if (audioFx?.playClick) audioFx.playClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const isFemale =
        forcedGender === 'female' ||
        (!forcedGender && (assistantConfig.voiceGender === 'female' || assistantConfig.voicePitch > 1.1));

      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = assistantConfig.voiceSpeed || (isFemale ? 1.05 : 1.0);
      utt.pitch = isFemale ? 1.25 : (assistantConfig.voicePitch || 0.95);
      utt.lang = assistantConfig.voiceLang || 'en-US';

      if (voices.length > 0) {
        if (isFemale) {
          const femVoice = voices.find((v) => (assistantConfig.voiceLang?.startsWith('hi') ? v.lang.startsWith('hi') : v.lang.startsWith('en')) && isFemaleVoice(v));
          if (femVoice) utt.voice = femVoice;
        } else {
          const maleVoice = voices.find((v) => (assistantConfig.voiceLang?.startsWith('hi') ? v.lang.startsWith('hi') : v.lang.startsWith('en')) && !isFemaleVoice(v));
          if (maleVoice) utt.voice = maleVoice;
        }
      }

      window.speechSynthesis.speak(utt);
    }
  };

  const getStateInfo = () => {
    switch (assistantState) {
      case 'listening': return { label: 'Listening...', color: '#059669', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-ping', icon: Mic };
      case 'processing': return { label: 'Thinking...', color: '#d97706', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse', icon: Cpu };
      case 'speaking': return { label: 'Speaking...', color: 'var(--primary)', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: Volume2 };
      default: return { label: 'Ready', color: '#64748b', bg: 'bg-slate-100/90 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: Radio };
    }
  };

  const stateInfo = getStateInfo();
  const isSpeaking = assistantState === 'speaking';
  const isListeningState = assistantState === 'listening';
  const isFemale = assistantConfig.voiceGender === 'female' || assistantConfig.voicePitch > 1.1;

  return (
    <div className="chat-workspace select-none">
      
      {/* 1. TOP LUXURY FROSTED HUD NAVBAR */}
      <header className="chat-navbar bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs flex items-center justify-between px-4 sm:px-6 md:px-8">
        
        {/* Left: Brand Identity & Live Status */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          
          {/* Futuristic Glowing Brand Core */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight font-hud leading-none">
              AI Virtual Assistant
            </h1>
            
            {/* Assistant Name Tag */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-hud">
              {(assistantConfig.name || 'SIRI').toUpperCase()}
            </span>
          </div>

          {/* Dynamic Status Pill */}
          <div className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${stateInfo.bg} shadow-2xs transition-all`}>
            {assistantState === 'speaking' ? (
              <div className="soundwave-container">
                <span className="soundwave-bar" />
                <span className="soundwave-bar" />
                <span className="soundwave-bar" />
                <span className="soundwave-bar" />
              </div>
            ) : (
              <span className={`w-2 h-2 rounded-full ${stateInfo.dot} flex-shrink-0`} />
            )}
            <span>{stateInfo.label}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Button 1: Switch Assistant */}
          {onSwitchAssistant && (
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                onSwitchAssistant();
              }}
              className="hud-pill-button hover:border-blue-400"
              title="Switch to another AI Assistant"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Switch Assistant</span>
              <span className="sm:hidden">Switch</span>
            </button>
          )}

          {/* Button 2: Language Selector */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              const isCurrentlyHindi = assistantConfig.language === 'hindi' || assistantConfig.voiceLang === 'hi-IN';
              const nextLang = isCurrentlyHindi ? 'english' : 'hindi';
              const nextVoiceLang = nextLang === 'hindi' ? 'hi-IN' : 'en-US';
              
              updateSettings({
                language: nextLang,
                voiceLang: nextVoiceLang,
              });

              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utt = new SpeechSynthesisUtterance(
                  nextLang === 'hindi' ? 'हिंदी भाषा चुनी गई है' : 'English language selected'
                );
                utt.lang = nextVoiceLang;
                window.speechSynthesis.speak(utt);
              }
            }}
            title="Toggle Language (English / हिंदी)"
            className="hud-pill-button hover:border-blue-400"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{assistantConfig.language === 'hindi' || assistantConfig.voiceLang === 'hi-IN' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Button 3: Voice Gender Toggle */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              const nextGender = isFemale ? 'male' : 'female';
              const nextPitch = nextGender === 'female' ? 1.25 : 0.95;
              const nextSpeed = nextGender === 'female' ? 1.05 : 1.0;
              
              updateSettings({
                voiceGender: nextGender,
                voicePitch: nextPitch,
                voiceSpeed: nextSpeed,
              });

              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utt = new SpeechSynthesisUtterance(
                  nextGender === 'female' ? 'Female voice activated' : 'Male voice activated'
                );
                utt.pitch = nextPitch;
                utt.rate = nextSpeed;
                utt.lang = assistantConfig.voiceLang || 'en-US';
                const fVoice = voices.find((v) => (nextGender === 'female' ? isFemaleVoice(v) : !isFemaleVoice(v)));
                if (fVoice) utt.voice = fVoice;
                window.speechSynthesis.speak(utt);
              }
            }}
            title="Toggle Voice (Female / Male)"
            className="hud-pill-button hover:border-pink-300"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isFemale ? 'text-pink-500' : 'text-blue-500'}`} />
            <span className="hidden sm:inline">
              {isFemale ? 'Female Voice' : 'Male Voice'}
            </span>
            <span className="sm:hidden">
              {isFemale ? 'Female' : 'Male'}
            </span>
          </button>

          {/* Action Icon: Sound Volume */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              setIsMuted(!isMuted);
            }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Action Icon: Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                setShowThemeMenu(!showThemeMenu);
              }}
              title="Change Accent Theme"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Palette className="w-4 h-4 text-slate-700" />
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 p-2 shadow-2xl z-50 animate-scaleUp">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Theme Accent
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (audioFx?.playClick) audioFx.playClick();
                      updateSettings({ themeColor: t.id });
                      setShowThemeMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 text-left transition-colors cursor-pointer"
                  >
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Icon: Customize Settings Modal */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              setShowSettingsModal(true);
            }}
            title="Customize Persona & Settings"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <Settings className="w-4 h-4 text-slate-700" />
          </button>

          {/* User Profile / Menu */}
          <div className="relative ml-1">
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                setShowProfileMenu(!showProfileMenu);
              }}
              title="User Account"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown
              isOpen={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          </div>

        </div>
      </header>

      {/* 2. MIDDLE SCROLLABLE CONVERSATION AREA */}
      <main className="chat-conversation-area">
        <div className="chat-conversation-container">
          
          {/* VIEW 1: HERO STAGE (When no messages yet) */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6 sm:py-8 max-w-4xl mx-auto w-full px-4">
              
              {/* Top Hologram Visualizer Centerpiece */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6 sm:mb-8 flex items-center justify-center">
                <HologramVisualizer size={280} />

                {/* Concentric Futuristic HUD Rings */}
                <div className="absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full border border-dashed border-blue-300/80 animate-spin-cw pointer-events-none" />
                <div className="absolute w-52 h-52 sm:w-58 sm:h-58 rounded-full border border-dotted border-indigo-300/80 animate-spin-ccw pointer-events-none" />
                <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-dashed border-blue-200 pointer-events-none" />

                {/* Ambient Glowing Background Aura */}
                <div
                  className={`absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full transition-all duration-500 pointer-events-none ${
                    isSpeaking
                      ? 'bg-blue-200/60 shadow-2xl shadow-blue-500/30 scale-110'
                      : isListeningState
                      ? 'bg-emerald-200/60 shadow-2xl shadow-emerald-500/30 scale-110'
                      : 'bg-blue-100/40'
                  }`}
                />

                {/* Central Avatar Sphere */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white bg-slate-950 shadow-2xl shadow-blue-500/20 z-20 group flex items-center justify-center">
                  <img
                    src={assistantConfig.avatarUrl || '/assets/avatars/avatar-8.svg'}
                    alt={assistantConfig.name || 'SIRI'}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isSpeaking ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                    onError={(e) => { e.target.src = '/assets/avatars/avatar-8.svg'; }}
                  />
                </div>
              </div>

              {/* Greeting & Subtitle */}
              <div className="max-w-xl mx-auto mb-6">
                <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight font-hud leading-tight">
                  Hello! I am <span className="text-blue-600 hud-gradient-text">{(assistantConfig.name || 'SIRI').toUpperCase()}</span>
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto leading-relaxed">
                  {assistantConfig.tagline || 'Intelligent Voice & System Navigator • Powered by Gemini AI 2.0'}
                </p>
              </div>

              {/* Telemetry Telechips */}
              <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                  <Zap className="w-3 h-3 text-blue-600" />
                  Gemini 2.0 AI
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                  <Activity className="w-3 h-3 text-indigo-600" />
                  Web Speech Engine
                </span>
                <button
                  onClick={() => {
                    if (audioFx?.playClick) audioFx.playClick();
                    updateSettings({ wakeWordEnabled: !assistantConfig.wakeWordEnabled });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200 shadow-2xs cursor-pointer transition-colors"
                >
                  <Radio className="w-3 h-3 text-slate-500" />
                  Wake Word: "{assistantConfig.wakeWord || 'Siri'}"
                </button>
              </div>

              {/* Suggested Action Prompts (2x2 Grid) */}
              <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickProtocols.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (audioFx?.playClick) audioFx.playClick();
                        processUserPrompt(card.prompt);
                      }}
                      className="hud-glass-card flex items-center gap-4 p-4 px-5 text-left group cursor-pointer active:scale-[0.99]"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-xs`}>
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[15px] text-slate-800 group-hover:text-blue-600 transition-colors leading-snug font-hud">
                          {card.label}
                        </div>
                        <div className="text-[12px] text-slate-400 truncate mt-0.5 font-normal">
                          {card.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            /* VIEW 2: FULL CONVERSATION STREAM */
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Conversation Title Bar */}
              <div className="conversation-title-bar">
                <div className="conversation-title-left flex items-center gap-2 font-hud">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Conversation ({messages.length})</span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Clear conversation history?')) {
                      if (audioFx?.playClick) audioFx.playClick();
                      clearHistory();
                    }
                  }}
                  className="conversation-clear-btn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>

              {/* Message Stream */}
              <div className="message-stream">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isEditingThis = editingIdx === idx;
                  const isCopied = copiedIdx === idx;

                  return (
                    <div
                      key={idx}
                      className={`message-row ${isUser ? 'user' : 'assistant'}`}
                    >
                      {/* Meta header */}
                      <div className="message-meta">
                        <span className="message-sender font-hud">
                          {isUser ? (user?.name || 'You') : assistantConfig.name || 'Assistant'}
                        </span>
                        <span className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Bubble with avatar */}
                      <div className="message-bubble-wrapper">
                        
                        {/* Assistant Avatar */}
                        {!isUser && (
                          <div className="message-avatar">
                            <img
                              src={assistantConfig.avatarUrl || '/assets/avatars/avatar-8.svg'}
                              alt={assistantConfig.name || 'Assistant'}
                              onError={(e) => { e.target.src = '/assets/avatars/avatar-8.svg'; }}
                            />
                          </div>
                        )}

                        {/* Content Card */}
                        <div className={isUser ? 'user-bubble' : 'assistant-bubble'}>
                          
                          {/* When in editing mode for this user message */}
                          {isEditingThis ? (
                            <div className="inline-edit-box">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="inline-edit-textarea"
                                rows={2}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveEdit(idx);
                                  }
                                }}
                              />
                              <div className="inline-edit-actions">
                                <button
                                  type="button"
                                  onClick={() => setEditingIdx(null)}
                                  className="inline-edit-cancel"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(idx)}
                                  className="inline-edit-save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Save & Resend</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          )}

                          {/* Action Link Card */}
                          {msg.action && msg.action.type !== 'none' && msg.action.payload?.url && (
                            <div className="message-action-card">
                              <div className="message-action-badge">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                <span>{msg.action.payload.label || 'Action Target'}</span>
                              </div>
                              <a
                                href={msg.action.payload.url}
                                target="_blank"
                                rel="noreferrer"
                                className="message-action-link"
                              >
                                <span>Open Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          {/* Assistant Voice Replay & Copy Row */}
                          {!isUser && (
                            <div className="message-replay-row">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => handleCopy(msg.content, idx)}
                                  title="Copy response to clipboard"
                                  className="message-replay-btn"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600 font-semibold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                
                                {/* Quick Play in Current Voice */}
                                <button
                                  onClick={() => handleReplayVoice(msg.content)}
                                  title="Replay Voice Audio"
                                  className="message-replay-btn"
                                >
                                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Replay Voice</span>
                                </button>

                                {/* Quick Play in Female Voice */}
                                <button
                                  onClick={() => handleReplayVoice(msg.content, 'female')}
                                  title="Hear in Female Voice"
                                  className="message-replay-btn hover:text-pink-600 hover:bg-pink-50"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                                  <span>Female</span>
                                </button>

                                {/* Quick Play in Male Voice */}
                                <button
                                  onClick={() => handleReplayVoice(msg.content, 'male')}
                                  title="Hear in Male Voice"
                                  className="message-replay-btn hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Male</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* User Message Action Toolbar: Edit & Copy */}
                      {isUser && !isEditingThis && (
                        <div className="user-msg-actions">
                          <button
                            type="button"
                            onClick={() => {
                              if (audioFx?.playClick) audioFx.playClick();
                              setEditingIdx(idx);
                              setEditingText(msg.content);
                            }}
                            title="Edit this prompt and resend"
                            className="msg-action-icon-btn"
                          >
                            <Edit3 className="w-3 h-3 text-blue-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.content, idx)}
                            title="Copy prompt"
                            className="msg-action-icon-btn"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

            </div>
          )}

        </div>
      </main>

      {/* 3. BOTTOM FLOATING COMPOSER & VOICE DOCK */}
      <footer className="chat-composer">
        <div className="chat-composer-container">
          
          {/* Speech Error Banner */}
          {speechRecError && (
            <div className="w-full max-w-xl px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-sm animate-fadeIn text-center flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span>{speechRecError}</span>
            </div>
          )}

          {/* Live Subtitle / Voice Status Ribbon */}
          {(liveTranscript || isListening) && (
            <div className={`w-full max-w-xl px-4 py-2 rounded-full border text-xs font-semibold shadow-sm animate-fadeIn text-center flex items-center justify-center gap-2.5 ${
              isListening ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-blue-50 border-blue-300 text-blue-800 italic'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`} />
              <span>
                {liveTranscript ? `"${liveTranscript}"` : '🎙️ Microphone Active — Speak now...'}
              </span>
            </div>
          )}

          {/* Main Input Dock */}
          <div className="composer-input-row">
            {/* Glowing Interactive Mic Button */}
            <button
              type="button"
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                toggleListening();
              }}
              style={{
                transform: isListening ? `scale(${1 + Math.min((audioVolume || 0) * 0.35, 0.18)})` : 'scale(1)',
                transition: 'transform 0.08s ease',
              }}
              className={`composer-mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Click to Stop & Send' : 'Click to Speak (Microphone)'}
            >
              {isListening ? (
                <Mic className="w-6 h-6 animate-pulse text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Input Form */}
            <form onSubmit={handlePromptSubmit} className="composer-form">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Ask ${assistantConfig.name || 'Assistant'} anything or speak with mic...`}
                className="composer-input font-medium"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="composer-send-btn shadow-md shadow-blue-500/20"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Ticker Row with Wake Word Status */}
          <div className="composer-ticker-row">
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                updateSettings({ wakeWordEnabled: !assistantConfig.wakeWordEnabled });
              }}
              className={`wake-word-pill ${assistantConfig.wakeWordEnabled ? 'active' : ''}`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Wake Word: "{assistantConfig.wakeWord || 'Jarvis'}" ({assistantConfig.wakeWordEnabled ? 'ON' : 'OFF'})</span>
            </button>

            {isListening && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Listening to speech...
              </span>
            )}
          </div>

        </div>
      </footer>

      {/* Action Notification Toast */}
      {activeAction && (
        <div className="fixed right-5 bottom-24 sm:bottom-20 z-50 max-w-[calc(100vw-40px)] bg-white/95 backdrop-blur-xl border border-blue-200 rounded-2xl p-4 shadow-2xl animate-slideUp flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">
              Action Executed
            </div>
            <div className="text-xs text-slate-800 font-semibold">
              {activeAction.label || 'Action triggered'}
            </div>
          </div>
          <button
            onClick={() => setActiveAction(null)}
            className="text-slate-400 hover:text-slate-700 p-1 ml-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />

    </div>
  );
};
