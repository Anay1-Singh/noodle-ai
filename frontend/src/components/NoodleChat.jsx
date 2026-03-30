import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Send, Brain, Sparkles, RefreshCw, ArrowLeft,
  Plus, MessageSquare, Trash2, X, PanelLeftClose, PanelLeft,
  Activity, Apple, Dumbbell, Droplets, CalendarDays, Beef, Pill, TrendingUp, Flame, BarChart4, Trophy, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

/* ──────────────────────────────────────────────────────
   PROMPT SUGGESTIONS — fitness-focused, per tier
   ────────────────────────────────────────────────────── */
const PROMPTS = {
  easy: [
    { text: 'Create a simple stretching routine for me', icon: <Activity size={16}/> },
    { text: 'What should I eat before a morning workout?', icon: <Apple size={16}/> },
    { text: 'Give me a beginner-friendly push-up plan', icon: <Dumbbell size={16}/> },
    { text: 'How much water should I drink daily?', icon: <Droplets size={16}/> },
  ],
  medium: [
    { text: 'Design a 4-day split training program', icon: <CalendarDays size={16}/> },
    { text: 'Calculate my protein intake for muscle gain', icon: <Beef size={16}/> },
    { text: 'What supplements are worth taking?', icon: <Pill size={16}/> },
    { text: 'Help me break through my bench press plateau', icon: <TrendingUp size={16}/> },
  ],
  hard: [
    { text: 'Build a periodized powerlifting program', icon: <Flame size={16}/> },
    { text: 'Analyze my training volume for overreach', icon: <BarChart4 size={16}/> },
    { text: 'Design a competition peak week strategy', icon: <Trophy size={16}/> },
    { text: 'Program a concurrent strength & conditioning block', icon: <Zap size={16}/> },
  ],
};

/* ──────────────────────────────────────────────────────
   THEME COLORS by tier
   ────────────────────────────────────────────────────── */
const THEMES = {
  easy:   { accent: '#10b981', accentLight: '#34d399', bg: '#111114', card: '#18181c', border: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.08)' },
  medium: { accent: '#c9a96e', accentLight: '#e0c88a', bg: '#0f1219', card: '#161b26', border: 'rgba(201,169,110,0.15)', glow: 'rgba(201,169,110,0.08)' },
  hard:   { accent: '#f59e0b', accentLight: '#fbbf24', bg: '#0a0a0a', card: '#141414', border: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.08)' },
};

/* ──────────────────────────────────────────────────────
   NOODLE CHAT COMPONENT
   Props:
     tier         — 'easy' | 'medium' | 'hard'
     messages     — [{ role: 'user'|'ai', text }]
     onSend       — (text) => void
     isLoading    — bool
     onClose      — () => void
     userName     — string
     userAvatar   — string|null
     creditInfo   — { used, limit, isPremium } (optional)
     chatHistory  — [{ id, title, messages, date }] (optional)
     onNewChat    — () => void (optional)
     onLoadChat   — (chat) => void (optional)
     onDeleteChat — (id) => void (optional)
     activeChatId — string (optional)
   ────────────────────────────────────────────────────── */
export default function NoodleChat({
  tier = 'easy',
  messages = [],
  onSend,
  isLoading = false,
  onClose,
  userName = 'there',
  userAvatar = null,
  creditInfo = null,
  chatHistory = [],
  onNewChat,
  onLoadChat,
  onDeleteChat,
  activeChatId,
}) {
  const [input, setInput] = useState('');
  const [prompts, setPrompts] = useState(PROMPTS[tier] || PROMPTS.easy);
  const [sidebar, setSidebar] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const theme = THEMES[tier] || THEMES.easy;

  const isFirstMessage = messages.length <= 1 && messages[0]?.role === 'ai';
  const limitReached = creditInfo && !creditInfo.isPremium && creditInfo.used >= creditInfo.limit;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading || limitReached) return;
    onSend(input.trim());
    setInput('');
  };

  const handlePrompt = (text) => {
    onSend(text);
  };

  const refreshPrompts = () => {
    const pool = PROMPTS[tier] || PROMPTS.easy;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setPrompts(shuffled);
  };

  const hasHistory = chatHistory && chatHistory.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="fixed inset-0 z-50 flex text-white overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: theme.bg }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .noodle-chat-scroll::-webkit-scrollbar { width: 4px; }
        .noodle-chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .noodle-chat-scroll::-webkit-scrollbar-thumb { background: ${theme.accent}20; border-radius: 100px; }
      `}</style>

      {/* ═══ SIDEBAR ═══ */}
      <AnimatePresence>
        {sidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col overflow-hidden border-r shrink-0"
            style={{ background: '#000', borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="p-3">
              <button onClick={onNewChat}
                className="flex items-center gap-2 w-full p-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: `1px solid rgba(255,255,255,0.08)`, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                <Plus className="w-4 h-4" /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3 noodle-chat-scroll">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2" style={{ color: 'rgba(255,255,255,0.2)' }}>History</div>
              {!hasHistory ? (
                <div className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>No past chats</div>
              ) : (
                chatHistory.map(ch => (
                  <div key={ch.id} onClick={() => onLoadChat?.(ch)}
                    className="group flex items-center gap-2 px-3 py-2.5 rounded-lg mb-1 transition-all cursor-pointer"
                    style={{
                      background: activeChatId === ch.id ? `${theme.accent}12` : 'transparent',
                      border: activeChatId === ch.id ? `1px solid ${theme.accent}20` : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (activeChatId !== ch.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (activeChatId !== ch.id) e.currentTarget.style.background = 'transparent'; }}>
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                    <span className="flex-1 text-[12px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{ch.title}</span>
                    {onDeleteChat && (
                      <button onClick={e => { e.stopPropagation(); onDeleteChat(ch.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Trash2 className="w-3 h-3 text-red-400/50" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <button onClick={onClose}
                className="flex items-center gap-2 w-full p-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN AREA ═══ */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-4 shrink-0 z-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: `${theme.bg}ee`, backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebar(!sidebar)}
              className="p-2 rounded-lg transition-all"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {sidebar ? <PanelLeftClose className="w-[18px] h-[18px]" /> : <PanelLeft className="w-[18px] h-[18px]" />}
            </button>
            {onNewChat && (
              <button onClick={onNewChat}
                className="p-2 rounded-lg transition-all"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Plus className="w-[18px] h-[18px]" />
              </button>
            )}
            <div className="flex items-center gap-2 ml-1">
              <span className="text-[14px] font-semibold text-white/80">Noodle AI</span>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: `${theme.accent}15`, color: theme.accent, border: `1px solid ${theme.accent}25` }}>
                {tier}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto noodle-chat-scroll">
          <div className="max-w-3xl mx-auto px-4 sm:px-8">

            {/* ═══ WELCOME SCREEN (shown when no user messages yet) ═══ */}
            {isFirstMessage && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center justify-center pt-[15vh] pb-8">

                {/* Logo */}
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
                  style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}20` }}>
                  <Sparkles className="w-7 h-7" style={{ color: theme.accent }} />
                </motion.div>

                {/* Greeting */}
                <motion.h1
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[28px] sm:text-[36px] font-bold tracking-tight mb-1">
                  <span className="text-white/50">Hi </span>
                  <span style={{ color: theme.accent }}>{userName}</span>
                  <span className="text-white/50">,</span>
                </motion.h1>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[28px] sm:text-[36px] font-bold tracking-tight text-white mb-3">
                  What can I help with?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[13px] mb-8"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Use a prompt below or type your own question to begin
                </motion.p>

                {/* Prompt Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-3 w-full max-w-xl mb-4">
                  {prompts.map((p, i) => (
                    <motion.button key={i}
                      whileHover={{ y: -2, borderColor: `${theme.accent}30` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handlePrompt(p.text)}
                      className="text-left p-4 rounded-xl transition-all flex flex-col gap-2"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                      }}>
                      <span className="text-[13px] font-medium text-white/70 leading-snug">{p.text}</span>
                      <span className="text-lg mt-auto">{p.icon}</span>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Refresh */}
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={refreshPrompts}
                  whileTap={{ rotate: 180 }}
                  className="flex items-center gap-1.5 text-[12px] font-medium transition-all"
                  style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RefreshCw className="w-3 h-3" /> Refresh Prompts
                </motion.button>
              </motion.div>
            )}

            {/* ═══ MESSAGES ═══ */}
            {!isFirstMessage && (
              <div className="pt-8 pb-32 space-y-6">
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i === messages.length - 1 ? 0.05 : 0, duration: 0.25 }}
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start w-full pr-4 md:pr-8'}`}>

                    {/* AI avatar */}
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
                        style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}20` }}>
                        <Sparkles className="w-4 h-4" style={{ color: theme.accent }} />
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`${
                      msg.role === 'user'
                        ? 'max-w-[85%] text-sm leading-relaxed rounded-2xl rounded-br-md px-4 py-3 font-medium'
                        : 'flex-1 text-base leading-[1.75] pt-1 pb-2'
                    }`} style={
                      msg.role === 'user' ? { background: theme.accent, color: '#000' } : { color: 'rgba(255,255,255,0.92)' }
                    }>
                      {msg.role === 'ai' ? (
                        <div className="prose prose-invert max-w-none prose-p:leading-[1.75] prose-p:my-3 prose-p:first:mt-0 prose-p:last:mb-0 prose-ul:my-3 prose-li:my-1 prose-headings:my-4 font-normal tracking-wide">
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : msg.text}
                    </div>

                    {/* User avatar */}
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mt-1" style={{ border: `1px solid ${theme.accent}25` }}>
                        {userAvatar
                          ? <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center" style={{ background: theme.card }}>
                              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                {userName?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                        }
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
                      style={{ background: `${theme.accent}15`, border: `1px solid ${theme.accent}20` }}>
                      <Sparkles className="w-4 h-4 animate-pulse" style={{ color: theme.accent }} />
                    </div>
                    <div className="rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: `${theme.accent}60`, animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ INPUT AREA ═══ */}
        <div className="shrink-0 px-4 pb-5 pt-3" style={{ background: `linear-gradient(to top, ${theme.bg}, ${theme.bg}ee, transparent)` }}>
          <div className="max-w-3xl mx-auto">
            {/* Credits bar */}
            {creditInfo && (
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-medium" style={{
                  color: limitReached ? '#ef4444' : creditInfo.isPremium ? theme.accent : 'rgba(255,255,255,0.25)',
                }}>
                  {creditInfo.isPremium ? 'Unlimited messages' : limitReached ? 'Daily limit reached' : `${creditInfo.limit - creditInfo.used} messages remaining`}
                </span>
              </div>
            )}

            {limitReached && (
              <div className="mb-2 px-4 py-2.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                You've reached your daily limit. Upgrade to Premium for unlimited chats.
              </div>
            )}

            {/* Input box */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: theme.card, border: `1px solid rgba(255,255,255,0.06)`, boxShadow: `0 4px 24px rgba(0,0,0,0.3)` }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={limitReached ? 'Daily limit reached…' : 'Ask anything about fitness…'}
                disabled={isLoading || limitReached}
                rows={1}
                className="w-full bg-transparent px-5 pt-4 pb-10 text-[14px] resize-none focus:outline-none placeholder:text-white/20 disabled:opacity-40"
                style={{ color: '#fff', minHeight: 60, maxHeight: 160 }}
              />
              {/* Bottom row */}
              <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Future: attachments, image buttons */}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium" style={{ color: input.length > 900 ? '#ef4444' : 'rgba(255,255,255,0.15)' }}>
                    {input.length}/1000
                  </span>
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading || limitReached}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: input.trim() && !isLoading && !limitReached ? theme.accent : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    }}>
                    <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !isLoading ? '#000' : 'rgba(255,255,255,0.2)' }} />
                  </motion.button>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] mt-2.5 font-medium" style={{ color: 'rgba(255,255,255,0.12)' }}>
              Noodle AI can make mistakes. Always consult a professional for health concerns.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
