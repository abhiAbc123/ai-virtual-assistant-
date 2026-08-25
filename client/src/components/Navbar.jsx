import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssistant } from '../context/AssistantContext';
import { 
  Settings, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  Palette,
  Clock
} from 'lucide-react';

export const Navbar = ({ onOpenSettings, onOpenDrawer, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { assistantConfig, assistantState, isMuted, setIsMuted, updateSettings, audioFx } = useAssistant();
  const [time, setTime] = useState('');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const themes = [
    { id: 'cyan', name: 'Royal Blue (InsideBox)', color: '#2563eb' },
    { id: 'purple', name: 'Amethyst Purple', color: '#7c3aed' },
    { id: 'gold', name: 'Solar Amber', color: '#d97706' },
    { id: 'emerald', name: 'Emerald Green', color: '#059669' },
    { id: 'crimson', name: 'Ruby Crimson', color: '#e11d48' },
  ];

  const handleThemeSelect = (themeId) => {
    if (audioFx?.playClick) audioFx.playClick();
    updateSettings({ themeColor: themeId });
    setShowThemeMenu(false);
  };

  const getStateBadge = () => {
    switch (assistantState) {
      case 'listening':
        return { text: 'Listening', color: '#059669', bg: '#ecfdf5', dot: '#10b981' };
      case 'processing':
        return { text: 'Thinking', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' };
      case 'speaking':
        return { text: 'Speaking', color: 'var(--primary)', bg: '#eff6ff', dot: 'var(--primary)' };
      default:
        return { text: 'Ready', color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' };
    }
  };

  const stateBadge = getStateBadge();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-hud font-extrabold text-base tracking-tight text-slate-900">
              AI Virtual Assistant
            </span>
            <span className="text-xs font-semibold text-blue-600 px-1.5 py-0.5 rounded bg-blue-50">
              {assistantConfig.name || 'AI'}
            </span>
          </div>

          <div 
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200/60"
            style={{ backgroundColor: stateBadge.bg, color: stateBadge.color }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: stateBadge.dot }}
            />
            <span>{stateBadge.text}</span>
          </div>
        </div>

        {/* Center: System Time */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-600 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">{time}</span>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Mute / Unmute Button */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              setIsMuted(!isMuted);
            }}
            title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Theme Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                setShowThemeMenu(!showThemeMenu);
              }}
              title="Change Theme Accent"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
            >
              <Palette className="w-4 h-4 text-slate-600" />
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl z-50 animate-scaleUp">
                <div className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 mb-1">
                  Accent Color
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeSelect(t.id)}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: t.color }} />
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Transcript Drawer Button */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              onOpenDrawer();
            }}
            title="Open Chat Transcript"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Logs</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              onOpenSettings();
            }}
            title="Assistant Configuration"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-blue-600 font-medium">Logged In</div>
              </div>
              <button
                onClick={() => {
                  if (audioFx?.playClick) audioFx.playClick();
                  logout();
                }}
                title="Logout"
                className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                onOpenAuth();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm shadow-blue-500/20 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
