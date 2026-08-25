import { useRef, useCallback, useState } from 'react';

/**
 * Web Audio API procedural sound synthesizer for futuristic JARVIS HUD effects
 */
export const useAudioFx = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = useCallback((freq, duration = 0.1, type = 'sine', gainVal = 0.08) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context error ignored
    }
  }, [isMuted]);

  // JARVIS Wake Up Chime
  const playWake = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }, [isMuted]);

  // UI Tap / Click
  const playClick = useCallback(() => {
    playTone(1200, 0.04, 'sine', 0.04);
  }, [playTone]);

  // Processing telemetry
  const playProcessing = useCallback(() => {
    playTone(720, 0.06, 'triangle', 0.03);
  }, [playTone]);

  // Action executed
  const playAction = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }, [isMuted]);

  // Error alert
  const playError = useCallback(() => {
    playTone(180, 0.2, 'sawtooth', 0.08);
  }, [playTone]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return {
    isMuted,
    toggleMute,
    playWake,
    playClick,
    playProcessing,
    playAction,
    playError,
  };
};
