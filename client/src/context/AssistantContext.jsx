import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { assistantApi, chatApi } from '../services/api';
import { useAudioFx } from '../hooks/useAudioFx';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const AssistantContext = createContext(null);

const DEFAULT_CONFIG = {
  name: 'NOVA',
  avatarUrl: '/assets/avatars/avatar-4.svg',
  avatarType: 'preset',
  themeColor: 'cyan',
  personality: 'companion',
  customPrompt: '',
  language: 'english', // 'english' | 'hindi'
  voiceGender: 'female',
  voiceName: '',
  voiceLang: 'en-US',
  voicePitch: 1.15,
  voiceSpeed: 1.0,
  wakeWordEnabled: true,
  wakeWord: 'Nova',
};

export const AssistantProvider = ({ children }) => {
  const { user, token, updateLocalUserConfig } = useAuth();
  const audioFx = useAudioFx();

  const [assistantConfig, setAssistantConfig] = useState(() => {
    const saved = localStorage.getItem('jarvis_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed, language: parsed.language || 'english', voiceLang: parsed.voiceLang || 'en-US' };
      } catch (e) {}
    }
    return DEFAULT_CONFIG;
  });

  const [assistantState, setAssistantState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'speaking'
  const [messages, setMessages] = useState([]);
  const [activeAction, setActiveAction] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundFrequency, setSoundFrequency] = useState(0);

  // Sync assistant config when user logs in or profile changes
  useEffect(() => {
    if (user && user.assistantConfig) {
      setAssistantConfig((prev) => ({
        ...prev,
        ...user.assistantConfig,
      }));
    }
  }, [user]);

  // Apply theme color attribute to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', assistantConfig.themeColor || 'cyan');
    localStorage.setItem('jarvis_config', JSON.stringify(assistantConfig));
  }, [assistantConfig]);

  // Load chat history if authenticated
  useEffect(() => {
    const loadHistory = async () => {
      if (token) {
        try {
          const res = await chatApi.getHistory();
          if (res.success && res.messages) {
            setMessages(res.messages);
          }
        } catch (e) {
          console.warn('Error loading history:', e);
        }
      }
    };
    loadHistory();
  }, [token]);

  // Speech Synthesis Hook
  const { speak, voices, isSpeaking } = useSpeechSynthesis({
    onStart: () => {
      setAssistantState('speaking');
    },
    onEnd: () => {
      setAssistantState('idle');
      setSoundFrequency(0);
    },
    onBoundary: () => {
      // Modulate frequency for hologram visualizer reactivity
      setSoundFrequency(Math.random() * 0.8 + 0.2);
    },
  });

  // Speech processing routine
  const processUserPrompt = useCallback(
    async (text) => {
      if (!text || !text.trim()) return;

      audioFx.playProcessing();
      setAssistantState('processing');

      // Optimistic user message update
      const userMsg = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const response = await chatApi.sendMessage(text, assistantConfig);

        if (response.success) {
          const payload = response.data || response;
          const assistantReply = payload.reply || response.reply || '';
          const spokenText = payload.spokenText || response.spokenText || assistantReply;
          const action = payload.action || response.action;

          const assistantMsg = {
            role: 'assistant',
            content: assistantReply,
            action,
            timestamp: response.timestamp || new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMsg]);

          // Handle Action Execution (e.g., Open URL)
          if (action && action.type === 'open_url' && action.payload?.url) {
            setActiveAction({
              type: 'open_url',
              label: action.payload.label || 'Website',
              url: action.payload.url,
            });
            audioFx.playAction();
            window.open(action.payload.url, '_blank', 'noopener,noreferrer');
          } else if (action && action.type === 'search_web' && action.payload?.url) {
            setActiveAction({
              type: 'search_web',
              label: `Google Search: ${action.payload.query}`,
              url: action.payload.url,
            });
            audioFx.playAction();
            window.open(action.payload.url, '_blank', 'noopener,noreferrer');
          } else if (action && action.type === 'clear') {
            setMessages([]);
          }

          // Speak output using Web Speech API
          if (!isMuted && spokenText) {
            const isFemale =
              assistantConfig.voiceGender === 'female' ||
              ['companion', 'cyberpunk', 'scholar'].includes(assistantConfig.personality) ||
              (assistantConfig.voicePitch && assistantConfig.voicePitch > 1.05);

            speak(spokenText, {
              voiceName: assistantConfig.voiceName,
              voiceLang: assistantConfig.voiceLang,
              voicePitch: assistantConfig.voicePitch,
              voiceSpeed: assistantConfig.voiceSpeed,
              gender: isFemale ? 'female' : 'auto',
            });
          } else {
            setAssistantState('idle');
          }
        } else {
          audioFx.playError();
          setAssistantState('idle');
        }
      } catch (err) {
        console.error('Prompt processing error:', err);
        audioFx.playError();
        setAssistantState('idle');
      }
    },
    [assistantConfig, audioFx, isMuted, speak]
  );

  // Voice Audio recording processing routine (Gemini Multimodal)
  const processAudioPrompt = useCallback(
    async (base64Audio, mimeType) => {
      if (!base64Audio) return;

      audioFx.playProcessing();
      setAssistantState('processing');

      try {
        const response = await chatApi.sendVoiceMessage(base64Audio, mimeType, assistantConfig);

        if (response.success) {
          const userText = response.transcript || 'Voice Command';
          const assistantReply = response.reply || '';
          const spokenText = response.spokenText || assistantReply;
          const action = response.action;

          const userMsg = {
            role: 'user',
            content: userText,
            timestamp: new Date().toISOString(),
          };

          const assistantMsg = {
            role: 'assistant',
            content: assistantReply,
            action,
            timestamp: response.timestamp || new Date().toISOString(),
          };

          setMessages((prev) => [...prev, userMsg, assistantMsg]);

          // Handle Action Execution
          if (action && action.type === 'open_url' && action.payload?.url) {
            setActiveAction({
              type: 'open_url',
              label: action.payload.label || 'Website',
              url: action.payload.url,
            });
            audioFx.playAction();
            window.open(action.payload.url, '_blank', 'noopener,noreferrer');
          } else if (action && action.type === 'search_web' && action.payload?.url) {
            setActiveAction({
              type: 'search_web',
              label: `Google Search: ${action.payload.query}`,
              url: action.payload.url,
            });
            audioFx.playAction();
            window.open(action.payload.url, '_blank', 'noopener,noreferrer');
          } else if (action && action.type === 'clear') {
            setMessages([]);
          }

          // Speak output
          if (!isMuted && spokenText) {
            const isFemale =
              assistantConfig.voiceGender === 'female' ||
              ['companion', 'cyberpunk', 'scholar'].includes(assistantConfig.personality) ||
              (assistantConfig.voicePitch && assistantConfig.voicePitch > 1.05);

            speak(spokenText, {
              voiceName: assistantConfig.voiceName,
              voiceLang: assistantConfig.voiceLang,
              voicePitch: assistantConfig.voicePitch,
              voiceSpeed: assistantConfig.voiceSpeed,
              gender: isFemale ? 'female' : 'auto',
            });
          } else {
            setAssistantState('idle');
          }
        } else {
          audioFx.playError();
          setAssistantState('idle');
        }
      } catch (err) {
        console.error('Audio processing error:', err);
        audioFx.playError();
        setAssistantState('idle');
      }
    },
    [assistantConfig, audioFx, isMuted, speak]
  );

  // Speech Recognition Hook with Dual-Engine (Web Speech + Gemini Multimodal Fallback)
  const {
    isListening,
    isSupported: isSpeechRecSupported,
    liveTranscript,
    audioVolume,
    error: speechRecError,
    startListening,
    stopListening,
    toggleListening,
  } = useSpeechRecognition({
    lang: assistantConfig.voiceLang || (assistantConfig.language === 'hindi' ? 'hi-IN' : 'en-US'),
    wakeWord: assistantConfig.wakeWord || 'Nova',
    wakeWordEnabled: assistantConfig.wakeWordEnabled !== false,
    onWakeWord: () => {
      audioFx.playWake();
    },
    onResult: (finalTranscript) => {
      processUserPrompt(finalTranscript);
    },
    onAudioRecorded: (base64Audio, mimeType) => {
      processAudioPrompt(base64Audio, mimeType);
    },
  });

  // Track listening state in assistant state
  useEffect(() => {
    if (isListening && assistantState === 'idle') {
      setAssistantState('listening');
    } else if (!isListening && assistantState === 'listening') {
      setAssistantState('idle');
    }
  }, [isListening, assistantState]);

  // Update assistant settings in backend & local state
  const updateSettings = async (newConfig) => {
    setAssistantConfig((prev) => ({ ...prev, ...newConfig }));
    updateLocalUserConfig(newConfig);

    if (token) {
      try {
        await assistantApi.updateSettings(newConfig);
      } catch (e) {
        console.warn('Backend settings update error:', e);
      }
    }
  };

  // Upload custom avatar
  const uploadAvatar = async (file) => {
    try {
      const res = await assistantApi.uploadAvatar(file);
      if (res.success && res.avatarUrl) {
        await updateSettings({
          avatarUrl: res.avatarUrl,
          avatarType: 'custom',
        });
        return { success: true, url: res.avatarUrl };
      }
      return { success: false, message: res.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const clearHistory = async () => {
    setMessages([]);
    if (token) {
      try {
        await chatApi.clearHistory();
      } catch (_err) {}
    }
  };

  return (
    <AssistantContext.Provider
      value={{
        assistantConfig,
        assistantState,
        setAssistantState,
        messages,
        liveTranscript,
        activeAction,
        setActiveAction,
        isMuted,
        setIsMuted,
        soundFrequency,
        voices,
        isListening,
        audioVolume,
        isSpeaking,
        isSpeechRecSupported,
        speechRecError,
        startListening,
        stopListening,
        toggleListening,
        processUserPrompt,
        updateSettings,
        uploadAvatar,
        clearHistory,
        audioFx,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
