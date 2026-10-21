import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

interface QuestToastProps {
  message: string;
  subMessage?: string;
  onDismiss: () => void;
}

export const QuestToast: React.FC<QuestToastProps> = ({
  message,
  subMessage,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-stone-900/95 via-amber-950/90 to-stone-900/95 border border-amber-500/60 text-stone-100 shadow-2xl backdrop-blur-md">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-amber-100 shadow shrink-0">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-semibold text-amber-200">
            {message}
          </div>
          {subMessage && (
            <div className="text-[11px] text-stone-300 font-sans">
              {subMessage}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors ml-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
