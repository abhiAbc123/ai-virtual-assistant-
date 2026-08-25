import { useState, useEffect, useRef, useCallback } from 'react';

const getSpeechRecognitionClass = () => {
  if (typeof window === 'undefined') return null;
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    null
  );
};

export const useSpeechRecognition = ({
  onResult,
  onAudioRecorded,
  onWakeWord,
  wakeWord = 'Jarvis',
  wakeWordEnabled = true,
  lang = 'en-US',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioVolume, setAudioVolume] = useState(0);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);
  const maxTimeoutRef = useRef(null);

  const isListeningRef = useRef(false);
  const hadWebSpeechResultRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef(0);

  const onResultRef = useRef(onResult);
  const onAudioRecordedRef = useRef(onAudioRecorded);
  const onWakeWordRef = useRef(onWakeWord);
  const silenceTimerRef = useRef(null);
  const latestTranscriptRef = useRef('');

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onAudioRecordedRef.current = onAudioRecorded;
  }, [onAudioRecorded]);

  useEffect(() => {
    onWakeWordRef.current = onWakeWord;
  }, [onWakeWord]);

  // Clean up Web Audio & Stream
  const cleanupStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }
    setAudioVolume(0);
  }, []);

  // Clean up recognition
  const cleanupRecognition = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    cleanupStream();
  }, [cleanupStream]);

  // Stop listening cleanly & finalize turn
  const stopListening = useCallback(() => {
    console.log('[Voice Engine] Stopping listening session...');
    isListeningRef.current = false;
    setIsListening(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }

    // Stop Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder if recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    } else {
      cleanupStream();
    }
  }, [cleanupStream]);

  // Commit text transcript if Web Speech API captured text
  const commitTranscript = useCallback((text) => {
    const trimmed = (text || latestTranscriptRef.current || '').trim();
    if (trimmed) {
      hadWebSpeechResultRef.current = true;
      console.log('[Voice Engine] Web Speech commit transcript:', trimmed);
      stopListening();
      if (onResultRef.current) {
        onResultRef.current(trimmed);
      }
    }
  }, [stopListening]);

  // Start listening with Dual Engine
  const startListening = useCallback(async () => {
    setError(null);
    setLiveTranscript('');
    latestTranscriptRef.current = '';
    hadWebSpeechResultRef.current = false;
    hasSpokenRef.current = false;
    lastSpeechTimeRef.current = 0;
    audioChunksRef.current = [];

    // Cancel assistant TTS output if playing
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    cleanupRecognition();
    isListeningRef.current = true;
    setIsListening(true);

    // 1. Start Native Web Speech API for real-time live typing
    const SpeechRecognition = getSpeechRecognitionClass();
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log('[Voice Engine] Web Speech Recognition started.');
          isListeningRef.current = true;
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            const text = item[0]?.transcript || '';
            if (item.isFinal) {
              final += text;
            } else {
              interim += text;
            }
          }

          const currentText = (final || interim).trim();
          if (currentText) {
            console.log('[Voice Engine] Spoken text:', currentText);
            setLiveTranscript(currentText);
            latestTranscriptRef.current = currentText;

            // Wake word trigger
            if (wakeWordEnabled && wakeWord) {
              const regex = new RegExp(`(?:hey\\s+)?${wakeWord}`, 'i');
              if (regex.test(currentText)) {
                if (onWakeWordRef.current) onWakeWordRef.current();
              }
            }

            if (final && final.trim()) {
              commitTranscript(final.trim());
              return;
            }

            // Silence debounce for continuous speech
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (latestTranscriptRef.current) {
                commitTranscript(latestTranscriptRef.current);
              }
            }, 1400);
          }
        };

        recognition.onerror = (event) => {
          console.log('[Voice Engine] Web Speech error:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Click the lock/settings icon in the address bar.');
          }
        };

        recognition.onend = () => {
          if (latestTranscriptRef.current) {
            commitTranscript(latestTranscriptRef.current);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (recErr) {
        console.warn('[Voice Engine] Web Speech start exception:', recErr);
      }
    }

    // 2. Start MediaRecorder & Audio Volume Visualizer in background
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        // Web Audio analyser for volume reactivity
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const audioCtx = new AudioContext();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!isListeningRef.current) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length / 255;
              setAudioVolume(avg);

              // Voice Activity Detection (Auto-commit after silence)
              if (avg > 0.035) {
                hasSpokenRef.current = true;
                lastSpeechTimeRef.current = Date.now();
              } else if (hasSpokenRef.current && lastSpeechTimeRef.current > 0 && Date.now() - lastSpeechTimeRef.current > 1400) {
                hasSpokenRef.current = false;
                console.log('[Voice Engine] 1.4s silence detected after speech. Auto-committing...');
                stopListening();
                return;
              }

              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch (e) {}

        // MediaRecorder audio capture
        if (typeof MediaRecorder !== 'undefined') {
          const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : '';

          const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            cleanupStream();
            const chunks = audioChunksRef.current;
            audioChunksRef.current = [];

            if (hadWebSpeechResultRef.current) {
              return;
            }

            if (chunks.length > 0) {
              const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
              if (audioBlob.size < 400) return;

              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = () => {
                const base64Data = reader.result;
                if (base64Data && onAudioRecordedRef.current) {
                  onAudioRecordedRef.current(base64Data, recorder.mimeType || 'audio/webm');
                }
              };
            }
          };

          recorder.start(250);
        }
      }
    } catch (err) {
      console.warn('[Voice Engine] Media stream error:', err);
    }

    // Safety timeout after 15 seconds
    maxTimeoutRef.current = setTimeout(() => {
      if (isListeningRef.current) {
        stopListening();
      }
    }, 15000);
  }, [cleanupRecognition, cleanupStream, commitTranscript, lang, stopListening, wakeWord, wakeWordEnabled]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current || isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  return {
    isListening,
    isSupported,
    liveTranscript,
    audioVolume,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
};
