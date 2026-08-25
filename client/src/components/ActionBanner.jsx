import React from 'react';
import { useAssistant } from '../context/AssistantContext';
import { ExternalLink, CheckCircle2, X } from 'lucide-react';

export const ActionBanner = () => {
  const { activeAction, setActiveAction, audioFx } = useAssistant();

  if (!activeAction) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xl animate-slideUp">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">
              Action Executed
            </div>
            <div className="text-xs font-semibold text-slate-800">
              {activeAction.label || 'Action triggered'}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (audioFx?.playClick) audioFx.playClick();
            setActiveAction(null);
          }}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {activeAction.url && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <a
            href={activeAction.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
