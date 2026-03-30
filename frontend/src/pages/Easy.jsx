import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Settings, LogOut, ArrowLeft, Moon as MoonIcon, Activity, Flame, Zap, Target,
  Dumbbell, ChevronRight, TrendingUp, Clock, Calendar, Check, Star, Smile, Meh, Frown, CloudRain, Wind, Sparkles, Heart, Leaf, RefreshCw, Droplets, Plus, User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import * as THREE from 'three';
import WAVES from 'vanta/dist/vanta.waves.min';
import AvatarSelectModal from '../components/AvatarSelectModal';
import ProfileBar from '../components/ProfileBar';
import NoodleXButton from '../components/NoodleXButton';
import NoodleChat from '../components/NoodleChat';
import { loadChatHistory, saveChatSession, deleteChatSession } from '../utils/chatStorage';

// ─── Helpers ───
const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const todayStr = () => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Animation ───
const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };
const stag = { animate: { transition: { staggerChildren: 0.06 } } };
const cFade = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function EasyDashboard() {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Profile
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profile, setProfile] = useState({ name: 'Explorer' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // All stats start at 0 — logical defaults
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMins, setActiveMins] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]); // Mon-Sun
  const [streak, setStreak] = useState(0);
  const [moodLog, setMoodLog] = useState([]);
  const [activeMood, setActiveMood] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  // Section nav (like medium.jsx)
  const [activeSection, setActiveSection] = useState(null);

  // AI Chat
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: "Hey! I'm your Noodle Wellness Coach. Ask me anything about workouts, nutrition, or wellness." }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [credits, setCredits] = useState({ used: 0, limit: 10, isPremium: false });
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(Date.now().toString());

  // ─── Effects ───
  useEffect(() => {
    const load = async () => {
      try {
        const s = localStorage.getItem('user');
        if (s) { const u = JSON.parse(s); if (u.avatar) setProfilePhoto(u.avatar); setProfile({ name: u.name || 'Explorer', ...u }); }
      } catch { }

      const ch = await loadChatHistory('easy');
      setChatHistory(ch);

      try {
        const r = await fetch('http://localhost:5000/api/user/wellness', {
          credentials: 'include'
        });
        if (r.ok) {
          const d = await r.json();
          const today = new Date().toDateString();
          if (d.date === today) {
            setSteps(d.steps || 0); setCalories(d.calories || 0); setActiveMins(d.activeMins || 0);
            setWaterGlasses(d.water || 0); setSleepHours(d.sleep || 0); setStreak(d.streak || 0);
            setWeeklyActivity(d.weekly || [0, 0, 0, 0, 0, 0, 0]);
            setMoodLog(d.moodLog || []); setActivityLog(d.activityLog || []);
          }
        }
      } catch { }
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('noodle_profile_update', load);
    const hm = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', hm);
    return () => { window.removeEventListener('storage', load); window.removeEventListener('noodle_profile_update', load); window.removeEventListener('mousemove', hm); };
  }, []);

  // Persist data on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch('http://localhost:5000/api/user/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: new Date().toDateString(), steps, calories, activeMins, water: waterGlasses,
          sleep: sleepHours, streak, weekly: weeklyActivity, moodLog, activityLog
        })
      }).catch(() => { });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [steps, calories, activeMins, waterGlasses, sleepHours, streak, weeklyActivity, moodLog, activityLog]);

  // Vanta.js WAVES background
  useEffect(() => {
    if (!vantaRef.current) return;
    vantaEffect.current = WAVES({
      el: vantaRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x0a0a0a,
      shininess: 35.00,
      waveHeight: 15.0,
      waveSpeed: 0.7,
      zoom: 0.75,
    });
    return () => { if (vantaEffect.current) vantaEffect.current.destroy(); };
  }, []);



  // ─── Functions ───
  const handleAvatarSelect = (url) => {
    setProfilePhoto(url);
    const s = localStorage.getItem('user'); let u = {}; if (s) try { u = JSON.parse(s); } catch { }
    u.avatar = url; localStorage.setItem('user', JSON.stringify(u));
    window.dispatchEvent(new Event('noodle_profile_update'));
  };

  const logActivity = (name, cals, mins, stepsAdd) => {
    setCalories(p => p + cals); setActiveMins(p => p + mins); setSteps(p => p + stepsAdd);
    const dayIdx = (new Date().getDay() + 6) % 7; // Mon=0
    setWeeklyActivity(w => { const n = [...w]; n[dayIdx] = (n[dayIdx] || 0) + mins; return n; });
    setActivityLog(p => [{ name, cals, mins, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...p.slice(0, 9)]);
  };

  const fetchCredits = async () => {
    try { const r = await fetch('http://localhost:5000/api/ai/credits?tier=easy', { credentials: 'include' }); if (r.ok) setCredits(await r.json()); } catch { }
  };
  useEffect(() => { fetchCredits(); }, []);

  const sendChat = async (msg) => {
    if (!msg?.trim() || aiLoading) return;
    const nm = [...chatMessages, { role: 'user', text: msg }];
    setChatMessages(nm); setAiLoading(true);
    try {
      const r = await fetch('http://localhost:5000/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ message: msg, tier: 'easy' }) });
      if (r.status === 403) { setChatMessages([...nm, { role: 'ai', text: 'Daily limit reached.' }]); fetchCredits(); setAiLoading(false); return; }
      if (!r.ok) {
        let errMessage = 'Sorry, an error occurred.';
        try { const d = await r.json(); errMessage = d.message; } catch (e) { }
        setChatMessages([...nm, { role: 'ai', text: errMessage }]);
        fetchCredits(); setAiLoading(false); return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (isFirstChunk) { setAiLoading(false); isFirstChunk = false; }
        aiText += decoder.decode(value, { stream: true });
        setChatMessages([...nm, { role: 'ai', text: aiText }]);
      }
      fetchCredits();
    } catch { setChatMessages([...nm, { role: 'ai', text: 'Could not reach AI server.' }]); setAiLoading(false); }
  };
  const saveChat = () => { if (!chatMessages.some(m => m.role === 'user')) return; const f = chatMessages.find(m => m.role === 'user'); const t = f ? f.text.slice(0, 30) : 'Untitled'; const cd = { id: activeChatId, title: t, messages: [...chatMessages], date: new Date().toISOString() }; setChatHistory(p => [cd, ...p.filter(c => c.id !== activeChatId)]); saveChatSession('easy', activeChatId, cd); };
  const newChat = () => { saveChat(); setChatMessages([{ role: 'ai', text: "Hey! I'm your Noodle Wellness Coach." }]); setActiveChatId(Date.now().toString()); };
  const loadChat = (ch) => { saveChat(); setChatMessages(ch.messages); setActiveChatId(ch.id); };
  const deleteChat = (id) => { setChatHistory(p => p.filter(c => c.id !== id)); deleteChatSession('easy', id); if (activeChatId === id) newChat(); };

  // ─── AI Coach fullscreen ───
  if (activeSection === 'coach') {
    return <NoodleChat tier="easy" messages={chatMessages} onSend={sendChat} isLoading={aiLoading} onClose={() => setActiveSection(null)} userName={profile?.name || 'Explorer'} userAvatar={profilePhoto} creditInfo={credits} chatHistory={chatHistory} onNewChat={newChat} onLoadChat={loadChat} onDeleteChat={deleteChat} activeChatId={activeChatId} />;
  }

  const maxWeekly = Math.max(...weeklyActivity, 1);
  const totalWeeklyMins = weeklyActivity.reduce((a, b) => a + b, 0);
  const calorieGoal = 500; const stepGoal = 10000; const waterGoal = 8;

  // ─── Quick-log workouts ───
  const QUICK_WORKOUTS = [
    { name: 'Morning Walk', cals: 80, mins: 15, steps: 1800, icon: <Activity className="w-4 h-4" />, color: 'emerald' },
    { name: 'Stretching', cals: 30, mins: 10, steps: 0, icon: <Dumbbell className="w-4 h-4" />, color: 'purple' },
    { name: 'Bodyweight', cals: 120, mins: 20, steps: 200, icon: <Flame className="w-4 h-4" />, color: 'blue' },
    { name: 'Yoga', cals: 60, mins: 25, steps: 0, icon: <Wind className="w-4 h-4" />, color: 'pink' },
    { name: 'Jogging', cals: 200, mins: 20, steps: 3000, icon: <Zap className="w-4 h-4" />, color: 'orange' },
    { name: 'Cycling', cals: 150, mins: 20, steps: 0, icon: <Clock className="w-4 h-4" />, color: 'cyan' },
  ];
  const MOODS = [
    { emoji: <Star className="w-5 h-5" />, label: 'Amazing' }, { emoji: <Smile className="w-5 h-5" />, label: 'Good' },
    { emoji: <Meh className="w-5 h-5" />, label: 'Okay' }, { emoji: <Frown className="w-5 h-5" />, label: 'Tired' }, { emoji: <CloudRain className="w-5 h-5" />, label: 'Tough' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 1rem;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.04), transparent 40%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .glass-card:hover::before { opacity: 1; }
        .glass-card:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .glass-card > * { position: relative; z-index: 1; }
      `}</style>
      <div ref={vantaRef} className="fixed inset-0 z-0" />
      <AvatarSelectModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} onSelect={handleAvatarSelect} currentAvatar={profilePhoto} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ═══ TOP BAR ═══ */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/[0.04] z-50">
          <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => activeSection ? setActiveSection(null) : navigate('/hub')} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" />{activeSection ? 'Back' : 'Hub'}
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <Brain className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white/90 text-sm">Noodle</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-bold uppercase tracking-[0.15em] mr-2">Wellness</span>
              <NoodleXButton variant="nav" />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-white/40 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{todayStr()}</span>
              </div>
              {profilePhoto ? (
                <div className="w-8 h-8 rounded-full border border-emerald-500/25 overflow-hidden cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                  <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                  <User className="w-4 h-4 text-white/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-6">
          <AnimatePresence mode="wait">
            {!activeSection && (
              <motion.div key="home" {...fadeIn}>
                {/* Greeting */}
                <div className="mb-6">
                  <h1 className="font-syne text-2xl md:text-3xl font-bold text-white">{getGreeting()}, <span className="text-emerald-400">{profile.name}</span></h1>
                  <p className="text-white/30 text-sm mt-1">Track your wellness, log activities, and stay on top of your goals.</p>
                </div>

                {/* ═══ DASHBOARD GRID — 2 columns like the reference ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4"
                  onMouseMove={(e) => {
                    const cards = e.currentTarget.querySelectorAll('.glass-card');
                    cards.forEach(card => {
                      const r = card.getBoundingClientRect();
                      card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
                      card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
                    });
                  }}>

                  {/* ─── LEFT COLUMN ─── */}
                  <div className="space-y-4">
                    {/* Weekly Activity Chart */}
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-white font-semibold text-base">Weekly Activity</h3>
                          <p className="text-white/30 text-xs mt-0.5">Active minutes per day</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs font-medium">{totalWeeklyMins} min total</span>
                          <div className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[10px] text-white/50 font-semibold">This Week</div>
                        </div>
                      </div>
                      {/* Bar chart */}
                      <div className="flex items-end gap-3 h-[160px] mb-3">
                        {weeklyActivity.map((mins, i) => {
                          const pct = maxWeekly > 0 ? (mins / maxWeekly) * 100 : 0;
                          const isToday = i === (new Date().getDay() + 6) % 7;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                              {mins > 0 && <span className="text-[10px] text-white/30 font-medium opacity-0 group-hover:opacity-100 transition">{mins}m</span>}
                              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(pct, mins > 0 ? 8 : 0)}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                                className={`w-full rounded-lg ${isToday ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/15' : mins > 0 ? 'bg-emerald-500/30 group-hover:bg-emerald-500/50' : 'bg-white/[0.04]'}`}
                                style={{ minHeight: mins === 0 ? 6 : undefined }} />
                              <span className={`text-[10px] font-medium ${isToday ? 'text-emerald-400' : 'text-white/25'}`}>{DAYS[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Log Workouts */}
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold text-base">Quick Log</h3>
                        <span className="text-white/20 text-xs">Tap to log an activity</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {QUICK_WORKOUTS.map((w, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                            onClick={() => logActivity(w.name, w.cals, w.mins, w.steps)}
                            className="flex flex-col items-center p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-emerald-500/20 transition-all group">
                            <span className="text-2xl mb-1.5">{w.icon}</span>
                            <span className="text-[10px] text-white/60 font-semibold group-hover:text-white/90 transition text-center leading-tight">{w.name}</span>
                            <span className="text-[9px] text-white/20 mt-0.5">{w.mins}m · {w.cals}cal</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="glass-card p-6">
                      <h3 className="text-white font-semibold text-base mb-4">Recent Activities</h3>
                      {activityLog.length === 0 ? (
                        <div className="text-center py-8 text-white/15 text-sm">No activities logged today. Tap "Quick Log" above to start!</div>
                      ) : (
                        <div className="space-y-2">
                          {activityLog.map((a, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                              <div className={`w-8 h-8 rounded-lg bg-${a.color}-500/10 text-${a.color}-400 flex items-center justify-center`}>{a.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white/80 text-sm font-medium truncate">{a.name}</div>
                                <div className="text-white/25 text-[10px]">{a.mins} min · {a.cals} cal burned</div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-white/30 text-[10px] font-medium">{a.time}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── RIGHT COLUMN ─── */}
                  <div className="space-y-4">
                    {/* Fitness Overview */}
                    <div className="glass-card p-5">
                      <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Today's Overview</h3>
                      <div className="space-y-3.5">
                        {[
                          { label: 'Steps', value: steps.toLocaleString(), target: stepGoal.toLocaleString(), pct: Math.min((steps / stepGoal) * 100, 100), icon: Target, iconBg: 'bg-emerald-500/10', iconTxt: 'text-emerald-400', barBg: 'bg-emerald-500' },
                          { label: 'Calories', value: `${calories}`, target: `${calorieGoal}`, pct: Math.min((calories / calorieGoal) * 100, 100), icon: Flame, iconBg: 'bg-orange-500/10', iconTxt: 'text-orange-400', barBg: 'bg-orange-500' },
                          { label: 'Active Mins', value: `${activeMins}`, target: '60', pct: Math.min((activeMins / 60) * 100, 100), icon: Zap, iconBg: 'bg-blue-500/10', iconTxt: 'text-blue-400', barBg: 'bg-blue-500' },
                        ].map((s, i) => (
                          <div key={i} className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center`}><s.icon className={`w-3.5 h-3.5 ${s.iconTxt}`} /></div>
                                <span className="text-white/60 text-xs font-medium">{s.label}</span>
                              </div>
                              <span className="text-white font-syne font-bold text-sm">{s.value} <span className="text-white/20 font-normal text-[10px]">/ {s.target}</span></span>
                            </div>
                            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                                className={`h-full ${s.barBg} rounded-full`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hydration */}
                    <div className="glass-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Hydration</h3>
                        <span className="text-cyan-400 text-xs font-semibold">{waterGlasses}/{waterGoal}</span>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {Array.from({ length: waterGoal }, (_, i) => (
                          <div key={i} className={`flex-1 h-6 rounded-md transition-all duration-300 ${i < waterGlasses ? 'bg-cyan-500/60' : 'bg-white/[0.04]'}`} />
                        ))}
                      </div>
                      <button onClick={() => setWaterGlasses(w => Math.min(w + 1, 12))}
                        className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/15 transition flex items-center justify-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Glass
                      </button>
                    </div>

                    {/* Sleep */}
                    <div className="glass-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Last Night's Sleep</h3>
                        <MoonIcon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="font-syne text-3xl font-extrabold text-white mb-1">{sleepHours}<span className="text-white/20 text-base font-normal ml-1">hrs</span></div>
                      <div className="flex gap-1.5 mt-3">
                        {[5, 6, 7, 8, 9].map(h => (
                          <button key={h} onClick={() => setSleepHours(h)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sleepHours === h ? 'bg-purple-500 text-white' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}>{h}h</button>
                        ))}
                      </div>
                    </div>

                    {/* Mood */}
                    <div className="glass-card p-5">
                      <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Mood Check-in</h3>
                      <div className="flex justify-between gap-2">
                        {MOODS.map(m => (
                          <motion.button key={m.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => { setActiveMood(m.label); setMoodLog(p => [{ ...m, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...p.slice(0, 4)]); }}
                            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all border ${activeMood === m.label ? 'bg-white/10 border-white/15' : 'bg-white/[0.01] border-transparent hover:bg-white/[0.04]'}`}>
                            <span className="text-xl flex items-center justify-center h-full text-white/80">{m.emoji}</span>
                            <span className="text-[8px] text-white/25 font-bold mt-0.5 uppercase">{m.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* AI Coach & Streak cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveSection('coach')}
                        className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/15 rounded-2xl text-left group">
                        <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-2"><Brain className="w-4 h-4 text-emerald-400" /></div>
                        <div className="text-white text-xs font-bold">AI Coach</div>
                        <div className="text-emerald-400/50 text-[9px] mt-0.5">Chat now →</div>
                      </motion.button>
                      <div className="glass-card p-4">
                        <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mb-2"><Flame className="w-4 h-4 text-orange-400" /></div>
                        <div className="font-syne text-2xl font-extrabold text-orange-400">{streak}<span className="text-white/20 text-xs font-normal ml-0.5">d</span></div>
                        <div className="text-white/25 text-[9px] font-medium">Streak</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ SECTION DETAIL VIEWS — reuse for drilldowns ═══ */}
            {activeSection && activeSection !== 'coach' && (
              <motion.div key={activeSection} {...fadeIn} className="max-w-3xl mx-auto py-4">
                <div className="text-center text-white/20 text-sm py-20">Section "{activeSection}" coming soon — use the dashboard for now.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center pb-6 text-white/10 text-[10px]"><Brain className="w-3 h-3 inline-block -mt-1 mr-1 opacity-50" /> Noodle Wellness</div>
      </div>

      <ProfileBar />
    </div>
  );
}
