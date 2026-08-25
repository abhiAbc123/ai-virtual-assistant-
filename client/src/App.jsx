import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssistantProvider } from './context/AssistantContext';
import { AuthScreen } from './components/AuthScreen';
import { AssistantHub } from './components/AssistantHub';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { OAuthCallback } from './components/OAuthCallback';

function AppContent() {
  const { token, loading, logout } = useAuth();
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState('hub'); // 'hub' | 'workspace'
  const [selectedAssistant, setSelectedAssistant] = useState(null);

  const isOAuthCallback =
    window.location.pathname.startsWith('/auth/callback') ||
    (window.location.search.includes('code=') && (window.location.search.includes('state=google') || window.location.search.includes('state=facebook')));

  // Sync session state when logging out
  useEffect(() => {
    if (!token && !isGuest) {
      setSelectedAssistant(null);
      setActiveView('hub');
    }
  }, [token, isGuest]);

  if (isOAuthCallback) {
    return <OAuthCallback onComplete={() => setActiveView('hub')} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin shadow-sm" />
          <span className="text-xs font-semibold text-slate-500 tracking-wider">
            Loading Assistant...
          </span>
        </div>
      </div>
    );
  }

  // Stage 1: If not logged in and not guest -> Dedicated Login & Sign Up Screen
  if (!token && !isGuest) {
    return (
      <AuthScreen 
        onGuestAccess={() => {
          setIsGuest(true);
          setActiveView('hub');
        }} 
      />
    );
  }

  // Stage 2: If activeView is 'hub' or no assistant chosen yet -> Multi-AI Assistant Selection Hub
  if (activeView === 'hub' || !selectedAssistant) {
    return (
      <AssistantHub
        onSelectAssistant={(assistant) => {
          setSelectedAssistant(assistant);
          setActiveView('workspace');
        }}
        onBack={() => {
            if (token) logout();   // clear token → triggers auth screen
            setIsGuest(false);     // also clear guest mode
          }}
      />
    );
  }

  // Stage 3: Dedicated Assistant HUD Workspace
  return (
    <UnifiedDashboard
      onSwitchAssistant={() => {
        setActiveView('hub');
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AssistantProvider>
        <AppContent />
      </AssistantProvider>
    </AuthProvider>
  );
}
