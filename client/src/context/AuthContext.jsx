import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jarvis_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and check authenticated user on load
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('jarvis_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            // Expired or invalid token
            localStorage.removeItem('jarvis_token');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.warn('Auth check error:', e);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token) {
        localStorage.setItem('jarvis_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      } else {
        setAuthError(res.message || 'Login failed');
        return { success: false, message: res.message };
      }
    } catch (e) {
      setAuthError(e.message || 'Network error during login');
      return { success: false, message: e.message };
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.register(name, email, password);
      if (res.success) {
        // Don't auto-login — return success so UI can redirect to login page
        return { success: true };
      } else {
        setAuthError(res.message || 'Registration failed');
        return { success: false, message: res.message };
      }
    } catch (e) {
      setAuthError(e.message || 'Network error during registration');
      return { success: false, message: e.message };
    }
  };


  const demoLogin = async () => {
    setAuthError(null);
    try {
      const res = await authApi.demoLogin();
      if (res.success && res.token) {
        localStorage.setItem('jarvis_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
    } catch (e) {
      console.warn('Demo login error:', e);
    }
    return { success: false };
  };

  const googleLogin = async (payload) => {
    setAuthError(null);
    try {
      const res = await authApi.googleOAuth(payload);
      if (res.success && res.token) {
        localStorage.setItem('jarvis_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      } else {
        const errorMsg = res.message || 'Unable to sign in with Google. Please try again.';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (e) {
      const errorMsg = e.message || 'Unable to sign in with Google. Please try again.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const facebookLogin = async (payload) => {
    setAuthError(null);
    try {
      const res = await authApi.facebookOAuth(payload);
      if (res.success && res.token) {
        localStorage.setItem('jarvis_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      } else {
        const errorMsg = res.message || 'Unable to sign in with Facebook. Please try again.';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (e) {
      const errorMsg = e.message || 'Unable to sign in with Facebook. Please try again.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('jarvis_token');
    setToken(null);
    setUser(null);
  };

  const updateLocalUserConfig = (newConfig) => {
    setUser((prev) => (prev ? { ...prev, assistantConfig: { ...prev.assistantConfig, ...newConfig } } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        demoLogin,
        googleLogin,
        facebookLogin,
        logout,
        updateLocalUserConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
