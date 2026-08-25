import React, { useState } from 'react';
import { useAssistant } from '../context/AssistantContext';
import { 
  X, 
  Trash2, 
  Volume2, 
  Search, 
  ExternalLink, 
  User, 
  MessageSquare
} from 'lucide-react';

export const ChatDrawer = ({ isOpen, onClose }) => {
  const { 
    messages, 
    clearHistory, 
    assistantConfig, 
    audioFx, 
  } = useAssistant();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReplayVoice = (text) => {
    if (audioFx?.playClick) audioFx.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = assistantConfig.voiceSpeed || 1.0;
      utterance.pitch = assistantConfig.voicePitch || 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={() => {
          if (audioFx?.playClick) audioFx.playClick();
          onClose();
        }}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="font-hud font-bold text-sm text-slate-900">
              Conversation History
            </h2>
          </div>

          <div className="flex items-center space-x-1.5">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all conversation history?')) {
                    if (audioFx?.playClick) audioFx.playClick();
                    clearHistory();
                  }
                }}
                title="Clear Logs"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                if (audioFx?.playClick) audioFx.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2 opacity-60" />
              <div className="font-semibold text-xs text-slate-600">No Messages Found</div>
              <p className="text-xs mt-1 text-slate-400">
                Communications and assistant responses will be displayed here.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isUser ? 'You' : assistantConfig.name || 'Assistant'}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`relative max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-500/10'
                        : 'bg-slate-100 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div>{msg.content}</div>

                    {/* Action link */}
                    {msg.action && msg.action.type !== 'none' && msg.action.payload?.url && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-600 uppercase text-[10px]">
                          {msg.action.payload.label || 'Action Link'}
                        </span>
                        <a
                          href={msg.action.payload.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-0.5 text-blue-600 font-semibold hover:underline"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}

                    {/* Voice Replay */}
                    {!isUser && (
                      <button
                        onClick={() => handleReplayVoice(msg.content)}
                        title="Replay Voice"
                        className="absolute bottom-1 right-1.5 p-1 text-slate-400 hover:text-blue-600 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
