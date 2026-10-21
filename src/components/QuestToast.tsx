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
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#f6efe2] via-[#f6e3c8] to-[#f1e8d7] border border-[#c9a26a] text-[#2c241c] shadow-2xl backdrop-blur-md">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#b91c1c] to-[#c2410c] flex items-center justify-center text-[#fff7e6] shadow shrink-0">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-semibold text-[#7c2d12]">
            {message}
          </div>
          {subMessage && (
            <div className="text-[11px] text-[#4a3c2e] font-sans">
              {subMessage}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-[#6d5b49] hover:text-[#2c241c] hover:bg-[#ece2cf] transition-colors ml-2 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
