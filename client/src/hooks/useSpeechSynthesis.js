import { useState, useEffect, useRef, useCallback } from 'react';

// Helper to detect if a text contains Hindi / Devanagari script
export const isHindiText = (text) => {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
};

// Helper to detect if a voice is Hindi
export const isHindiVoice = (voice) => {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase();
  const name = (voice.name || '').toLowerCase();
  return (
    lang.startsWith('hi') ||
    lang.includes('hi-in') ||
    lang.includes('hi_in') ||
    name.includes('hindi') ||
    name.includes('हिन्दी') ||
    name.includes('swara') ||
    name.includes('madhur') ||
    name.includes('kalpana') ||
    name.includes('hemant')
  );
};

// Helper to detect if a voice name is female / girl
export const isFemaleVoice = (voice) => {
  if (!voice) return false;
  const name = (voice.name || '').toLowerCase();
  return (
    name.includes('zira') ||
    name.includes('swara') ||
    name.includes('kalpana') ||
    name.includes('jenny') ||
    name.includes('aria') ||
    name.includes('sonia') ||
    name.includes('samantha') ||
    name.includes('victoria') ||
    name.includes('karen') ||
    name.includes('female') ||
    name.includes('woman') ||
    name.includes('girl') ||
    name.includes('moira') ||
    name.includes('tessa') ||
    name.includes('fiona') ||
    name.includes('veena') ||
    name.includes('google uk english female') ||
    name.includes('google us english') ||
    name.includes('google हिन्दी')
  );
};

export const useSpeechSynthesis = ({ onStart, onEnd, onBoundary }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });

  const synthRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  const onBoundaryRef = useRef(onBoundary);

  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    onBoundaryRef.current = onBoundary;
  }, [onBoundary]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      loadVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text, options = {}) => {
      if (!synthRef.current || !text) return;

      // Stop any ongoing speech
      synthRef.current.cancel();

      const {
        voiceName = '',
        voiceLang = 'en-US',
        voicePitch = 1.0,
        voiceSpeed = 1.0,
        gender = 'auto', // 'female' | 'male' | 'auto'
      } = options;

      const isHindi = isHindiText(text) || voiceLang.startsWith('hi');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = Math.max(0.5, Math.min(2.0, voicePitch));
      utterance.rate = Math.max(0.5, Math.min(2.0, voiceSpeed));
      utterance.lang = isHindi ? 'hi-IN' : (voiceLang || 'en-US');

      if (voices.length > 0) {
        // 1. Explicit voice name requested
        if (voiceName) {
          const found = voices.find((v) => v.name === voiceName);
          if (found) {
            utterance.voice = found;
          }
        }

        // 2. If Hindi text / language: Select best Hindi voice
        if (!utterance.voice && isHindi) {
          if (gender === 'female' || voicePitch > 1.05) {
            const hindiFemale = voices.find(
              (v) => isHindiVoice(v) && isFemaleVoice(v)
            );
            if (hindiFemale) utterance.voice = hindiFemale;
          } else if (gender === 'male' || voicePitch <= 1.05) {
            const hindiMale = voices.find(
              (v) => isHindiVoice(v) && !isFemaleVoice(v)
            );
            if (hindiMale) utterance.voice = hindiMale;
          }

          if (!utterance.voice) {
            const anyHindi = voices.find((v) => isHindiVoice(v));
            if (anyHindi) utterance.voice = anyHindi;
          }
        }

        // 3. If English female voice requested
        if (!utterance.voice && (gender === 'female' || voicePitch > 1.05)) {
          const femaleVoice = voices.find(
            (v) => v.lang.startsWith('en') && isFemaleVoice(v)
          );
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
        }

        // 4. Fallback: Preferred natural voices
        if (!utterance.voice) {
          const preferred = voices.find(
            (v) =>
              (isHindi && isHindiVoice(v)) ||
              (v.lang.startsWith('en') &&
                (v.name.includes('Google') ||
                  v.name.includes('Natural') ||
                  v.name.includes('Swara') ||
                  v.name.includes('Zira') ||
                  v.name.includes('Jenny') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('David') ||
                  v.name.includes('Daniel')))
          );
          if (preferred) {
            utterance.voice = preferred;
          }
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onStartRef.current) onStartRef.current();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndRef.current) onEndRef.current();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        if (onEndRef.current) onEndRef.current();
      };

      if (onBoundaryRef.current) {
        utterance.onboundary = (e) => {
          if (onBoundaryRef.current) onBoundaryRef.current(e);
        };
      }

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [voices]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    speak,
    stop,
  };
};
