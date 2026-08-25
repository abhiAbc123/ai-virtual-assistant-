import React from 'react';
import { useAssistant } from '../context/AssistantContext';
import { HologramVisualizer } from './HologramVisualizer';
import { Mic, Cpu, Volume2, Radio } from 'lucide-react';

export const AssistantAvatar = () => {
  const { assistantConfig, assistantState, liveTranscript } = useAssistant();

  const getStatusIcon = () => {
    switch (assistantState) {
      case 'listening':
        return <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />;
      case 'processing':
        return <Cpu className="w-3.5 h-3.5 text-amber-600 animate-spin" />;
      case 'speaking':
        return <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />;
      default:
        return <Radio className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (assistantState) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Ready & Standing By';
    }
  };

  const isSpeaking = assistantState === 'speaking';
  const isListening = assistantState === 'listening';

  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none">
      
      {/* Visualizer Canvas Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
        
        {/* Holographic Circular Audio Wave Visualizer */}
        <HologramVisualizer size={340} />

        {/* Outer Rotating HUD Rings */}
        <div className="absolute inset-2 sm:inset-4 rounded-full border border-dashed border-blue-200 animate-spin-cw pointer-events-none" />
        <div className="absolute inset-6 sm:inset-8 rounded-full border border-dotted border-blue-100 animate-spin-ccw pointer-events-none" />
        
        {/* Subtle Glow Behind Avatar */}
        <div 
          className={`absolute inset-10 sm:inset-12 rounded-full transition-all duration-500 pointer-events-none ${
            isSpeaking 
              ? 'bg-blue-100/60 scale-105 shadow-xl shadow-blue-500/10' 
              : isListening
              ? 'bg-emerald-100/60 scale-102 shadow-xl shadow-emerald-500/10'
              : 'bg-slate-100/60'
          }`} 
        />

        {/* Central Avatar Image */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white bg-white shadow-xl shadow-slate-200/80 z-20 group">
          <img
            src={assistantConfig.avatarUrl || '/assets/avatars/avatar-1.svg'}
            alt={assistantConfig.name || 'Assistant Avatar'}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isSpeaking ? 'scale-105' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.target.src = '/assets/avatars/avatar-1.svg';
            }}
          />
        </div>

      </div>

      {/* Assistant Persona & Status Badge */}
      <div className="mt-3 flex flex-col items-center text-center space-y-1.5 z-20">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
          {getStatusIcon()}
          <span className="text-xs font-semibold text-slate-700">
            {getStatusText()}
          </span>
        </div>

        {/* Live speech transcription ticker if user is speaking */}
        {liveTranscript && (
          <div className="mt-2 px-4 py-1.5 max-w-md rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium italic shadow-sm animate-fadeIn">
            "{liveTranscript}"
          </div>
        )}
      </div>

    </div>
  );
};
