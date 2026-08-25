import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssistant } from '../context/AssistantContext';
import { ProfileDropdown } from './ProfileDropdown';
import { 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  LogOut, 
  Code2, 
  Heart, 
  Atom, 
  Smile, 
  Target, 
  Shield, 
  X, 
  Plus, 
  Sparkles, 
  Wand2, 
  Sliders, 
  Trash2, 
  Bot, 
  Check, 
  Play, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { isFemaleVoice } from '../hooks/useSpeechSynthesis';
import confetti from 'canvas-confetti';

export const ASSISTANT_ROSTER = [
  {
    id: 'siri',
    name: 'SIRI',
    title: 'Intelligent Voice & System Navigator',
    category: 'Productivity',
    personality: 'companion',
    themeColor: 'indigo',
    accentColor: '#6366f1',
    avatarUrl: '/assets/avatars/avatar-8.svg',
    voicePitch: 1.15,
    voiceSpeed: 1.05,
    voiceGender: 'female',
    wakeWord: 'Hey Siri',
    tagline: 'Fast, fluid, and intuitive assistant tailored for device actions, rapid answers, and personal organization.',
    greeting: 'Here is what I found for you. How can I help you today?',
    capabilities: ['Voice Commands', 'Calendar & Reminders', 'Smart Shortcuts', 'System Actions'],
    icon: Sparkles,
  },
  {
    id: 'alexa',
    name: 'ALEXA',
    title: 'Smart Ecosystem & Daily Briefing Hub',
    category: 'Lifestyle',
    personality: 'companion',
    themeColor: 'teal',
    accentColor: '#06b6d4',
    avatarUrl: '/assets/avatars/avatar-7.svg',
    voicePitch: 1.1,
    voiceSpeed: 1.0,
    voiceGender: 'female',
    wakeWord: 'Alexa',
    tagline: 'Connected voice assistant for managing your day, news briefings, smart devices, and daily routines.',
    greeting: 'Hello! Ready with your daily briefing and connected directives.',
    capabilities: ['Smart Routines', 'Daily Flash Briefing', 'Timer & Alarms', 'Ecosystem Control'],
    icon: Heart,
  },
  {
    id: 'ga',
    name: 'GA',
    title: 'Search Intelligence & Knowledge Engine',
    category: 'Science',
    personality: 'scholar',
    themeColor: 'cyan',
    accentColor: '#2563eb',
    avatarUrl: '/assets/avatars/avatar-1.svg',
    voicePitch: 1.05,
    voiceSpeed: 1.05,
    voiceGender: 'female',
    wakeWord: 'Hey Google',
    tagline: 'World-class knowledge lookup, search synthesis, and conversational answers powered by web intelligence.',
    greeting: 'Hi, how can I help? Knowledge engine ready for any query.',
    capabilities: ['Search Intelligence', 'Real-Time Answers', 'Language Translation', 'Travel & Maps'],
    icon: Atom,
  },
  {
    id: 'motion',
    name: 'MOTION',
    title: 'High-Velocity Workflow & Schedule Automator',
    category: 'Productivity',
    personality: 'commander',
    themeColor: 'orange',
    accentColor: '#ea580c',
    avatarUrl: '/assets/avatars/avatar-6.svg',
    voicePitch: 0.95,
    voiceSpeed: 1.15,
    voiceGender: 'male',
    wakeWord: 'Motion',
    tagline: 'Dynamic productivity driver designed to prioritize tasks, optimize calendars, and eliminate bottlenecks.',
    greeting: 'Motion active. Let us organize your workflow and prioritize high-impact tasks.',
    capabilities: ['Dynamic Scheduling', 'Task Prioritization', 'Project Acceleration', 'Deadline Enforcer'],
    icon: Target,
  },
  {
    id: 'samsung',
    name: 'SAMSUNG',
    title: 'Hardware Integrator & Multimodal Assistant',
    category: 'Coding',
    personality: 'cyberpunk',
    themeColor: 'teal',
    accentColor: '#0284c7',
    avatarUrl: '/assets/avatars/avatar-10.svg',
    voicePitch: 1.0,
    voiceSpeed: 1.0,
    voiceGender: 'neutral',
    wakeWord: 'Hi Bixby',
    tagline: 'Versatile device controller optimized for contextual screen commands, quick settings, and automation.',
    greeting: 'Samsung intelligence ready. Multimodal control and device automation enabled.',
    capabilities: ['Screen Context', 'Device Commands', 'App Automation', 'Quick Settings'],
    icon: Code2,
  },
  {
    id: 'classic',
    name: 'CLASSIC',
    title: 'Refined Executive Butler & System Director',
    category: 'Productivity',
    personality: 'jarvis',
    themeColor: 'gold',
    accentColor: '#d97706',
    avatarUrl: '/assets/avatars/avatar-4.svg',
    voicePitch: 0.95,
    voiceSpeed: 1.0,
    voiceGender: 'male',
    wakeWord: 'Classic',
    tagline: 'Aristocratic, dignified, and precise executive partner for mission-critical operations and system diagnostics.',
    greeting: 'Good day. Classic assistant standing by. All systems operating at peak precision.',
    capabilities: ['System Diagnostics', 'Executive Summaries', 'Formal Dictation', 'Protocol Enforcement'],
    icon: Shield,
  },
  {
    id: 'casual',
    name: 'CASUAL',
    title: 'Friendly Companion & Creative Brainstormer',
    category: 'Creative',
    personality: 'witty',
    themeColor: 'rose',
    accentColor: '#f43f5e',
    avatarUrl: '/assets/avatars/avatar-5.svg',
    voicePitch: 1.15,
    voiceSpeed: 1.05,
    voiceGender: 'female',
    wakeWord: 'Casual',
    tagline: 'Relaxed, witty, and easygoing companion for brainstorming, casual conversation, and creative ideas.',
    greeting: 'Hey! What is on your mind today? Let us chill and brainstorm something great.',
    capabilities: ['Creative Brainstorming', 'Casual Banter', 'Storytelling', 'Idea Generation'],
    icon: Smile,
  },
];

const THEME_OPTIONS = [
  { id: 'cyan', name: 'Royal Blue', color: '#2563eb' },
  { id: 'purple', name: 'Amethyst Purple', color: '#7c3aed' },
  { id: 'gold', name: 'Solar Amber', color: '#d97706' },
  { id: 'emerald', name: 'Emerald Green', color: '#059669' },
  { id: 'crimson', name: 'Ruby Crimson', color: '#e11d48' },
  { id: 'orange', name: 'Titan Orange', color: '#ea580c' },
  { id: 'teal', name: 'Neon Cyan', color: '#06b6d4' },
  { id: 'rose', name: 'Quantum Rose', color: '#f43f5e' },
  { id: 'indigo', name: 'Celestial Indigo', color: '#6366f1' },
  { id: 'lime', name: 'Matrix Lime', color: '#84cc16' },
  { id: 'fuchsia', name: 'Cyber Fuchsia', color: '#d946ef' },
  { id: 'slate', name: 'Obsidian Stealth', color: '#475569' },
];

const PERSONALITY_OPTIONS = [
  { id: 'jarvis', name: 'JARVIS Archetype', desc: 'Diplomatic, intelligent, aristocratic & precise' },
  { id: 'companion', name: 'NOVA Archetype', desc: 'Warm, empathic, caring & mindful companion' },
  { id: 'cyberpunk', name: 'CYRA Archetype', desc: 'Edgy senior developer, sharp debugger & code hacker' },
  { id: 'scholar', name: 'ATHENA Archetype', desc: 'Analytical scientific intellect & empirical researcher' },
  { id: 'witty', name: 'LOKI Archetype', desc: 'Playful, sarcastic humor & creative brainstormer' },
  { id: 'commander', name: 'ARES Archetype', desc: 'Disciplined productivity lead & ruthless execution' },
];

const AVATAR_PRESETS = [
  { id: 'avatar-1', name: 'Royal Blue Core', url: '/assets/avatars/avatar-1.svg', color: '#2563eb' },
  { id: 'avatar-2', name: 'Emerald Scholar', url: '/assets/avatars/avatar-2.svg', color: '#059669' },
  { id: 'avatar-3', name: 'Cyber Purple', url: '/assets/avatars/avatar-3.svg', color: '#7c3aed' },
  { id: 'avatar-4', name: 'Solar Amber', url: '/assets/avatars/avatar-4.svg', color: '#d97706' },
  { id: 'avatar-5', name: 'Crimson Muse', url: '/assets/avatars/avatar-5.svg', color: '#e11d48' },
  { id: 'avatar-6', name: 'Titan Commander', url: '/assets/avatars/avatar-6.svg', color: '#ea580c' },
  { id: 'avatar-7', name: 'Neon Cyber Visor', url: '/assets/avatars/avatar-7.svg', color: '#06b6d4' },
  { id: 'avatar-8', name: 'Quantum Rose Valkyrie', url: '/assets/avatars/avatar-8.svg', color: '#f43f5e' },
  { id: 'avatar-9', name: 'Celestial Indigo', url: '/assets/avatars/avatar-9.svg', color: '#6366f1' },
  { id: 'avatar-10', name: 'Nexus Matrix Core', url: '/assets/avatars/avatar-10.svg', color: '#84cc16' },
];

export const AssistantHub = ({ onSelectAssistant, onBack }) => {
  const { user, logout } = useAuth();
  const { updateSettings, audioFx, voices } = useAssistant();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingId, setPreviewingId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const categoryRailRef = useRef(null);

  const checkScrollState = () => {
    if (categoryRailRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryRailRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, []);

  const handleScrollLeft = () => {
    if (audioFx?.playClick) audioFx.playClick();
    if (categoryRailRef.current) {
      categoryRailRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (audioFx?.playClick) audioFx.playClick();
    if (categoryRailRef.current) {
      categoryRailRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Load custom assistants from localStorage
  const [customAssistants, setCustomAssistants] = useState(() => {
    try {
      const saved = localStorage.getItem('insidebox_custom_assistants');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Custom Assistant Form State
  const [customForm, setCustomForm] = useState({
    name: '',
    title: '',
    category: 'Productivity',
    personality: 'jarvis',
    themeColor: 'cyan',
    avatarUrl: '/assets/avatars/avatar-1.svg',
    voicePitch: 1.0,
    voiceSpeed: 1.0,
    voiceGender: 'neutral',
    wakeWord: '',
    tagline: '',
    greeting: '',
    customCategory: '',
    customAvatarUrl: '',
    customAccentColor: '#2563eb',
    capabilitiesInput: 'Smart Automation, Custom Intelligence, Task Execution',
  });

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Avatar image size should be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCustomForm((prev) => ({
        ...prev,
        avatarUrl: dataUrl,
        customAvatarUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const categories = [
    { id: 'All', label: 'All Assistants', icon: Layers },
    { id: 'Productivity', label: 'Productivity & Ops', icon: Target },
    { id: 'Coding', label: 'Coding & Tech', icon: Code2 },
    { id: 'Science', label: 'Science & Math', icon: Atom },
    { id: 'Wellness', label: 'Health & Wellness', icon: Heart },
    { id: 'Creative', label: 'Creative & Humor', icon: Sparkles },
    { id: 'Finance', label: 'Finance & Business', icon: Shield },
    { id: 'Education', label: 'Education & Learning', icon: Bot },
    { id: 'Gaming', label: 'Gaming & Fun', icon: Smile },
    { id: 'Security', label: 'Security & DevOps', icon: Shield },
    { id: 'Marketing', label: 'Marketing & Growth', icon: Target },
    { id: 'Lifestyle', label: 'Lifestyle & Travel', icon: Wand2 },
    { id: 'Others', label: 'Custom & Others', icon: Plus },
  ];

  const handleVoicePreview = (assistant, e) => {
    if (e) e.stopPropagation();
    if (audioFx?.playClick) audioFx.playClick();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (previewingId === assistant.id) {
      window.speechSynthesis.cancel();
      setPreviewingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPreviewingId(assistant.id);

    const utterance = new SpeechSynthesisUtterance(assistant.greeting);
    utterance.pitch = assistant.voicePitch || 1.0;
    utterance.rate = assistant.voiceSpeed || 1.0;
    utterance.lang = 'en-US';

    const availVoices = window.speechSynthesis.getVoices();
    if (availVoices.length > 0) {
      if (assistant.voiceGender === 'female' || (assistant.voicePitch && assistant.voicePitch > 1.05)) {
        const femaleVoice = availVoices.find((v) => v.lang.startsWith('en') && isFemaleVoice(v));
        if (femaleVoice) utterance.voice = femaleVoice;
      }
      if (!utterance.voice) {
        const preferred = availVoices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Zira') ||
              v.name.includes('Jenny') ||
              v.name.includes('David') ||
              v.name.includes('Daniel'))
        );
        if (preferred) utterance.voice = preferred;
      }
    }

    utterance.onend = () => setPreviewingId(null);
    utterance.onerror = () => setPreviewingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleEngage = async (assistant) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioFx?.playWake) audioFx.playWake();

    const newConfig = {
      name: assistant.name,
      personality: assistant.personality,
      themeColor: assistant.themeColor,
      avatarUrl: assistant.avatarUrl,
      avatarType: 'preset',
      voicePitch: assistant.voicePitch || 1.0,
      voiceSpeed: assistant.voiceSpeed || 1.0,
      voiceGender: assistant.voiceGender || (assistant.voicePitch > 1.05 ? 'female' : 'male'),
      wakeWord: assistant.wakeWord,
      wakeWordEnabled: true,
    };

    await updateSettings(newConfig);
    onSelectAssistant(assistant);
  };

  const handleCreateCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customForm.name.trim()) return;

    const selectedTheme = THEME_OPTIONS.find((t) => t.id === customForm.themeColor) || THEME_OPTIONS[0];
    const finalAccentColor =
      customForm.themeColor === 'custom' && customForm.customAccentColor
        ? customForm.customAccentColor
        : selectedTheme.color;

    const parsedCapabilities = customForm.capabilitiesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const chosenCategory =
      customForm.category === 'Others' && customForm.customCategory?.trim()
        ? customForm.customCategory.trim()
        : customForm.category;

    const newAssistant = {
      id: `custom-${Date.now()}`,
      name: customForm.name.trim().toUpperCase(),
      title: customForm.title.trim() || 'Custom AI Specialist',
      category: chosenCategory,
      personality: customForm.personality,
      themeColor: customForm.themeColor,
      accentColor: finalAccentColor,
      avatarUrl: customForm.avatarUrl,
      voicePitch: parseFloat(customForm.voicePitch) || 1.0,
      voiceSpeed: parseFloat(customForm.voiceSpeed) || 1.0,
      wakeWord: customForm.wakeWord.trim() || customForm.name.trim(),
      tagline:
        customForm.tagline.trim() ||
        `Custom AI Assistant calibrated for high-performance ${chosenCategory.toLowerCase()} directives.`,
      greeting:
        customForm.greeting.trim() ||
        `Greetings! I am ${customForm.name.trim().toUpperCase()}. Neural link established and ready to assist you.`,
      capabilities:
        parsedCapabilities.length > 0
          ? parsedCapabilities
          : ['Custom Directive Engine', 'Voice Automation', 'Smart Workflows'],
      icon: Bot,
      isCustom: true,
    };

    const updatedList = [newAssistant, ...customAssistants];
    setCustomAssistants(updatedList);
    try {
      localStorage.setItem('insidebox_custom_assistants', JSON.stringify(updatedList));
    } catch (err) {
      console.warn('Failed to persist custom assistant:', err);
    }

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    if (audioFx?.playAction) audioFx.playAction();
    setIsCustomizeModalOpen(false);

    // Launch directly with newly created assistant
    handleEngage(newAssistant);
  };

  const handleDeleteCustomAssistant = (assistantId, e) => {
    e.stopPropagation();
    if (audioFx?.playClick) audioFx.playClick();
    const updated = customAssistants.filter((a) => a.id !== assistantId);
    setCustomAssistants(updated);
    try {
      localStorage.setItem('insidebox_custom_assistants', JSON.stringify(updated));
    } catch (err) {}
  };

  // Combine roster + custom assistants
  const allAssistants = [...customAssistants, ...ASSISTANT_ROSTER];

  const standardCategories = ['Productivity', 'Coding', 'Science', 'Wellness', 'Creative', 'Finance', 'Education', 'Gaming', 'Security', 'Marketing', 'Lifestyle'];

  const filteredAssistants = allAssistants.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Others'
        ? !standardCategories.includes(item.category) || item.category === 'Others'
        : item.category === selectedCategory);
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.wakeWord && item.wakeWord.toLowerCase().includes(q)) ||
      item.tagline.toLowerCase().includes(q) ||
      item.capabilities.some((c) => c.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="assistant-hub select-none">
      <div className="assistant-hub-container">
        
        {/* 1. Header Structure */}
        <header className="hub-header flex-wrap sm:flex-nowrap">
          
          {/* Left: Back Button & Branding */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {onBack && (
              <button
                onClick={() => {
                  if (audioFx?.playClick) audioFx.playClick();
                  onBack();
                }}
                title="Back to Sign In"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 shadow-2xs transition-all cursor-pointer active:scale-95 group flex-shrink-0 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {onBack && <div className="h-6 w-px bg-slate-200 hidden sm:block flex-shrink-0" />}

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-hud text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight truncate">
                  AI Virtual Assistant Hub
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  Select a persona or create your custom assistant
                </p>
              </div>
            </div>
          </div>

          {/* Right: Add Assistant + User Profile */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0 flex-shrink-0">

            {/* Quick Add Custom Assistant Button */}
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                setIsCustomizeModalOpen(true);
              }}
              className="btn-add-assistant shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add AI Assistant</span>
            </button>

            {/* Clickable Profile Button */}
            <div className="profile-wrapper">
              <button
                onClick={() => {
                  if (audioFx?.playClick) audioFx.playClick();
                  setShowProfile(!showProfile);
                }}
                className="profile-trigger"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                  {(user?.name || 'G')[0].toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user?.name || 'Guest User'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {/* Profile Dropdown Component */}
              <ProfileDropdown
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onCreateCustom={() => {
                  setIsCustomizeModalOpen(true);
                }}
              />
            </div>
          </div>
        </header>

        {/* 2. Toolbar: Search Bar + Live Count + Horizontal Scroll Rail */}
        <div className="hub-toolbar mb-8">
          
          {/* Top Tier: Search Bar & Results Counter */}
          <div className="flex items-center justify-between gap-4 w-full flex-wrap sm:flex-nowrap">
            
            {/* Search Input Field */}
            <div className="hub-search">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, wake word..."
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results & Active Filter Counter */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                Showing <strong className="text-slate-800 font-bold">{filteredAssistants.length}</strong> of {allAssistants.length} Assistants
              </span>
              {(selectedCategory !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    if (audioFx?.playClick) audioFx.playClick();
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span>Reset Filters</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>

          {/* Bottom Tier: Single-Line Horizontal Category Rail with Left & Right Arrow Navigation */}
          <div className="flex items-center gap-2 w-full py-1">
            
            {/* Left Scroll Arrow Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={handleScrollLeft}
                aria-label="Scroll left"
                title="Scroll categories left"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Category Scroll Container */}
            <div 
              ref={categoryRailRef}
              onScroll={checkScrollState}
              className="category-tabs no-scrollbar flex-1 scroll-smooth py-1"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (audioFx?.playClick) audioFx.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`category-tab ${isSelected ? 'active' : ''}`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="Scroll right"
                title="Scroll categories right"
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition-all"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

          </div>

        </div>

        {/* 3. Assistant Card Grid or Empty State */}
        {filteredAssistants.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-slate-200/90 rounded-3xl mb-12 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-hud font-bold text-xl text-slate-900 mb-2">
              No AI Assistants Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mb-6 font-normal leading-relaxed">
              We couldn't find any assistants matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="assistant-grid mb-12">

          {/* Roster & User-Created Custom Assistants */}
          {filteredAssistants.map((assistant) => {
            const isPreviewing = previewingId === assistant.id;

            return (
              <div
                key={assistant.id}
                onClick={() => handleEngage(assistant)}
                className="assistant-card group relative"
              >
                {/* Card Header: Avatar, Name, Title, Voice Sample */}
                <div className="assistant-card-header">
                  <div className="assistant-identity">
                    <div 
                      className="w-16 h-16 rounded-2xl overflow-hidden border-2 bg-slate-50 p-1 flex-shrink-0 group-hover:scale-105 transition-transform"
                      style={{ borderColor: assistant.accentColor }}
                    >
                      <img
                        src={assistant.avatarUrl}
                        alt={assistant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-hud text-[22px] font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {assistant.name}
                        </h3>
                        {assistant.isCustom && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-500 font-medium line-clamp-1 mt-1">
                        {assistant.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Delete Custom Assistant Button */}
                    {assistant.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomAssistant(assistant.id, e)}
                        title="Delete Custom Assistant"
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Voice Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => handleVoicePreview(assistant, e)}
                      title={isPreviewing ? 'Stop Preview' : 'Hear Voice Preview'}
                      className={`voice-sample ${
                        isPreviewing
                          ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {isPreviewing ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-600" />
                          <span>Speaking</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Wake Word Tag */}
                <div className="wake-word">
                  <span>Wake Word: </span>
                  <strong className="text-slate-900 font-bold">"{assistant.wakeWord}"</strong>
                </div>

                {/* Assistant Description */}
                <p className="assistant-description">
                  {assistant.tagline}
                </p>

                {/* Skills / Capabilities Tag Pills */}
                <div className="assistant-tags">
                  {assistant.capabilities.map((cap, i) => (
                    <span key={i} className="assistant-tag">
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Footer Action Button (pinned to bottom of card) */}
                <div className="assistant-card-footer">
                  <button
                    type="button"
                    className="select-assistant"
                    style={{
                      backgroundColor: assistant.accentColor,
                    }}
                  >
                    <span>Select {assistant.name}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-slate-200 text-center mt-8">
          <p className="text-xs text-slate-400 font-medium">
            AI Virtual Assistant • Switch between assistant personas anytime inside the workspace
          </p>
        </footer>

      </div>

      {/* ========================================================================= */}
      {/* 4. CUSTOMIZE / CREATE AI ASSISTANT MODAL - FIXED                          */}
      {/* ========================================================================= */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <form 
            onSubmit={handleCreateCustomSubmit} 
            className="custom-assistant-modal animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="modal-header relative flex items-center justify-between">
              <div className="w-9 h-9 opacity-0 pointer-events-none hidden sm:block" />
              <div className="flex items-center justify-center gap-2.5 mx-auto sm:mx-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 flex-shrink-0">
                  <Wand2 className="w-4.5 h-4.5" />
                </div>
                <h2 className="modal-title font-hud text-center">
                  Customize New AI Assistant
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="modal-content">
              {/* 1. Identity & Role */}
              <div className="form-section">
                <h3 className="section-title">
                  <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>1. IDENTITY & ROLE</span>
                </h3>

                <div className="identity-grid">
                  <div className="form-field">
                    <label className="form-label">
                      Assistant Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={customForm.name}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Primary Category
                    </label>
                    <select
                      value={customForm.category}
                      onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                      className="form-select cursor-pointer"
                    >
                      <option value="Productivity">Productivity & Ops</option>
                      <option value="Coding">Coding & Tech</option>
                      <option value="Science">Science & Math</option>
                      <option value="Wellness">Health & Wellness</option>
                      <option value="Creative">Creative & Humor</option>
                      <option value="Finance">Finance & Business</option>
                      <option value="Education">Education & Learning</option>
                      <option value="Gaming">Gaming & Entertainment</option>
                      <option value="Security">Security & DevOps</option>
                      <option value="Marketing">Marketing & Growth</option>
                      <option value="Lifestyle">Lifestyle & Travel</option>
                      <option value="Others">Others +</option>
                    </select>
                  </div>

                  {customForm.category === 'Others' && (
                    <div className="form-field full-width animate-fadeIn">
                      <label className="form-label">
                        Specify Custom Category *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={customForm.customCategory || ''}
                        onChange={(e) => setCustomForm({ ...customForm, customCategory: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  )}

                  <div className="form-field full-width">
                    <label className="form-label">
                      Role Title / Specialty
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={customForm.title}
                      onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field full-width">
                    <label className="form-label">
                      Wake Word (Voice Activation)
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={customForm.wakeWord}
                      onChange={(e) => setCustomForm({ ...customForm, wakeWord: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Avatar & Accent Color */}
              <div className="form-section">
                <h3 className="section-title">
                  <Sliders className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>2. AVATAR & ACCENT COLOR</span>
                </h3>

                {/* Avatar Hologram Selector */}
                <div>
                  <label className="form-label mb-1.5 block">
                    Select Avatar Hologram
                  </label>
                  <div className="avatar-grid">
                    {AVATAR_PRESETS.map((av) => {
                      const isSelected = customForm.avatarUrl === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setCustomForm({ ...customForm, avatarUrl: av.url })}
                          className={`avatar-option ${isSelected ? 'selected' : ''}`}
                        >
                          <img src={av.url} alt={av.name} />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* Upload Custom Avatar + Button */}
                    <label
                      title="Upload custom avatar image"
                      className={`avatar-option flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/80 hover:bg-blue-50/50 cursor-pointer group transition-all text-slate-500 hover:text-blue-600 ${
                        customForm.customAvatarUrl && customForm.avatarUrl === customForm.customAvatarUrl ? 'selected' : ''
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      {customForm.customAvatarUrl && customForm.avatarUrl === customForm.customAvatarUrl ? (
                        <div className="w-full h-full relative">
                          <img src={customForm.customAvatarUrl} alt="Custom" className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-full bg-slate-200 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <span className="text-[10px] font-bold mt-1 text-slate-600 group-hover:text-blue-600 leading-tight">
                            Custom +
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Accent Color Theme Selector */}
                <div className="mt-3">
                  <label className="form-label mb-1.5 block">
                    Accent Color Theme
                  </label>
                  <div className="accent-color-grid">
                    {THEME_OPTIONS.map((t) => {
                      const isSelected = customForm.themeColor === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCustomForm({ ...customForm, themeColor: t.id })}
                          className={`accent-color-option ${isSelected ? 'selected' : ''}`}
                        >
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="truncate">{t.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}

                    {/* Custom Color + Picker */}
                    <label
                      title="Pick custom accent color"
                      className={`accent-color-option relative cursor-pointer group transition-all ${
                        customForm.themeColor === 'custom' ? 'selected' : 'border-dashed border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <input
                        type="color"
                        value={customForm.customAccentColor || '#3b82f6'}
                        onChange={(e) => {
                          setCustomForm({
                            ...customForm,
                            themeColor: 'custom',
                            customAccentColor: e.target.value,
                          });
                        }}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: customForm.customAccentColor || '#3b82f6' }}
                      />
                      <span className="truncate flex items-center gap-0.5">
                        <span>Custom</span>
                        <Plus className="w-3 h-3 text-blue-500 font-extrabold" />
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Speech & Voice Calibration */}
              <div className="form-section voice-section">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="section-title m-0">
                    <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>3. SPEECH & VOICE CALIBRATION</span>
                  </h3>

                  {/* Test Voice Sample Button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleVoicePreview({
                        id: 'custom-preview',
                        greeting: customForm.greeting || `Hello! I am ${customForm.name || 'your custom assistant'}. All neural systems online.`,
                        voicePitch: customForm.voicePitch,
                        voiceSpeed: customForm.voiceSpeed,
                      });
                    }}
                    className="test-voice-button"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Voice</span>
                  </button>
                </div>

                {/* Quick Gender / Tone Select */}
                <div className="voice-controls mb-3">
                  <button
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, voiceGender: 'female', voicePitch: 1.25, voiceSpeed: 1.05 })}
                    className={`voice-option ${customForm.voiceGender === 'female' || customForm.voicePitch > 1.1 ? 'selected-female' : ''}`}
                  >
                    <span>👩</span>
                    <span>Girl / Female Voice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, voiceGender: 'male', voicePitch: 0.95, voiceSpeed: 1.0 })}
                    className={`voice-option ${customForm.voiceGender === 'male' || (customForm.voicePitch <= 1.05 && customForm.voiceGender !== 'female') ? 'selected-male' : ''}`}
                  >
                    <span>👨</span>
                    <span>Male / Deep Voice</span>
                  </button>
                </div>

                {/* Sliders */}
                <div className="voice-controls">
                  {/* Speed */}
                  <div className="voice-slider-card">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Speaking Speed</span>
                      <span className="text-blue-600 font-extrabold">{customForm.voiceSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={customForm.voiceSpeed}
                      onChange={(e) => setCustomForm({ ...customForm, voiceSpeed: parseFloat(e.target.value) })}
                      className="voice-slider accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Pitch */}
                  <div className="voice-slider-card">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Voice Pitch</span>
                      <span className="text-blue-600 font-extrabold">{customForm.voicePitch}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.05"
                      value={customForm.voicePitch}
                      onChange={(e) => setCustomForm({ ...customForm, voicePitch: parseFloat(e.target.value) })}
                      className="voice-slider accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Custom Capabilities */}
              <div className="form-section capabilities-section">
                <h3 className="section-title">
                  <span>4. CAPABILITIES & SKILL TAGS (COMMA SEPARATED)</span>
                </h3>
                <input
                  type="text"
                  placeholder=""
                  value={customForm.capabilitiesInput}
                  onChange={(e) => setCustomForm({ ...customForm, capabilitiesInput: e.target.value })}
                  className="capabilities-input"
                />
              </div>
            </div>

            {/* Modal Footer Buttons - ALWAYS VISIBLE */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="modal-footer-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-footer-submit"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create & Launch Assistant</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
