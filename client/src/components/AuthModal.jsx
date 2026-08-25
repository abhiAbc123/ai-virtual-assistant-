import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssistant } from '../context/AssistantContext';
import { 
  X, 
  User, 
  Mail, 
  Eye,
  EyeOff,
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin, authError } = useAuth();
  const { audioFx } = useAssistant();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password || (!isLogin && !name)) {
      setLocalError('Please complete all mandatory credentials.');
      if (audioFx?.playError) audioFx.playError();
      return;
    }

    if (audioFx?.playProcessing) audioFx.playProcessing();
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }

    setLoading(false);

    if (result.success) {
      if (audioFx?.playAction) audioFx.playAction();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } else {
      if (audioFx?.playError) audioFx.playError();
      setLocalError(result.message || 'Authentication error occurred.');
    }
  };

  const handleDemo = async () => {
    if (audioFx?.playProcessing) audioFx.playProcessing();
    setLoading(true);
    const res = await demoLogin();
    setLoading(false);
    if (res.success) {
      if (audioFx?.playAction) audioFx.playAction();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => {
          if (audioFx?.playClick) audioFx.playClick();
          onClose();
        }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 flex flex-col gap-5 animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={() => {
            if (audioFx?.playClick) audioFx.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 flex-shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <h2 className="font-hud font-bold text-lg text-slate-900 leading-tight">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {isLogin ? 'Welcome back to InsideBox AI' : 'Start your intelligent assistant journey'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              setIsLogin(true);
              setLocalError('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isLogin
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioFx?.playClick) audioFx.playClick();
              setIsLogin(false);
              setLocalError('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isLogin
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:border-blue-500 focus:outline-none transition-all"
                  required
                /><User className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              E-mail
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3 p-1 rounded-md focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>


      </div>
    </div>
  );
};
