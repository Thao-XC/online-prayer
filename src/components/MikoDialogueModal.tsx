import React, { useState, useEffect, useRef } from 'react';
import { ShrineData } from '../types/shrine';
import { soundService } from '../services/soundService';
import { Sparkles, Send, X, Bot, RefreshCw } from 'lucide-react';

interface MikoDialogueModalProps {
  shrine: ShrineData;
  onClose: () => void;
  onConsulted?: () => void;
}

interface ChatMessage {
  sender: 'user' | 'guide';
  text: string;
  time: string;
}

export const MikoDialogueModal: React.FC<MikoDialogueModalProps> = ({
  shrine,
  onClose,
  onConsulted,
}) => {
  const isTemple = shrine.type === 'temple';
  const guideName = isTemple ? 'Master Renkai (蓮海和尚)' : 'Miko Sakura (神子 桜)';
  const guideRoleTitle = isTemple ? 'Zen Abbot & Buddhist Monk' : 'Sacred Shinto Shrine Maiden';
  const avatarEmoji = isTemple ? '🧘‍♂️' : '⛩️';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const greeting: ChatMessage = {
      sender: 'guide',
      text: isTemple
        ? `Welcome to ${shrine.name}. May the quiet spirit of the sanctuary bring stillness to your heart. How may I guide your contemplation today? 合掌`
        : `Welcome to the sacred grounds of ${shrine.name}. May the kami bestow peaceful harmony upon your visit. What guidance or blessing do you seek today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greeting]);
  }, [shrine, isTemple]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    soundService.playFootstep();
    if (onConsulted) {
      onConsulted();
    }

    try {
      const res = await fetch('/api/miko-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shrineId: shrine.id,
          shrineName: shrine.name,
          shrineType: shrine.type,
          userMessage: query,
          guideRole: isTemple ? 'monk' : 'miko',
          conversationHistory: messages,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || (isTemple
        ? 'Observe your breath like clouds passing across the mountain. All things find harmony in time. 合掌'
        : 'The sacred spirits hear your sincerity. Walk forward with peace in your steps.');

      setMessages((prev) => [
        ...prev,
        {
          sender: 'guide',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      soundService.playFuurin();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'guide',
          text: isTemple
            ? 'Quiet your heart; even amidst silence, the teachings are present. 合掌'
            : 'May the mountain wind carry your sincere hopes into the heavens.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTED_QUESTIONS = isTemple
    ? [
        'How can I release anxious thoughts and find calm?',
        `What is the history and Buddha enshrined at ${shrine.name}?`,
        'What is the meaning of Gasshō (hands pressed in prayer)?',
        'Please bestow a Zen teaching for my daily life.',
      ]
    : [
        'How do I properly cleanse myself at the Temizuya?',
        `What blessing is ${shrine.name} most famous for?`,
        'Why do we bow twice, clap twice, and bow once?',
        'What is the meaning of the vermilion Torii gates?',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-900/40 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-100 overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Vermilion Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Guide Avatar Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-stone-800 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-900/80 to-amber-900/80 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            {avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-cinzel font-bold text-amber-200">
                {guideName}
              </h3>
              <span className="text-[10px] bg-red-950/70 border border-red-500/40 text-red-300 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI Spiritual Guide
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {guideRoleTitle} • {shrine.name}
            </p>
          </div>
        </div>

        {/* Conversation Message List */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-sm font-sans"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] text-stone-400 font-medium">
                  {msg.sender === 'user' ? 'You (Pilgrim)' : guideName.split('(')[0]}
                </span>
                <span className="text-[9px] text-stone-600">{msg.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-xs'
                    : 'bg-stone-950 border border-stone-800 text-stone-200 rounded-tl-xs shadow-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-stone-400 text-xs py-2 px-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span className="font-serif italic">
                {guideName.split('(')[0]} is contemplating your words...
              </span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions Strip */}
        <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-stone-800/60">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-200 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-stone-800 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${guideName.split('(')[0]} for wisdom, lore, or ritual advice...`}
            className="flex-1 px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 disabled:opacity-40 text-amber-100 border border-amber-600/40 transition-all cursor-pointer shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
