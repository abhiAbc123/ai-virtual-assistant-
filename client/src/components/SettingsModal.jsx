import React, { useState, useRef, useEffect } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { 
  X, 
  Upload, 
  Check, 
  Sparkles, 
  Bot, 
  Volume2, 
  Palette, 
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Play,
  Languages,
  Zap
} from 'lucide-react';
import { isFemaleVoice, isHindiVoice } from '../hooks/useSpeechSynthesis';
import confetti from 'canvas-confetti';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { 
    assistantConfig, 
    updateSettings, 
    uploadAvatar, 
    voices, 
    audioFx 
  } = useAssistant();

  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'avatar' | 'voice' | 'theme'
  const [formData, setFormData] = useState({ ...assistantConfig });
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Sync formData whenever modal opens or assistantConfig changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...assistantConfig });
    }
  }, [isOpen, assistantConfig]);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'avatar-8',
      name: 'SIRI',
      url: '/assets/avatars/avatar-8.svg',
      theme: 'indigo',
      personality: 'companion',
      role: 'Voice Navigator',
    },
    {
      id: 'avatar-7',
      name: 'ALEXA',
      url: '/assets/avatars/avatar-7.svg',
      theme: 'teal',
      personality: 'companion',
      role: 'Smart Hub',
    },
    {
      id: 'avatar-1',
      name: 'GA',
      url: '/assets/avatars/avatar-1.svg',
      theme: 'cyan',
      personality: 'scholar',
      role: 'Knowledge Engine',
    },
    {
      id: 'avatar-6',
      name: 'MOTION',
      url: '/assets/avatars/avatar-6.svg',
      theme: 'orange',
      personality: 'commander',
      role: 'Workflow Automator',
    },
    {
      id: 'avatar-10',
      name: 'SAMSUNG',
      url: '/assets/avatars/avatar-10.svg',
      theme: 'teal',
      personality: 'cyberpunk',
      role: 'Multimodal Hub',
    },
    {
      id: 'avatar-4',
      name: 'CLASSIC',
      url: '/assets/avatars/avatar-4.svg',
      theme: 'gold',
      personality: 'jarvis',
      role: 'Executive Butler',
    },
    {
      id: 'avatar-5',
      name: 'CASUAL',
      url: '/assets/avatars/avatar-5.svg',
      theme: 'rose',
      personality: 'witty',
      role: 'Companion',
    },
  ];

  const themes = [
    { id: 'cyan', name: 'Royal Blue', color: '#2563eb' },
    { id: 'purple', name: 'Amethyst Purple', color: '#7c3aed' },
    { id: 'gold', name: 'Solar Amber', color: '#d97706' },
    { id: 'emerald', name: 'Emerald Green', color: '#059669' },
    { id: 'crimson', name: 'Ruby Crimson', color: '#e11d48' },
    { id: 'orange', name: 'Titan Orange', color: '#ea580c' },
  ];

  const navTabs = [
    { 
      id: 'identity', 
      label: 'Identity & Wake Word', 
      icon: Bot, 
    },
    { 
      id: 'avatar', 
      label: 'Avatar Presets', 
      icon: ImageIcon, 
    },
    { 
      id: 'voice', 
      label: 'Voice & Speech', 
      icon: Volume2, 
    },
    { 
      id: 'theme', 
      label: 'Theme & HUD', 
      icon: Palette, 
    },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioFx?.playProcessing) audioFx.playProcessing();
    setIsUploading(true);

    const res = await uploadAvatar(file);
    setIsUploading(false);

    if (res?.success) {
      if (audioFx?.playAction) audioFx.playAction();
      setFormData((prev) => ({
        ...prev,
        avatarUrl: res.url,
        avatarType: 'custom',
      }));
    } else {
      if (audioFx?.playError) audioFx.playError();
      alert(res?.message || 'Failed to upload image');
    }
  };

  const handleSave = async () => {
    if (audioFx?.playAction) audioFx.playAction();
    await updateSettings(formData);
    setSaveSuccess(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 450);
  };

  return (
    <div className="settings-modal-overlay">
      
      {/* Clickable Backdrop */}
      <div 
        onClick={() => {
          if (audioFx?.playClick) audioFx.playClick();
          onClose();
        }}
        className="fixed inset-0"
        aria-hidden="true"
      />

      {/* Main Settings Modal Card Container */}
      <div className="settings-dialog">
        
        {/* Top Header */}
        <div className="settings-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none">
                  Assistant Settings
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200">
                  {formData.name || 'GA'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Customize identity, speech models, avatars, and HUD themes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            title="Close Settings"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body: Two Column Layout */}
        <div className="settings-body">
          
          {/* Left Settings Sidebar */}
          <div className="settings-sidebar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (audioFx?.playClick) audioFx.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`settings-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="settings-content">
            
            {/* ========================================================
               TAB 1: IDENTITY & WAKE WORD
               ======================================================== */}
            {activeTab === 'identity' && (
              <div className="space-y-4 animate-fadeIn">
                
                <div className="settings-card space-y-3.5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Identity & Voice Activation
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Assistant Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. CASUAL"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">The name your assistant introduces itself with.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Neural Wake Word
                      </label>
                      <input
                        type="text"
                        value={formData.wakeWord || ''}
                        onChange={(e) => setFormData({ ...formData, wakeWord: e.target.value })}
                        placeholder="e.g. Casual"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Keyword that activates live voice listening.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
               TAB 2: AVATAR PRESETS
               ======================================================== */}
            {activeTab === 'avatar' && (
              <div className="space-y-4 animate-fadeIn">
                
                <div className="settings-card space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Interactive Avatars
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      7 Presets
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {presets.map((preset) => {
                      const isSelected = formData.avatarUrl === preset.url;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            if (audioFx?.playClick) audioFx.playClick();
                            setFormData({
                              ...formData,
                              avatarUrl: preset.url,
                              avatarType: 'preset',
                              personality: preset.personality,
                              themeColor: preset.theme,
                            });
                          }}
                          className={`relative p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col items-center text-center group ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-2xs'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </div>
                          )}

                          <div className="w-10 h-10 rounded-xl p-0.5 bg-slate-50 border border-slate-100 mb-1 group-hover:scale-105 transition-transform overflow-hidden shadow-2xs">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="font-bold text-xs text-slate-900 leading-tight">
                            {preset.name}
                          </div>

                          <span className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-100 text-[8px] font-bold text-slate-600 uppercase">
                            {preset.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Avatar Upload */}
                <div className="settings-card space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Upload Custom Avatar
                    </h3>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-4 px-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 text-slate-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-2xs"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600 font-bold">Uploading custom image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-800">Click to upload image</span>
                        <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, WebP or SVG</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

            {/* ========================================================
               TAB 3: VOICE & SPEECH
               ======================================================== */}
            {activeTab === 'voice' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Language Selection */}
                <div className="settings-card space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <Languages className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Spoken Language
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* English */}
                    <button
                      type="button"
                      onClick={() => {
                        if (audioFx?.playClick) audioFx.playClick();
                        setFormData({ ...formData, language: 'english', voiceLang: 'en-US' });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        formData.language === 'english' && formData.voiceLang !== 'hi-IN'
                          ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">
                        English (en-US)
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Fluent, natural English.
                      </p>
                    </button>

                    {/* Hindi */}
                    <button
                      type="button"
                      onClick={() => {
                        if (audioFx?.playClick) audioFx.playClick();
                        setFormData({ ...formData, language: 'hindi', voiceLang: 'hi-IN' });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        formData.language === 'hindi' || formData.voiceLang === 'hi-IN'
                          ? 'bg-orange-50/90 border-orange-500 shadow-sm ring-1 ring-orange-500'
                          : 'bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-orange-950">
                        Hindi (हिंदी - hi-IN)
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Conversational Hindi.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Voice Model & Synthesizer */}
                <div className="settings-card space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Voice Model
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const isHindi = formData.language === 'hindi' || formData.voiceLang === 'hi-IN';
                          const sampleText = isHindi
                            ? `नमस्ते! मैं आपका AI वर्चुअल असिस्टेंट हूँ।`
                            : `Hello! I am your AI Virtual Assistant.`;
                          
                          const utt = new SpeechSynthesisUtterance(sampleText);
                          utt.pitch = formData.voicePitch || 1.0;
                          utt.rate = formData.voiceSpeed || 1.0;
                          utt.lang = isHindi ? 'hi-IN' : 'en-US';

                          if (formData.voiceName) {
                            const v = voices.find((vox) => vox.name === formData.voiceName);
                            if (v) utt.voice = v;
                          } else if (isHindi) {
                            const hv = voices.find((v) => isHindiVoice(v));
                            if (hv) utt.voice = hv;
                          } else if (formData.voiceGender === 'female' || formData.voicePitch > 1.1) {
                            const fv = voices.find((v) => v.lang.startsWith('en') && isFemaleVoice(v));
                            if (fv) utt.voice = fv;
                          }
                          window.speechSynthesis.speak(utt);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Test Voice</span>
                    </button>
                  </div>

                  <div>
                    <select
                      value={formData.voiceName || ''}
                      onChange={(e) => setFormData({ ...formData, voiceName: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="">Auto-Select Best Natural Voice</option>
                      
                      {voices.filter((v) => isHindiVoice(v)).length > 0 && (
                        <optgroup label="Hindi Voices (हिंदी)">
                          {voices
                            .filter((v) => isHindiVoice(v))
                            .map((v, i) => (
                              <option key={`h-${i}`} value={v.name}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                        </optgroup>
                      )}

                      <optgroup label="Female / Natural Voices">
                        {voices
                          .filter((v) => isFemaleVoice(v) && !isHindiVoice(v))
                          .map((v, i) => (
                            <option key={`f-${i}`} value={v.name}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                      </optgroup>

                      <optgroup label="Male & Other Voices">
                        {voices
                          .filter((v) => !isFemaleVoice(v) && !isHindiVoice(v))
                          .map((v, i) => (
                            <option key={`m-${i}`} value={v.name}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                        <span>Speed</span>
                        <span className="text-blue-600 font-bold">{formData.voiceSpeed || 1.0}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.6"
                        step="0.05"
                        value={formData.voiceSpeed || 1.0}
                        onChange={(e) => setFormData({ ...formData, voiceSpeed: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                        <span>Pitch</span>
                        <span className="text-pink-600 font-bold">{formData.voicePitch || 1.0}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.6"
                        step="0.05"
                        value={formData.voicePitch || 1.0}
                        onChange={(e) => setFormData({ ...formData, voicePitch: parseFloat(e.target.value) })}
                        className="w-full accent-pink-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
               TAB 4: THEME ACCENT & HUD
               ======================================================== */}
            {activeTab === 'theme' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Color Palette */}
                <div className="settings-card space-y-2.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <Palette className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Accent Color
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => {
                      const isSelected = formData.themeColor === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            if (audioFx?.playClick) audioFx.playClick();
                            setFormData({ ...formData, themeColor: t.id });
                          }}
                          className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer flex items-center gap-2.5 relative ${
                            isSelected
                              ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                              : 'bg-white border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <span 
                            className="w-5 h-5 rounded-lg shadow-xs flex-shrink-0 border border-white ring-1 ring-slate-200" 
                            style={{ backgroundColor: t.color }} 
                          />
                          <span className="font-bold text-xs text-slate-900 truncate">{t.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-blue-600 stroke-[3] ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audio Effects Toggle */}
                <div className="settings-card space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sound Feedback
                    </h3>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-slate-900">HUD Audio Effects</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Subtle audio feedback on interactions.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioFx?.playClick) audioFx.playClick();
                        setFormData({ ...formData, soundFx: !formData.soundFx });
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        formData.soundFx !== false ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform ${
                          formData.soundFx !== false ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Bottom Action Footer */}
        <div className="settings-footer">
          <button
            type="button"
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              onClose();
            }}
            className="btn-cancel"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="btn-save"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Saved & Applied!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>Save & Apply Settings</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
