import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAssistant } from '../context/AssistantContext';
import { 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const AuthScreen = ({ onGuestAccess }) => {
  const { login, register, googleLogin, facebookLogin, authError } = useAuth();
  const { audioFx } = useAssistant();

  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'facebook' | null
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle OAuth Popup Messages
  useEffect(() => {
    const handleOAuthMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_CALLBACK' && event.data?.code) {
        const { code, state } = event.data;
        const redirectUri = `${window.location.origin}/auth/callback`;

        if (state === 'facebook') {
          setLoadingProvider('facebook');
          const res = await facebookLogin({ code, redirectUri });
          setLoadingProvider(null);
          if (res?.success) {
            if (audioFx?.playAction) audioFx.playAction();
          } else {
            if (audioFx?.playError) audioFx.playError();
            setLocalError(res?.message || 'Unable to sign in with Facebook. Please try again.');
          }
        } else {
          setLoadingProvider('google');
          const res = await googleLogin({ code, redirectUri });
          setLoadingProvider(null);
          if (res?.success) {
            if (audioFx?.playAction) audioFx.playAction();
          } else {
            if (audioFx?.playError) audioFx.playError();
            setLocalError(res?.message || 'Unable to sign in with Google. Please try again.');
          }
        }
      } else if (event.data?.type === 'OAUTH_ERROR') {
        setLoadingProvider(null);
        if (audioFx?.playError) audioFx.playError();
        setLocalError(event.data.error || 'Authentication was cancelled or failed.');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [googleLogin, facebookLogin, audioFx]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (audioFx?.playClick) audioFx.playClick();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please fill in all required credentials.');
      if (audioFx?.playError) audioFx.playError();
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setLocalError('Please enter your full name.');
      if (audioFx?.playError) audioFx.playError();
      return;
    }

    setLoading(true);
    let res;
    if (mode === 'login') {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }
    setLoading(false);

    if (res?.success) {
      if (audioFx?.playAction) audioFx.playAction();
      if (mode === 'signup') {
        // After signup, redirect to login with a success message
        setSuccessMsg('Account created! Please sign in to continue.');
        setLocalError('');
        setMode('login');
        setName('');
        setPassword('');
      }
    } else {
      if (audioFx?.playError) audioFx.playError();
      setLocalError(res?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    if (audioFx?.playClick) audioFx.playClick();
    setLocalError('');
    setSuccessMsg('');
    setLoadingProvider('google');

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;

    if (clientId && clientId.trim() !== '') {
      const scope = 'openid email profile';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=${encodeURIComponent(
        scope
      )}&access_type=offline&prompt=consent&state=google`;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(authUrl, 'Google OAuth Login', `width=${width},height=${height},left=${left},top=${top}`);
    } else {
      // Direct OAuth verification & linking via backend
      setTimeout(async () => {
        const res = await googleLogin({
          code: 'dev_mock_google_code',
          redirectUri,
          name: 'Google Verified User',
          email: 'google.account@gmail.com',
        });
        setLoadingProvider(null);
        if (res?.success) {
          if (audioFx?.playAction) audioFx.playAction();
        } else {
          if (audioFx?.playError) audioFx.playError();
          setLocalError(res?.message || 'Unable to sign in with Google. Please try again.');
        }
      }, 500);
    }
  };

  const handleFacebookLogin = async () => {
    if (audioFx?.playClick) audioFx.playClick();
    setLocalError('');
    setSuccessMsg('');
    setLoadingProvider('facebook');

    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;

    if (appId && appId.trim() !== '') {
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
        appId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=email,public_profile&state=facebook`;

      const width = 550;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(authUrl, 'Facebook OAuth Login', `width=${width},height=${height},left=${left},top=${top}`);
    } else {
      // Direct OAuth verification & linking via backend
      setTimeout(async () => {
        const res = await facebookLogin({
          code: 'dev_mock_fb_code',
          redirectUri,
          name: 'Facebook Verified User',
          email: 'facebook.account@meta.com',
        });
        setLoadingProvider(null);
        if (res?.success) {
          if (audioFx?.playAction) audioFx.playAction();
        } else {
          if (audioFx?.playError) audioFx.playError();
          setLocalError(res?.message || 'Unable to sign in with Facebook. Please try again.');
        }
      }, 500);
    }
  };

  return (
    <div className="signup-page select-none">
      
      {/* Signup Card */}
      <div className="signup-card">
        
        {/* Back arrow — only shown on login page */}
        {mode === 'login' && (
          <button
            type="button"
            onClick={() => { setMode('signup'); setLocalError(''); }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium mb-3 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sign Up
          </button>
        )}

        {/* Brand & Logo Section */}
        <div className="signup-brand">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-hud text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              AI Virtual Assistant
            </h1>
          </div>
        </div>


        {/* Alert Error / Success Messages */}
        {(localError || authError) && (
          <div className="mb-4 p-3 bg-red-50/90 border border-red-200/80 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span className="font-medium leading-relaxed">{localError || authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="signup-form">
          {mode === 'signup' && (
            <div className="signup-form-group">
              <label htmlFor="auth-name">FULL NAME</label>
              <div className="relative">
                <input
                  id="auth-name"
                  type="text"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="signup-form-group">
            <label htmlFor="auth-email">EMAIL ADDRESS</label>
            <div className="relative">
              <input
                id="auth-email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="signup-form-group">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-password" style={{ marginBottom: 0 }}>PASSWORD</label>
              {mode === 'login' && (
                <span className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || loadingProvider !== null}
            className="signup-submit bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Dedicated Social Divider */}
        <div className="signup-divider">
          <span>{mode === 'signup' ? 'or sign up with' : 'or sign in with'}</span>
        </div>

        {/* Social Authentication Buttons */}
        <div className="signup-social-buttons">
          {/* Facebook */}
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading || loadingProvider !== null}
            className="signup-social-button hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50"
            title="Sign in with Facebook"
          >
            {loadingProvider === 'facebook' ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-[#1877F2] fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs sm:text-sm font-bold text-slate-800">Facebook</span>
              </>
            )}
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || loadingProvider !== null}
            className="signup-social-button hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50"
            title="Sign in with Google"
          >
            {loadingProvider === 'google' ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-800">Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-xs sm:text-sm font-bold text-slate-800">Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="signup-footer">
          {onGuestAccess && (
            <button
              type="button"
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                onGuestAccess();
              }}
              className="signup-footer-guest text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Explore AI Assistants as Guest →
            </button>
          )}

          <div className="signup-footer-switch text-xs sm:text-sm text-slate-600">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setLocalError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
