import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const OAuthCallback = ({ onComplete }) => {
  const { googleLogin, facebookLogin } = useAuth();
  const [status, setStatus] = useState('Verifying credentials...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state'); // 'google' | 'facebook'
      const errorParam = urlParams.get('error_description') || urlParams.get('error');

      if (errorParam) {
        setError(`Authentication was cancelled or failed: ${errorParam}`);
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_ERROR', error: errorParam }, window.location.origin);
          setTimeout(() => window.close(), 1500);
        }
        return;
      }

      if (!code) {
        setError('No authorization code returned from provider.');
        return;
      }

      // If in popup window, send code to parent window
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_CALLBACK', code, state }, window.location.origin);
        setStatus('Authentication successful! Closing window...');
        setTimeout(() => window.close(), 500);
        return;
      }

      // If full page redirect, process authentication directly
      setStatus('Connecting to your account...');
      const redirectUri = `${window.location.origin}/auth/callback`;
      let res;
      if (state === 'facebook') {
        res = await facebookLogin({ code, redirectUri });
      } else {
        res = await googleLogin({ code, redirectUri });
      }

      if (res?.success) {
        window.history.replaceState({}, document.title, '/');
        if (onComplete) onComplete();
      } else {
        setError(res?.message || 'Failed to complete authentication.');
      }
    };

    handleCallback();
  }, [googleLogin, facebookLogin, onComplete]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-900 select-none p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
        {!error ? (
          <>
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-900">{status}</h3>
            <p className="text-xs text-slate-500 font-medium">Securing neural link and user session...</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-lg">!</div>
            <h3 className="text-base font-bold text-red-700">Authentication Error</h3>
            <p className="text-xs text-slate-600 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => {
                window.history.replaceState({}, document.title, '/');
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};
