import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, ArrowLeft, Activity, Flame, Target,
  Dumbbell, Star, Smile, Meh, Frown, Wind, Heart,
  Droplets, User, TrendingUp, RefreshCw, Sparkles, ChevronRight,
  Moon as MoonIcon, CloudRain
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AvatarSelectModal from '../components/AvatarSelectModal';
import ProfileBar from '../components/ProfileBar';
import NoodleXButton from '../components/NoodleXButton';
import NoodleChat from '../components/NoodleChat';
import { loadChatHistory, saveChatSession, deleteChatSession } from '../utils/chatStorage';

const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
const todayStr = () => new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Custom tooltip for recharts
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#101418]/92 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-lg px-5 py-3 text-center">
      <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-base font-extrabold" style={{ color: p.color }}>
          {p.value}<span className="text-[10px] text-white/30 ml-1">{p.dataKey === 'cals' ? 'cal' : 'min'}</span>
        </p>
      ))}
    </div>
  );
};

// Sleep Arc Gauge — uses stroke-dashoffset for buttery smooth transitions
const SleepArc = ({ hours, goal = 9 }) => {
  const pct = Math.min((hours / goal) * 100, 100);
  const size = 160, viewH = 130;
  const cx = size / 2, cy = 85;
  const r = 60, strokeW = 10;
  // We draw a 270deg arc (3/4 circle) starting from bottom-left
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75; // 270 degrees
  const filledLength = (pct / 100) * arcLength;
  const dashOffset = arcLength - filledLength;

  return (
    <svg width={size} height={viewH} viewBox={`0 0 ${size} ${viewH}`} className="drop-shadow-lg">
      <defs>
        <linearGradient id="sleepGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="sleepGlow">
          <feGaussianBlur stdDeviation="4" result="glow" />
          <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW}
        strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`} />
      {/* Filled arc — animates via stroke-dashoffset */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#sleepGrad)" strokeWidth={strokeW}
        strokeDasharray={`${arcLength} ${circumference}`}
        strokeDashoffset={dashOffset} strokeLinecap="round" filter="url(#sleepGlow)"
        transform={`rotate(135 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      {/* Center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white text-[28px] font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>{hours}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="fill-white/25 text-[10px] font-bold" style={{ letterSpacing: '0.15em' }}>HOURS</text>
      {/* Small ticks around the arc for detail */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
        const angle = 135 + (i / 8) * 270;
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + (r + 14) * Math.cos(rad);
        const y1 = cy + (r + 14) * Math.sin(rad);
        return <circle key={i} cx={x1} cy={y1} r="1.5" fill={i <= (pct / 100) * 8 ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.08)'} />;
      })}
    </svg>
  );
};

// SVG Ring Progress
const ProgressRing = ({ progress, size = 62, stroke = 6, color = "#6366f1" }) => {
  const r = (size / 2) - stroke;
  const circ = r * 2 * Math.PI;
  const offset = circ - ((progress || 0) / 100) * circ;
  return (
    <svg height={size} width={size} className="transform -rotate-90 drop-shadow-sm">
      <circle stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="transparent" r={r} cx={size/2} cy={size/2} />
      <circle stroke={color} strokeWidth={stroke} strokeDasharray={`${circ} ${circ}`} style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        strokeLinecap="round" fill="transparent" r={r} cx={size/2} cy={size/2} />
    </svg>
  );
};

export default function EasyDashboard() {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profile, setProfile] = useState({ name: 'Explorer' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeMins, setActiveMins] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [streak, setStreak] = useState(0);
  const [moodLog, setMoodLog] = useState([]);
  const [activeMood, setActiveMood] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  const [activeSection, setActiveSection] = useState(null);
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: "Hey! I'm your Noodle Wellness Coach. Ask me anything about workouts, nutrition, or wellness." }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [credits, setCredits] = useState({ used: 0, limit: 10, isPremium: false });
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(() => Date.now().toString());
  const [wellnessLoaded, setWellnessLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const s = localStorage.getItem('user');
        if (s) {
          const u = JSON.parse(s);
          if (u.avatar) setProfilePhoto(u.avatar);
          setProfile({ name: u.name || 'Explorer', ...u });
        }
      } catch {
        // Ignore malformed cached profile data and keep defaults.
      }
      const ch = await loadChatHistory('easy'); setChatHistory(ch);
      try {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/user/wellness`, { credentials: 'include' });
        if (r.ok) { const d = await r.json(); const today = new Date().toDateString();
          if (d.date === today) { const moods = d.moodLog||[]; setSteps(d.steps||0); setCalories(d.calories||0); setActiveMins(d.activeMins||0); setWaterGlasses(d.water||0); setSleepHours(d.sleep||0); setStreak(d.streak||0); setWeeklyActivity(d.weekly||[0,0,0,0,0,0,0]); setMoodLog(moods); setActiveMood(moods[0]?.label || null); setActivityLog(d.activityLog||[]); }
        }
      } catch {
        // Wellness sync is best effort while the API is unavailable.
      } finally {
        setWellnessLoaded(true);
      }
    };
    load(); window.addEventListener('storage', load); window.addEventListener('noodle_profile_update', load);
    return () => { window.removeEventListener('storage', load); window.removeEventListener('noodle_profile_update', load); };
  }, []);

  useEffect(() => {
    if (!wellnessLoaded) return undefined;
    const timeout = setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_URL}/api/user/wellness`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ date: new Date().toDateString(), steps, calories, activeMins, water: waterGlasses, sleep: sleepHours, streak, weekly: weeklyActivity, moodLog, activityLog })
      }).catch(() => {
        // Save will retry on the next change.
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [wellnessLoaded, steps, calories, activeMins, waterGlasses, sleepHours, streak, weeklyActivity, moodLog, activityLog]);

  const handleAvatarSelect = (url) => { setProfilePhoto(url); const s = localStorage.getItem('user'); let u = {}; if (s) try { u = JSON.parse(s); } catch { /* Ignore malformed cached profile data. */ } u.avatar = url; localStorage.setItem('user', JSON.stringify(u)); window.dispatchEvent(new Event('noodle_profile_update')); };

  const logActivity = (name, cals, mins, stepsAdd) => {
    setCalories(p => p + cals); setActiveMins(p => p + mins); setSteps(p => p + stepsAdd);
    const dayIdx = new Date().getDay();
    setWeeklyActivity(w => { const n = [...w]; n[dayIdx] = (n[dayIdx] || 0) + mins; return n; });
    setActivityLog(p => [{ name, cals, mins, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...p.slice(0, 9)]);
  };

  const fetchCredits = async () => { try { const r = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/credits?tier=easy`, { credentials: 'include' }); if (r.ok) setCredits(await r.json()); } catch { /* Credits are optional for rendering the dashboard shell. */ } };
  useEffect(() => { fetchCredits(); }, []);

  const sendChat = async (msg) => {
    if (!msg?.trim() || aiLoading) return;
    const nm = [...chatMessages, { role: 'user', text: msg }]; setChatMessages(nm); setAiLoading(true);
    abortControllerRef.current = new AbortController();
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ message: msg, tier: 'easy' }), signal: abortControllerRef.current.signal });
      if (r.status === 403) { setChatMessages([...nm, { role: 'ai', text: 'Daily limit reached.' }]); fetchCredits(); setAiLoading(false); return; }
      if (!r.ok) { let eMsg = 'Error occurred.'; try { const d = await r.json(); eMsg = d.message; } catch { /* Use fallback message when the API returns a non-JSON error. */ } setChatMessages([...nm, { role: 'ai', text: eMsg }]); setAiLoading(false); return; }
      const reader = r.body.getReader(); const decoder = new TextDecoder(); let aiText = ''; let thinking = ''; let buffer = ''; let isFirstChunk = true;
      try { while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const parts = buffer.split('\n'); buffer = parts.pop();
        for (const line of parts) { if (!line.trim()) continue; try { const parsed = JSON.parse(line);
          if (parsed.type === 'thinking') { thinking += parsed.text; setThinkingText(thinking); }
          else if (parsed.type === 'answer') { if (thinking) { setThinkingText(''); thinking = ''; } if (isFirstChunk) { setAiLoading(false); isFirstChunk = false; } aiText += parsed.text; setChatMessages([...nm, { role: 'ai', text: aiText }]); }
        } catch { /* Ignore malformed stream fragments and keep reading. */ } } } } catch (streamErr) { if (streamErr.name !== 'AbortError') throw streamErr; }
      setThinkingText(''); if (isFirstChunk) setAiLoading(false);
      const cd = { id: activeChatId, title: nm.find(m=>m.role==='user')?.text.slice(0,30)||'Chat', messages: [...nm, { role: 'ai', text: aiText }], date: new Date().toISOString() };
      setChatHistory(p => [cd, ...p.filter(c => c.id !== activeChatId)]); saveChatSession('easy', activeChatId, cd); fetchCredits();
    } catch (err) {
      if (err.name === 'AbortError') { const cd = { id: activeChatId, title: nm.find(m=>m.role==='user')?.text.slice(0,30)||'Chat', messages: nm, date: new Date().toISOString() }; setChatHistory(p => [cd, ...p.filter(c => c.id !== activeChatId)]); setAiLoading(false); setThinkingText(''); fetchCredits(); }
      else { setChatMessages([...nm, { role: 'ai', text: 'Network error.' }]); setAiLoading(false); setThinkingText(''); }
    }
  };
  const saveChat=()=>{ if(!chatMessages.some(m=>m.role==='user'))return; const t=chatMessages.find(m=>m.role==='user')?.text.slice(0,30)||'Untitled'; const cd={id:activeChatId,title:t,messages:[...chatMessages],date:new Date().toISOString()}; setChatHistory(p=>[cd,...p.filter(c=>c.id!==activeChatId)]); saveChatSession('easy',activeChatId,cd); };
  const newChat=(shouldSave=true)=>{ if(shouldSave) saveChat(); setChatMessages([{role:'ai',text:"Hey! I'm your Noodle Wellness Coach."}]); setActiveChatId(Date.now().toString()); };
  const loadChat=(ch)=>{ saveChat(); setChatMessages(ch.messages); setActiveChatId(ch.id); };
  const deleteChat=(id)=>{ setChatHistory(p=>p.filter(c=>c.id!==id)); deleteChatSession('easy',id); if(activeChatId===id) newChat(false); };
  const stopChat=()=>{ if(abortControllerRef.current) abortControllerRef.current.abort(); };

  if (activeSection === 'coach') return <NoodleChat tier="easy" messages={chatMessages} onSend={sendChat} onStop={stopChat} isLoading={aiLoading} thinkingText={thinkingText} onClose={() => setActiveSection(null)} userName={profile?.name || 'Explorer'} userAvatar={profilePhoto} creditInfo={credits} chatHistory={chatHistory} onNewChat={newChat} onLoadChat={loadChat} onDeleteChat={deleteChat} activeChatId={activeChatId} />;

  const stepGoal = 10000; const calorieGoal = 500; const minsGoal = 60; const waterGoal = 8;
  const chartData = weeklyActivity.map((val, i) => ({ day: DAYS[i], mins: val, cals: Math.round(val * 4.5) }));
  const totalWeeklyMins = weeklyActivity.reduce((a, b) => a + b, 0);
  const avgDaily = weeklyActivity.length ? Math.round(totalWeeklyMins / 7) : 0;

  const QUICK_WORKOUTS = [
    { name: 'Yoga', cals: 60, mins: 20, steps: 0, icon: <Wind className="w-5 h-5" />, gradient: 'from-teal-400 to-emerald-400' },
    { name: 'Weights', cals: 150, mins: 30, steps: 0, icon: <Dumbbell className="w-5 h-5" />, gradient: 'from-orange-400 to-amber-400' },
    { name: 'Run', cals: 200, mins: 20, steps: 3000, icon: <Activity className="w-5 h-5" />, gradient: 'from-blue-400 to-indigo-400' },
    { name: 'Cycling', cals: 150, mins: 20, steps: 0, icon: <RefreshCw className="w-5 h-5" />, gradient: 'from-purple-400 to-fuchsia-400' },
    { name: 'Stretch', cals: 30, mins: 10, steps: 0, icon: <Heart className="w-5 h-5" />, gradient: 'from-pink-400 to-rose-400' },
    { name: 'Walk', cals: 80, mins: 15, steps: 1800, icon: <Target className="w-5 h-5" />, gradient: 'from-cyan-400 to-sky-400' },
  ];
  const MOODS = [
    { emoji: <Star className="w-6 h-6" />, label: 'Amazing', color: '#10b981', bg: 'bg-emerald-500/15' },
    { emoji: <Smile className="w-6 h-6" />, label: 'Good', color: '#f59e0b', bg: 'bg-amber-500/15' },
    { emoji: <Meh className="w-6 h-6" />, label: 'Okay', color: '#6366f1', bg: 'bg-indigo-500/15' },
    { emoji: <Frown className="w-6 h-6" />, label: 'Tired', color: '#f97316', bg: 'bg-orange-500/15' },
    { emoji: <CloudRain className="w-6 h-6" />, label: 'Tough', color: '#64748b', bg: 'bg-white/10' },
  ];

  return (
    <div className="min-h-screen bg-[#101418] text-white overflow-x-hidden font-['DM_Sans',sans-serif] relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }

        .g-card {
          background: rgba(18,24,29,0.78);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 0.5rem;
          box-shadow: 0 10px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05);
          transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s ease;
        }
        .g-card:hover {
          transform: translateY(-2px);
          background: rgba(22,30,36,0.88);
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 18px 44px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .g-inner {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.065);
          border-radius: 0.5rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }

        @keyframes waveSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wave-container svg { animation: waveSlide 35s linear infinite; }

        @keyframes coachPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(16,185,129,0); }
        }
        .coach-pulse { animation: coachPulse 2.5s ease-in-out infinite; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .coach-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      {/* ═══ WAVE BACKGROUND (z-0, never overlaps cards) ═══ */}
      {/* ═══ WHITE WAVE on GREY BG (z-0, never overlaps cards at z-10) ═══ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="wave-container absolute bottom-0 left-0 w-[200vw] h-[70vh]">
          <svg viewBox="0 0 2400 400" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,200 C200,80 400,320 600,200 C800,80 1000,320 1200,200 C1400,80 1600,320 1800,200 C2000,80 2200,320 2400,200 L2400,400 L0,400 Z" fill="white" opacity="0.04" />
            <path d="M0,260 C300,140 500,360 800,260 C1100,160 1300,380 1600,260 C1900,140 2100,360 2400,260 L2400,400 L0,400 Z" fill="white" opacity="0.03" />
            <path d="M0,310 C250,220 450,390 700,310 C950,230 1150,400 1400,310 C1650,220 1850,400 2100,310 L2400,400 L0,400 Z" fill="white" opacity="0.02" />
          </svg>
        </div>
      </div>

      <AvatarSelectModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} onSelect={handleAvatarSelect} currentAvatar={profilePhoto} />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ═══ NAVBAR ═══ */}
        <div className="sticky top-0 z-50 bg-[#101418]/86 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm font-semibold text-white/50">
              <button onClick={() => navigate('/hub')} className="flex items-center gap-1.5 hover:text-white transition"><ArrowLeft className="w-4 h-4" /> Hub</button>
              <span className="text-white/15">|</span>
              <Brain className="w-4 h-4 text-emerald-400" /><span className="text-white/90 font-bold">Noodle</span>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded font-bold uppercase tracking-widest border border-emerald-500/20">Wellness</span>
              <NoodleXButton variant="nav" />
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-xs text-white/40 font-medium">{todayStr()}</span>
              {profilePhoto ? (
                <img src={profilePhoto} alt="" onClick={() => setShowAvatarModal(true)} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md cursor-pointer object-cover" />
              ) : (
                <div onClick={() => setShowAvatarModal(true)} className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/15 shadow-sm flex items-center justify-center cursor-pointer"><User className="w-4 h-4 text-white/40" /></div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN GRID ═══ */}
        <div className="flex-1 w-full max-w-[1500px] mx-auto px-4 md:px-8 py-8 flex flex-col xl:flex-row gap-6">

          {/* ════ LEFT ════ */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Greeting */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="g-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="min-w-0">
                <h1 className="font-syne text-3xl md:text-4xl font-extrabold text-white tracking-tight">{getGreeting()}, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{profile.name}</span></h1>
                <p className="text-white/40 text-sm mt-1.5 font-medium">Reflect on your day, track your stats, and grow.</p>
                <div className="mt-5 grid grid-cols-3 gap-2 max-w-xl">
                  {[
                    { label: 'Steps', value: `${Math.round(Math.min((steps / stepGoal) * 100, 100))}%`, color: 'text-indigo-300' },
                    { label: 'Active', value: `${activeMins}m`, color: 'text-emerald-300' },
                    { label: 'Water', value: `${waterGlasses}/${waterGoal}`, color: 'text-cyan-300' },
                  ].map((item) => (
                    <div key={item.label} className="g-inner px-3 py-2">
                      <p className={`text-sm font-extrabold ${item.color}`}>{item.value}</p>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-5 text-right self-stretch lg:self-auto justify-between lg:justify-end">
                <div className="hidden sm:block">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">{todayStr()}</p>
                  <p className="text-3xl font-extrabold font-mono text-white/90 tracking-tighter">{currentTime}</p>
                </div>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="" className="w-16 h-16 rounded-lg border-4 border-white/15 shadow-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/5 border-4 border-white/15 shadow-lg flex items-center justify-center"><User className="w-7 h-7 text-white/25" /></div>
                )}
              </div>
            </motion.div>

            {/* Chart + Vibe/Sleep Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Journey Dash — Enhanced Dual-Line Recharts */}
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="g-card p-6 lg:col-span-3 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h3 className="text-base font-bold text-white">Journey Dash</h3>
                    <p className="text-[11px] text-white/30 mt-0.5">Weekly performance · Minutes & Calories</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[9px] text-white/30 font-bold"><span className="w-2 h-2 rounded-full bg-violet-500" /> Mins</span>
                    <span className="flex items-center gap-1 text-[9px] text-white/30 font-bold"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Cals</span>
                    <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-lg font-bold uppercase border border-emerald-500/20"><TrendingUp className="w-3 h-3" /> {avgDaily} avg</span>
                  </div>
                </div>
                {/* Stats bar */}
                <div className="flex gap-4 mb-3 mt-2">
                  <div className="g-inner px-3 py-2 flex-1 text-center"><p className="text-lg font-extrabold text-white">{totalWeeklyMins}</p><p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">Total Mins</p></div>
                  <div className="g-inner px-3 py-2 flex-1 text-center"><p className="text-lg font-extrabold text-orange-400">{Math.round(totalWeeklyMins * 4.5)}</p><p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">Calories</p></div>
                  <div className="g-inner px-3 py-2 flex-1 text-center"><p className="text-lg font-extrabold text-emerald-400">{weeklyActivity.filter(v => v > 0).length}/7</p><p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">Active Days</p></div>
                </div>
                <div className="flex-1 w-full min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="strokeMins" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <filter id="chartGlow"><feGaussianBlur stdDeviation="4" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)' }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="cals" stroke="#22d3ee" strokeWidth={2} fill="url(#colorCals)" dot={false} activeDot={{ r: 5, fill: '#22d3ee', stroke: '#1e1e22', strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="mins" stroke="url(#strokeMins)" strokeWidth={3} fill="url(#colorMins)" filter="url(#chartGlow)" dot={{ r: 4, fill: '#1e1e22', stroke: '#a78bfa', strokeWidth: 2.5 }} activeDot={{ r: 7, fill: '#8b5cf6', stroke: '#1e1e22', strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Vibe + Sleep stack */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="g-card p-5 flex-1 flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Daily Vibe</h3>
                  <div className="flex justify-between items-center px-1">
                    {MOODS.map((m, i) => (
                      <button key={i} onClick={() => { setActiveMood(m.label); setMoodLog(p => [{ label: m.label, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...p.slice(0, 4)]); }}
                        className={`flex flex-col items-center gap-2 transition-all duration-200 ${activeMood === m.label ? 'scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}>
                        <div className={`w-12 h-12 rounded-full ${m.bg} flex items-center justify-center border-2 shadow-sm ${activeMood === m.label ? 'border-white/25 shadow-md' : 'border-white/10'}`}>
                          {React.cloneElement(m.emoji, { style: { color: m.color } })}
                        </div>
                        <span className="text-[9px] font-bold text-white/50 uppercase">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="g-card p-5 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <MoonIcon className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Sleep</h3>
                  </div>
                  <SleepArc hours={sleepHours} />
                  <div className="flex gap-2 mt-1 relative z-10">
                    {[5, 6, 7, 8, 9].map(h => (
                      <button key={h} onClick={() => setSleepHours(h)} className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${sleepHours === h ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110' : 'bg-white/[0.04] text-white/30 border border-white/[0.06] hover:bg-white/[0.08]'}`}>{h}h</button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Quick Log + Recent Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="g-card p-6 xl:col-span-2 flex flex-col">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Quick Log</h3>
                <div className="grid grid-cols-3 gap-3 flex-1">
                  {QUICK_WORKOUTS.map((w, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => logActivity(w.name, w.cals, w.mins, w.steps)}
                      className="g-inner flex flex-col items-center justify-center gap-2 p-3 hover:shadow-md transition-all group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${w.gradient} flex items-center justify-center text-white shadow-sm`}>{w.icon}</div>
                      <span className="text-[10px] font-bold text-white/50 group-hover:text-white transition">{w.name}</span>
                      <span className="text-[9px] text-white/25 font-semibold">{w.mins}m · {w.cals}cal</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="g-card p-6 xl:col-span-3 flex flex-col">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Recent Feed</h3>
                <div className="flex-1 overflow-y-auto max-h-[240px] space-y-2.5 pr-1">
                  {activityLog.length === 0 && <div className="text-white/25 text-sm font-medium py-12 text-center">Nothing logged yet. Try the Quick Log!</div>}
                  {activityLog.map((log, i) => (
                    <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}} className="g-inner p-3.5 flex items-center gap-4 hover:shadow-md transition">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/12 flex items-center justify-center border border-emerald-400/15 shadow-sm">
                        <Activity className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-white/90">{log.name}: {log.mins} mins</span>
                        <p className="text-[10px] text-white/40 font-semibold mt-0.5">Today, {log.time} · {log.cals} cal burned</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/20 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ═══ AI COACH — HERO BUTTON ═══ */}
            <motion.button initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              onClick={() => setActiveSection('coach')}
              className="g-card p-1 overflow-hidden group relative">
              <div className="relative rounded-lg overflow-hidden coach-shimmer bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 p-6 flex items-center justify-between">
                <div className="relative z-10 flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/30 shadow-lg coach-pulse">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-syne font-extrabold text-xl flex items-center gap-2">
                      Noodle AI Coach
                      <Sparkles className="w-5 h-5 text-yellow-200 opacity-80" />
                    </h3>
                    <p className="text-white/70 text-sm font-medium mt-0.5">Your personal wellness assistant is ready to chat</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider hidden sm:block">Open Coach</span>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/30 transition">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          {/* ════ RIGHT SIDEBAR ════ */}
          <div className="w-full xl:w-[320px] flex flex-col gap-6">

            {/* Overview */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="g-card p-6">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Today's Overview</h3>
              <div className="space-y-4">
                {[
                  { label: 'Steps', sub: `${steps.toLocaleString()} / ${stepGoal.toLocaleString()}`, pct: Math.min((steps/stepGoal)*100, 100), color: '#6366f1' },
                  { label: 'Calories', sub: `${calories} / ${calorieGoal} cal`, pct: Math.min((calories/calorieGoal)*100, 100), color: '#f97316' },
                  { label: 'Active Mins', sub: `${activeMins} / ${minsGoal} min`, pct: Math.min((activeMins/minsGoal)*100, 100), color: '#10b981' },
                ].map((s, i) => (
                  <div key={i} className="g-inner p-3.5 flex items-center gap-4">
                    <ProgressRing progress={s.pct} color={s.color} />
                    <div>
                      <span className="text-sm font-bold text-white/90">{s.label}</span>
                      <p className="text-[11px] text-white/40 font-semibold mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hydration — Enhanced */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="g-card p-6 relative overflow-hidden">
              {/* Ambient glow */}
              <div className="flex justify-between items-center mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20"><Droplets className="w-4 h-4 text-cyan-400" /></div>
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Hydration</h3>
                </div>
                <span className="text-lg font-extrabold text-cyan-400">{waterGlasses}<span className="text-white/20 text-sm font-normal">/{waterGoal}</span></span>
              </div>
              {/* Water drops visual */}
              <div className="flex justify-between items-end mb-5 px-2 relative z-10">
                {Array.from({ length: waterGoal }, (_, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.15, y: -4 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)}
                    className="flex flex-col items-center gap-1.5 group">
                    <div className={`relative w-8 h-10 rounded-b-full rounded-t-lg border-2 transition-all duration-500 ${
                      i < waterGlasses
                        ? 'border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                        : 'border-white/10'
                    }`}>
                      <div className={`absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-700 ${
                        i < waterGlasses ? 'bg-gradient-to-t from-cyan-400 to-cyan-300/60 h-full' : 'bg-transparent h-0'
                      }`} />
                      {i < waterGlasses && <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/40 rounded-full" />}
                    </div>
                  </motion.button>
                ))}
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden mb-4 relative z-10 border border-white/[0.04]">
                <motion.div initial={{width:0}} animate={{width:`${Math.min((waterGlasses/waterGoal)*100, 100)}%`}} transition={{duration:0.8}}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
              </div>
              <button onClick={() => setWaterGlasses(w => Math.min(w + 1, waterGoal))}
                className="w-full relative z-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <Droplets className="w-4 h-4" /> Log Glass
              </button>
            </motion.div>

            {/* Streak */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="g-card p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/15 mb-3">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <p className="font-syne text-4xl font-extrabold text-white">{streak}<span className="text-white/25 text-lg ml-0.5">d</span></p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Current Streak</p>
            </motion.div>
          </div>
        </div>
      </div>
      <ProfileBar />
    </div>
  );
}
