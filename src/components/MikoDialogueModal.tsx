import React, { useState, useEffect, useRef } from 'react';
import { Sheet } from './ui/Sheet';
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
    <Sheet onClose={onClose} size="md" label="Guide conversation" className="p-5 sm:p-6 flex flex-col" cardClassName="h-[88dvh] sm:h-[620px]">

        {/* Guide Avatar Header */}
        <div className="flex items-center gap-3 pb-3 pr-10 border-b border-[#e3d6c0] shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f6d9cf] to-[#f1dcc0] border border-[#c9a26a] flex items-center justify-center text-2xl shadow-inner">
            {avatarEmoji}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <h3 className="text-base font-cinzel font-bold text-[#7c2d12]">
                {guideName}
              </h3>
              <span className="text-[10px] bg-[#fdecea] border border-[#e8b4a8] text-[#b91c1c] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 whitespace-nowrap">
                <Bot className="w-3 h-3" /> AI Spiritual Guide
              </span>
            </div>
            <p className="text-xs text-[#6d5b49] truncate">
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
                <span className="text-[10px] text-[#6d5b49] font-medium">
                  {msg.sender === 'user' ? 'You (Pilgrim)' : guideName.split('(')[0]}
                </span>
                <span className="text-[9px] text-stone-600">{msg.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#b91c1c] text-white font-medium rounded-tr-xs'
                    : 'bg-[#fffcf6] border border-[#e3d6c0] text-[#2c241c] rounded-tl-xs shadow-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-[#6d5b49] text-xs py-2 px-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#b45309]" />
              <span className="font-serif italic">
                {guideName.split('(')[0]} is contemplating your words...
              </span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions Strip */}
        <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-[#e3d6c0]">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#fffcf6] hover:bg-[#ece2cf] border border-[#e3d6c0] text-[#4a3c2e] hover:text-[#7c2d12] transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#b45309]" />
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
          className="flex items-center gap-2 pt-2 border-t border-[#e3d6c0] shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${guideName.split('(')[0]} for wisdom, lore, or ritual advice...`}
            className="flex-1 px-3.5 py-2.5 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl text-xs sm:text-sm text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] disabled:opacity-40 text-[#fff7e6] border border-[#d6b98c] transition-all cursor-pointer shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
    </Sheet>
  );
};
