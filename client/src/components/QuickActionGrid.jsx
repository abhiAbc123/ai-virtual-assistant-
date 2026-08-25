import React from 'react';
import { useAssistant } from '../context/AssistantContext';
import { 
  Video, 
  Code2, 
  Clock, 
  Smile, 
  Calculator, 
  Search, 
  Calendar, 
  Terminal 
} from 'lucide-react';

export const QuickActionGrid = () => {
  const { processUserPrompt, audioFx } = useAssistant();

  const actions = [
    { label: 'Open YouTube', prompt: 'Open YouTube', icon: Video, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Open GitHub', prompt: 'Open GitHub', icon: Code2, color: 'text-slate-800', bg: 'bg-slate-100' },
    { label: 'What time is it?', prompt: 'What time is it?', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tell a joke', prompt: 'Tell me a joke', icon: Smile, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Calculate 25 * 14', prompt: 'Calculate 25 * 14', icon: Calculator, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: "Today's Date", prompt: "What is today's date?", icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Search AI News', prompt: 'Search Google for latest AI breakthroughs', icon: Search, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'System Diagnostics', prompt: 'Report system diagnostics and status', icon: Terminal, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const handleClick = (prompt) => {
    if (audioFx?.playClick) audioFx.playClick();
    processUserPrompt(prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 z-20">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Quick Action Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={() => handleClick(act.prompt)}
              className="bg-white border border-slate-200 hover:border-blue-400 flex items-center space-x-2.5 p-3 rounded-xl text-left group transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${act.bg} transition-colors flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${act.color}`} />
              </div>
              <div className="font-semibold text-xs text-slate-700 group-hover:text-blue-600 truncate">
                {act.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
