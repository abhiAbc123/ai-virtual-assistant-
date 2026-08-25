import React, { useState, useEffect } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { Mic, Send, Radio, Info } from 'lucide-react';

export const VoiceController = () => {
  const {
    isListening,
    liveTranscript,
    toggleListening,
    processUserPrompt,
    assistantState,
    assistantConfig,
    updateSettings,
    isSpeechRecSupported,
    speechRecError,
    audioFx,
  } = useAssistant();

  const [inputVal, setInputVal] = useState('');

  // Sync spoken words directly into the textbox in real-time
  useEffect(() => {
    if (liveTranscript) {
      setInputVal(liveTranscript);
    }
  }, [liveTranscript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    if (audioFx?.playClick) audioFx.playClick();
    processUserPrompt(inputVal.trim());
    setInputVal('');
  };

  const isBusy = assistantState === 'processing' || assistantState === 'speaking';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center space-y-4 z-20">
      
      {/* Central Voice Button Orb */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring during listening */}
        {isListening && (
          <>
            <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-emerald-400/40 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          type="button"
          onClick={() => {
            if (audioFx?.playClick) audioFx.playClick();
            toggleListening();
          }}
          className={`relative group w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200 transform active:scale-95 cursor-pointer ${
            isListening
              ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-105'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 hover:scale-105'
          }`}
          title={isListening ? 'Click to Stop Listening' : 'Click to Speak (Web Speech API)'}
        >
          {isListening ? (
            <Mic className="w-8 h-8 animate-bounce" />
          ) : (
            <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Voice Status & Wake Word Ticker */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={() => {
            if (audioFx?.playClick) audioFx.playClick();
            updateSettings({ wakeWordEnabled: !assistantConfig.wakeWordEnabled });
          }}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            assistantConfig.wakeWordEnabled
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Wake Word: "{assistantConfig.wakeWord || 'Jarvis'}" ({assistantConfig.wakeWordEnabled ? 'ON' : 'OFF'})</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          {isListening ? '🎙️ Listening... Speak your query' : '💡 Tap microphone or type a command'}
        </div>
      </div>

      {/* Fallback Text Input Bar */}
      <form onSubmit={handleSubmit} className="w-full relative flex items-center">
        <div className="w-full relative flex items-center bg-white border border-slate-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl shadow-sm transition-all">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Ask ${assistantConfig.name || 'Assistant'} anything or type "Open YouTube", "Calculate 15 * 84"...`}
            className="w-full px-5 py-3.5 pr-14 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isBusy}
            className="absolute right-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Speech Recognition Error notification */}
      {speechRecError && (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{speechRecError}</span>
        </div>
      )}

    </div>
  );
};
