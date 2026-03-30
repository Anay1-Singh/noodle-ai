import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Brain, Zap, Dumbbell, Heart, Leaf, Droplets, Target, Star, Package,
  Send, Plus, Trash2, MessageSquare, ListChecks, ChevronDown, User, Camera, Edit3,
  Settings, LogOut, X, Sun, Moon as MoonIcon, Award, Calendar, ShieldCheck,
  AlertTriangle, Sparkles, RefreshCw, CheckCircle, Clock, Activity, Flame,
  TrendingUp, BookOpen, Pill, Search, Timer, Wind
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

import AvatarSelectModal from '../components/AvatarSelectModal';
import ProfileBar from '../components/ProfileBar';
import NoodleXButton from '../components/NoodleXButton';
import NoodleChat from '../components/NoodleChat';
import { loadChatHistory, saveChatSession, deleteChatSession } from '../utils/chatStorage';

// ═══════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════

const DEFAULT_PROFILE = { name: '', age: '', weight: '', height: '', goal: '', joinedDate: new Date().toISOString(), streak: 0 };

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Andrew Murphy" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
];

const AI_RESPONSES = [
  "For hypertrophy, aim 8-12 reps with 60-90s rest. Progressive overload is key — add weight or reps weekly.",
  "Post-workout nutrition window: 25-40g protein + fast carbs within 45 min. Whey + banana is a solid combo. 🍌",
  "Creatine monohydrate, 5g daily — the most researched supplement. No loading phase needed. Stay hydrated! 💧",
  "Split suggestion: Push/Pull/Legs for intermediates. Hit each muscle 2x/week for optimal growth.",
  "Sleep 7-9 hours. Growth hormone peaks during deep sleep — that's where the real gains happen. 😴",
  "Deload every 4-6 weeks. Drop volume 40-50% to let your CNS recover. You'll come back stronger. 📈",
  "Track your lifts! Progressive overload without tracking is just guessing. Use a logbook or app. 📝",
  "Mind-muscle connection is real. Slow eccentrics (3-4 seconds) boost hypertrophy significantly.",
];

const SPLITS = {
  beginner: {
    'monday': { name: 'Full Body A', exercises: ['Barbell Squat 3×10', 'Bench Press 3×10', 'Bent-Over Row 3×10', 'Overhead Press 3×8', 'Barbell Curl 2×12', 'Plank 3×30s'] },
    'tuesday': { name: 'Rest / Cardio', exercises: ['20-30 min light cardio', 'Stretching / Foam rolling', 'Core work optional'] },
    'wednesday': { name: 'Full Body B', exercises: ['Deadlift 3×8', 'Incline DB Press 3×10', 'Lat Pulldown 3×10', 'Leg Press 3×12', 'Tricep Pushdown 2×12', 'Hanging Leg Raise 3×10'] },
    'thursday': { name: 'Rest / Cardio', exercises: ['20-30 min walking', 'Mobility work', 'Light stretching'] },
    'friday': { name: 'Full Body C', exercises: ['Front Squat 3×10', 'DB Bench Press 3×10', 'Cable Row 3×10', 'DB Shoulder Press 3×10', 'Hammer Curl 2×12', 'Ab Rollout 3×8'] },
    'saturday': { name: 'Active Recovery', exercises: ['Light cardio', 'Full-body stretching', 'Yoga / swimming'] },
  },
  intermediate: {
    'monday': { name: 'Push Day', exercises: ['Bench Press 4×8', 'Incline DB Press 3×10', 'OHP 3×10', 'Cable Fly 3×12', 'Lateral Raise 4×15', 'Tricep Dips 3×12', 'Overhead Extension 3×12'] },
    'tuesday': { name: 'Pull Day', exercises: ['Deadlift 4×6', 'Pull-Ups 4×8', 'Barbell Row 3×10', 'Face Pulls 3×15', 'Barbell Curl 3×10', 'Hammer Curl 3×12', 'Reverse Fly 3×12'] },
    'wednesday': { name: 'Legs', exercises: ['Squat 4×8', 'Romanian DL 3×10', 'Leg Press 3×12', 'Leg Curl 3×12', 'Leg Extension 3×12', 'Calf Raise 4×15', 'Walking Lunge 3×12/leg'] },
    'thursday': { name: 'Push Day 2', exercises: ['OHP 4×8', 'Incline Bench 3×10', 'DB Fly 3×12', 'Arnold Press 3×10', 'Cable Lateral 4×15', 'Close-Grip Bench 3×10', 'Skull Crusher 3×12'] },
    'friday': { name: 'Pull Day 2', exercises: ['Weighted Pull-Up 4×6', 'T-Bar Row 3×10', 'Cable Row 3×12', 'Rear Delt Fly 3×15', 'Preacher Curl 3×10', 'Incline Curl 3×12', 'Shrugs 3×15'] },
    'saturday': { name: 'Legs 2', exercises: ['Front Squat 4×8', 'Sumo DL 3×8', 'Bulgarian Split Squat 3×10/leg', 'Hack Squat 3×12', 'Seated Calf 4×15', 'Hip Thrust 3×12', 'Ab Circuit'] },
  },
};

const MUSCLES = {
  chest: ['Bench Press', 'Incline DB Press', 'Cable Fly', 'Push-Ups', 'Dips', 'Pec Deck', 'Landmine Press'],
  back: ['Deadlift', 'Pull-Ups', 'Barbell Row', 'Lat Pulldown', 'T-Bar Row', 'Cable Row', 'Face Pull'],
  shoulders: ['OHP', 'Lateral Raise', 'Arnold Press', 'Face Pull', 'Rear Delt Fly', 'Upright Row', 'Cable Lateral'],
  legs: ['Squat', 'Leg Press', 'Romanian DL', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Bulgarian Split Squat'],
  arms: ['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crusher', 'Preacher Curl', 'Dips', 'Cable Curl'],
  core: ['Plank', 'Hanging Leg Raise', 'Ab Rollout', 'Cable Crunch', 'Russian Twist', 'Deadbug', 'Pallof Press'],
};

const SUPPLEMENTS = [
  { name: 'Creatine', dose: '5g daily', timing: 'Anytime', benefit: 'Strength & power', rating: 5 },
  { name: 'Whey Protein', dose: '25-40g', timing: 'Post-workout', benefit: 'Recovery & growth', rating: 5 },
  { name: 'Beta-Alanine', dose: '3-6g daily', timing: 'Pre-workout', benefit: 'Endurance', rating: 4 },
  { name: 'Caffeine', dose: '200-400mg', timing: '30m pre-workout', benefit: 'Focus & power', rating: 4 },
  { name: 'Fish Oil', dose: '2-3g EPA/DHA', timing: 'With meals', benefit: 'Joint health', rating: 4 },
  { name: 'Vitamin D3', dose: '2000-5000 IU', timing: 'Morning', benefit: 'Hormone support', rating: 4 },
  { name: 'Magnesium', dose: '400mg', timing: 'Before bed', benefit: 'Sleep & recovery', rating: 3 },
  { name: 'Citrulline', dose: '6-8g', timing: 'Pre-workout', benefit: 'Blood flow', rating: 3 },
];

const GYM_DIET = {
  bulk: { cal: '500+ surplus', protein: '1.6-2.2g/kg', meals: ['Oats + whey + banana', 'Chicken rice broccoli', 'Steak sweet potato salad', 'Shake: milk whey PB oats', 'Greek yogurt granola honey'] },
  cut: { cal: '300-500 deficit', protein: '2.0-2.4g/kg', meals: ['Egg whites + avocado toast', 'Tuna salad + rice cakes', 'Grilled chicken + veggies', 'Protein shake + almonds', 'Fish + steamed vegetables'] },
  maintain: { cal: 'At maintenance', protein: '1.6-2.0g/kg', meals: ['Scrambled eggs + oats', 'Turkey wrap + fruit', 'Salmon + quinoa + greens', 'Cottage cheese + berries', 'Lean beef + roasted veggies'] },
};

const DEFICIENCY_MAP = {
  tired: 'Iron/B12 — eat red meat, spinach, lentils. Consider a blood panel.',
  cramps: 'Magnesium/Potassium — bananas, dark chocolate, nuts, avocado.',
  'weak joints': 'Collagen/Vitamin C — bone broth, citrus fruits, berries.',
  'slow recovery': 'Zinc/Omega-3 — oysters, pumpkin seeds, fatty fish, walnuts.',
  'brain fog': 'Omega-3/B vitamins — fatty fish, eggs, leafy greens.',
  'hair loss': 'Biotin/Iron/Zinc — eggs, nuts, seeds, lean meats.',
  insomnia: 'Magnesium/Melatonin — chamomile tea, tart cherry, magnesium glycinate.',
};

const BUSY_WORKOUTS = {
  '15min': [
    { name: '15-Min Full Body Blast', exercises: ['Goblet Squat 3×12', 'Push-Ups 3×15', 'DB Row 3×10/side', 'Plank 2×45s'] },
    { name: '15-Min Upper Pump', exercises: ['DB Press 3×12', 'Band Pull-Apart 3×15', 'Lateral Raise 3×15', 'Curl + Tricep 2×12'] },
  ],
  '30min': [
    { name: '30-Min Push', exercises: ['Bench Press 4×8', 'Incline DB 3×10', 'Cable Fly 3×12', 'Lateral Raise 3×15', 'Tricep Pushdown 3×12'] },
    { name: '30-Min Pull', exercises: ['Pull-Ups 4×8', 'Cable Row 3×10', 'Face Pull 3×15', 'Barbell Curl 3×10', 'Hammer Curl 2×12'] },
    { name: '30-Min Legs', exercises: ['Squat 4×8', 'Leg Press 3×12', 'RDL 3×10', 'Leg Curl 3×12', 'Calf Raise 3×15'] },
  ],
};

const WISHLIST_PLANS = {
  'get abs': { diet: 'Caloric deficit 300-500cal. High protein 2g/kg. Cut refined carbs.', workout: 'Train abs 3x/week. Cardio 4x/week. Full-body resistance training.', timeline: '8-16 weeks depending on body fat %' },
  'build muscle': { diet: 'Caloric surplus 300-500cal. Protein 1.8-2.2g/kg. Carb-heavy post workout.', workout: 'PPL split 6x/week. Progressive overload. Focus compound lifts.', timeline: '3-6 months for noticeable gains' },
  'lose fat': { diet: 'Deficit 400-600cal. Protein 2.2g/kg to preserve muscle. High fiber.', workout: 'Lift 4x/week. 20min HIIT 3x/week. 8000+ daily steps.', timeline: '8-12 weeks for visible changes' },
  'get stronger': { diet: 'Slight surplus. Protein 2g/kg. Creatine 5g daily.', workout: '5×5 or 531 program. Heavy compounds. Deload every 4 weeks.', timeline: '4-8 weeks for strength PRs' },
};

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const cardFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: 'easeOut' } };

// Card defined OUTSIDE so React keeps a stable reference (prevents remounting)
const GlassCard = ({ children, className = '', onClick }) => (
  <div className={`glass-card-m p-5 ${className}`} onClick={onClick}>{children}</div>
);

export default function MediumDashboard() {
  const navigate = useNavigate();
  const mouseRef = useRef({ x: 0, y: 0 });
  const dropdownRef = useRef(null);
  const chatEndRef = useRef(null);

  const [darkMode, setDarkMode] = useState(() => { const s = localStorage.getItem('noodle_dark_mode'); return s === null ? true : s === 'true'; });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editProfile, setEditProfile] = useState(DEFAULT_PROFILE);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: "Welcome. I'm your Noodle Performance Coach — ask me anything about training, nutrition, or recovery." }]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [credits, setCredits] = useState({ used: 0, limit: 15, isPremium: false });
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(Date.now().toString());
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const [chatFullscreen, setChatFullscreen] = useState(false);

  const [splitLevel, setSplitLevel] = useState('');
  const [activeDay, setActiveDay] = useState('monday');
  const [activeMuscle, setActiveMuscle] = useState('');
  const [dietGoal, setDietGoal] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [deficiencyResult, setDeficiencyResult] = useState(null);
  const [busyMode, setBusyMode] = useState(false);
  const [busyDuration, setBusyDuration] = useState('');
  const [oneRmWeight, setOneRmWeight] = useState('');
  const [oneRmReps, setOneRmReps] = useState('');
  const [oneRmResult, setOneRmResult] = useState(null);
  const [restTimer, setRestTimer] = useState(null);
  const [restSeconds, setRestSeconds] = useState(90);
  const [wishlistGoal, setWishlistGoal] = useState('');
  const [wishlistPlan, setWishlistPlan] = useState(null);
  const [bmi, setBmi] = useState(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const str = localStorage.getItem('user');
        if (str) {
          const ud = JSON.parse(str);
          if (ud.avatar) setProfilePhoto(ud.avatar);
          setProfile({ name: ud.name || 'Athlete', level: ud.level || 'Gym Enthusiast', ...ud });
          setEditProfile({ name: ud.name || 'Athlete', level: ud.level || 'Gym Enthusiast', ...ud });
        }
      } catch (err) {}
      
      const ch = await loadChatHistory('medium');
      setChatHistory(ch);
    };
    loadProfile();
    window.addEventListener('storage', loadProfile);
    window.addEventListener('noodle_profile_update', loadProfile);
    
    const hco = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowProfileDropdown(false); };
    document.addEventListener('mousedown', hco);
    const hm = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; setMousePos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener('mousemove', hm);
    return () => { 
      document.removeEventListener('mousedown', hco); 
      window.removeEventListener('mousemove', hm); 
      window.removeEventListener('storage', loadProfile);
      window.removeEventListener('noodle_profile_update', loadProfile);
    };
  }, []);

  useEffect(() => {
    const qi = setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 7000);
    return () => clearInterval(qi);
  }, []);

  useEffect(() => { localStorage.setItem('noodle_dark_mode', darkMode.toString()); }, [darkMode]);




  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    const id = setTimeout(() => setRestTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [restTimer]);

  // Functions
  const fetchCredits = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ai/credits?tier=medium', { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setCredits(data); }
    } catch { }
  };
  useEffect(() => { fetchCredits(); }, []);
  const limitReached = !credits.isPremium && credits.used >= credits.limit;

  const sendChat = async (userMsg) => {
    if (!userMsg?.trim() || aiLoading || limitReached) return;
    const newMsgs = [...chatMessages, { role: 'user', text: userMsg }];
    setChatMessages(newMsgs); setAiLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg, tier: 'medium' }),
      });
      if (res.status === 403) {
        setChatMessages([...newMsgs, { role: 'ai', text: 'Daily message limit reached. Come back tomorrow or upgrade to Premium!' }]);
        fetchCredits(); setAiLoading(false); return;
      }
      if (!res.ok) {
        let errMessage = 'Sorry, something went wrong.';
        try { const data = await res.json(); errMessage = data.message; } catch(e){}
        setChatMessages([...newMsgs, { role: 'ai', text: errMessage }]);
        fetchCredits(); setAiLoading(false); return;
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (isFirstChunk) { setAiLoading(false); isFirstChunk = false; }
        aiText += decoder.decode(value, { stream: true });
        setChatMessages([...newMsgs, { role: 'ai', text: aiText }]);
      }
      fetchCredits();
    } catch (err) {
      setChatMessages([...newMsgs, { role: 'ai', text: 'Could not reach the AI server. Please try again later.' }]);
      setAiLoading(false);
    }
  };
  const saveCurrentChat = () => {
    if (!chatMessages.some(m => m.role === 'user')) return;
    const first = chatMessages.find(m => m.role === 'user');
    const title = first ? first.text.slice(0, 30) + (first.text.length > 30 ? '...' : '') : 'Untitled';
    const id = activeChatId || Date.now().toString();
    const cd = { id, title, messages: [...chatMessages], date: new Date().toISOString() };
    setChatHistory(prev => [cd, ...prev.filter(c => c.id !== id)]);
    saveChatSession('medium', id, cd);
  };
  const startNewChat = () => { saveCurrentChat(); setChatMessages([{ role: 'ai', text: "Welcome. I'm your Noodle Performance Coach — ask me anything about training, nutrition, or recovery." }]); setActiveChatId(Date.now().toString()); };
  const loadChat = (ch) => { saveCurrentChat(); setChatMessages(ch.messages); setActiveChatId(ch.id); };
  const deleteChat = (id) => { setChatHistory(prev => prev.filter(c => c.id !== id)); deleteChatSession('medium', id); if (activeChatId === id) startNewChat(); };
  const checkDeficiency = () => { if (!symptoms) return; const f = Object.entries(DEFICIENCY_MAP).filter(([k]) => symptoms.toLowerCase().includes(k)); setDeficiencyResult(f.length > 0 ? f : null); };
  const calc1RM = () => { const w = parseFloat(oneRmWeight), r = parseInt(oneRmReps); if (!w || !r || r < 1) return; setOneRmResult({ epley: Math.round(w * (1 + r / 30)), brzycki: Math.round(w * (36 / (37 - r))), weight: w, reps: r }); };
  const calcBMI = () => { if (profile.weight && profile.height) { const h = profile.height / 100; const v = (profile.weight / (h * h)).toFixed(1); setBmi({ value: v, category: v < 18.5 ? 'Underweight' : v < 25 ? 'Normal' : v < 30 ? 'Overweight' : 'Obese' }); } };
  const generateWishlistPlan = () => { if (!wishlistGoal.trim()) return; const k = Object.keys(WISHLIST_PLANS).find(k => wishlistGoal.toLowerCase().includes(k)); const plan = k ? WISHLIST_PLANS[k] : { diet: 'Balanced macros with adequate protein. Track calories.', workout: '4-5x/week resistance + 2x cardio. Progressive overload.', timeline: '8-12 weeks for results' }; const saved = { ...plan, goal: wishlistGoal, date: new Date().toISOString() }; setWishlistPlan(saved); };
  const saveProfile = (p) => { 
    setProfile(p); 
    setEditProfile(p); 
    const su = localStorage.getItem('user'); let ud = {}; if(su) try{ud=JSON.parse(su);}catch{}
    const newUd = { ...ud, ...p };
    localStorage.setItem('user', JSON.stringify(newUd)); 
    window.dispatchEvent(new Event('noodle_profile_update'));
  };
  const handleProfileSave = () => { saveProfile(editProfile); setShowProfileEditor(false); };
  const handleAvatarSelect = (url) => {
    setProfilePhoto(url);
    const sp = localStorage.getItem('user');
    let ud = {};
    if (sp) try { ud = JSON.parse(sp); } catch {}
    ud.avatar = url;
    localStorage.setItem('user', JSON.stringify(ud));
    window.dispatchEvent(new Event('noodle_profile_update'));
  };

  const daysSinceJoined = Math.max(1, Math.floor((Date.now() - new Date(profile.joinedDate || Date.now()).getTime()) / 86400000));

  // Premium Theme — Dark grey + accent
  const dm = true;
  const bg = 'bg-black';
  const tp = 'text-white';
  const ts = 'text-slate-400';
  const tm = 'text-slate-600';
  const gold = 'text-[#c9a96e]';
  const goldBg = 'bg-[#c9a96e]/8 border-[#c9a96e]/20';
  const cb = 'bg-slate-900/50 border-slate-700/30';
  const ib = 'bg-slate-900/80 border-slate-700/50 text-white placeholder-slate-600';
  const mb2 = 'bg-slate-900/95 border-slate-700/50';

  const sections = [
    { id: 'split', icon: <Dumbbell className="w-5 h-5" />, title: 'Workout Split', desc: 'PPL & Full Body', gradient: 'from-[#c9a96e] to-[#a8884d]' },
    { id: 'exercises', icon: <Search className="w-5 h-5" />, title: 'Exercise DB', desc: 'Browse by muscle', gradient: 'from-slate-500 to-slate-600' },
    { id: 'supplements', icon: <Pill className="w-5 h-5" />, title: 'Supplements', desc: 'Science-backed', gradient: 'from-[#8b7e6a] to-[#6d6355]' },
    { id: 'diet', icon: <Leaf className="w-5 h-5" />, title: 'Gym Diet', desc: 'Bulk / Cut / Maint', gradient: 'from-[#6b8f71] to-[#4a6e50]' },
    { id: 'deficiency', icon: <Heart className="w-5 h-5" />, title: 'Deficiency', desc: 'Symptom checker', gradient: 'from-[#9b7a7a] to-[#7d5c5c]' },
    { id: 'onerm', icon: <TrendingUp className="w-5 h-5" />, title: '1RM Calc', desc: 'Estimate max', gradient: 'from-[#8a7e5a] to-[#6e6444]' },
    { id: 'timer', icon: <Timer className="w-5 h-5" />, title: 'Rest Timer', desc: 'Between sets', gradient: 'from-[#5a7a8a] to-[#446470]' },
    { id: 'wishlist', icon: <Star className="w-5 h-5" />, title: 'Wishlist', desc: 'Goal planner', gradient: 'from-[#c9a96e] to-[#9e844f]' },
    { id: 'coach', icon: <Brain className="w-5 h-5" />, title: 'AI Coach', desc: 'Performance advisor', gradient: 'from-[#7a8a8a] to-[#5c6e6e]' },
  ];

  const days = Object.keys(SPLITS.beginner);
  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const timeStr = new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (activeSection === 'coach') {
    return (<NoodleChat tier="medium" messages={chatMessages} onSend={sendChat} isLoading={aiLoading} onClose={() => setActiveSection(null)}
      userName={profile?.name || 'Athlete'} userAvatar={profilePhoto} creditInfo={credits} chatHistory={chatHistory}
      onNewChat={startNewChat} onLoadChat={loadChat} onDeleteChat={deleteChat} activeChatId={activeChatId} />);
  }

  // Use GlassCard (defined outside component) to avoid remount flicker

  return (
    <div className={`min-h-screen ${bg} ${tp} overflow-x-hidden font-['DM_Sans',sans-serif]`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
        .glass-card-m { background: rgba(255,255,255,0.03); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.06); border-radius: 1rem; position: relative; overflow: hidden; transition: all 0.3s ease; }
        .glass-card-m:hover { border-color: rgba(201,169,110,0.15); background: rgba(255,255,255,0.05); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
      `}</style>
      <div className="fixed inset-0 z-0 bg-black" />
      <div className="fixed inset-0 pointer-events-none z-[1]"><div className="absolute inset-0 bg-black" /></div>

      <AvatarSelectModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSelect={handleAvatarSelect} currentAvatar={profilePhoto} />
      <AnimatePresence>
        {showProfileEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div {...fadeIn} className="bg-slate-900/95 border-slate-700/50 backdrop-blur-xl border rounded-2xl p-8 max-w-lg w-full relative shadow-2xl">
              <button onClick={() => setShowProfileEditor(false)} className="absolute top-4 right-4 text-slate-600"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-3 mb-6"><div className="w-9 h-9 bg-[#c9a96e] rounded-lg flex items-center justify-center"><Edit3 className="w-4 h-4 text-[#0a0f1c]" /></div><div><h3 className="text-lg font-bold text-white">Edit Profile</h3><p className="text-slate-600 text-xs">Update details</p></div></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group cursor-pointer" onClick={() => { setShowProfileEditor(false); setShowUploadModal(true); }}>
                  {profilePhoto ? <div className="w-14 h-14 rounded-full border border-[#c9a96e]/30 overflow-hidden"><img src={profilePhoto} alt="" className="w-full h-full object-cover" /></div> : <div className="w-14 h-14 rounded-full border border-dashed border-slate-600 bg-slate-800/50 flex items-center justify-center"><User className="w-5 h-5 text-slate-400" /></div>}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Camera className="w-4 h-4 text-white" /></div>
                </div>
                <div><div className="font-semibold text-sm text-white">{profilePhoto ? 'Change' : 'Select'} Avatar</div></div>
              </div>
              <div className="space-y-3">
                {[{ l: 'Name', k: 'name', p: 'Alex', t: 'text' }, { l: 'Age', k: 'age', p: '24', t: 'number' }, { l: 'Weight (kg)', k: 'weight', p: '72', t: 'number' }, { l: 'Height (cm)', k: 'height', p: '175', t: 'number' }, { l: 'Goal', k: 'goal', p: 'Build muscle...', t: 'text' }].map(f => (
                  <div key={f.k}><label className={`block ${gold} font-semibold text-[10px] uppercase tracking-[0.15em] mb-1`}>{f.l}</label>
                    <input type={f.t} value={editProfile[f.k] || ''} onChange={e => setEditProfile({ ...editProfile, [f.k]: e.target.value })} placeholder={f.p} className="w-full px-4 py-2.5 bg-slate-900/80 border-slate-700/50 text-white placeholder-slate-600 border rounded-lg focus:border-[#c9a96e] focus:outline-none text-sm" /></div>
                ))}
                <button onClick={handleProfileSave} className="w-full py-3 rounded-xl font-bold text-[#0a0f1c] text-sm bg-[#c9a96e] hover:bg-[#b8985d] transition">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR + CONTENT ═══ */}
      <div className="relative z-10 flex min-h-screen">
        {/* LEFT SIDEBAR */}
        <div className="w-[220px] flex-shrink-0 border-r border-white/[0.04] bg-black/20 backdrop-blur-xl flex flex-col sticky top-0 h-screen">
          <div className="p-5 pb-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2.5"><Brain className="w-5 h-5 text-[#c9a96e]" /><span className="font-bold text-white text-sm">Noodle</span>
              <span className="text-[8px] px-1.5 py-0.5 bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded text-[#c9a96e] font-bold uppercase tracking-wider">GYM</span></div>
          </div>
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            <button onClick={() => setActiveSection(null)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeSection ? 'bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}>
              <Activity className="w-4 h-4" /><span>Dashboard</span></button>
            <div className="pt-3 pb-1.5 px-3"><span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Tools</span></div>
            {sections.map(sec => (
              <button key={sec.id} onClick={() => setActiveSection(sec.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === sec.id ? 'bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}>
                {React.cloneElement(sec.icon, { className: 'w-4 h-4 flex-shrink-0' })}<span className="truncate">{sec.title}</span></button>
            ))}
          </div>
          <div className="px-3 py-2">
            <NoodleXButton variant="inline" />
          </div>
          <div className="p-3 border-t border-white/[0.04] space-y-0.5">
            <button onClick={() => navigate('/hub')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/[0.03] transition"><ArrowLeft className="w-4 h-4" /><span>Back to Hub</span></button>
            <button onClick={() => setShowProfileEditor(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/[0.03] transition"><Settings className="w-4 h-4" /><span>Settings</span></button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/[0.04] z-50 px-6 py-3.5 flex items-center justify-between">
            <h1 className="font-syne text-lg font-bold text-white">{!activeSection ? <>{getGreeting()}, <span className="text-[#c9a96e]">{profile.name || 'Athlete'}</span></> : sections.find(s => s.id === activeSection)?.title || 'Dashboard'}</h1>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs"><Clock className="w-3.5 h-3.5" /><span>{timeStr}</span></div>
              {profilePhoto ? <div className="w-8 h-8 rounded-full border border-[#c9a96e]/25 overflow-hidden cursor-pointer" onClick={() => setShowProfileEditor(true)}><img src={profilePhoto} alt="" className="w-full h-full object-cover" /></div>
                : <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer" onClick={() => setShowProfileEditor(true)}><User className="w-4 h-4 text-white/30" /></div>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {/* HOME */}
              {!activeSection && (
                <motion.div key="home" {...fadeIn} className="space-y-5">
                  <p className="text-slate-500 text-sm -mt-1">Track your progress and access your training tools.</p>
                  <GlassCard>
                    <AnimatePresence mode="wait">
                      <motion.div key={quoteIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
                        <p className="text-base font-semibold text-white mb-1.5 leading-relaxed italic max-w-xl">"{QUOTES[quoteIndex].text}"</p>
                        <p className={`${gold} font-medium text-xs`}>— {QUOTES[quoteIndex].author}</p>
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-4 max-w-xs h-px bg-slate-800 rounded-full overflow-hidden"><motion.div className="h-full bg-[#c9a96e]/50 rounded-full" style={{ width: `${progress}%` }} /></div>
                  </GlassCard>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[{ label: 'Days Active', val: daysSinceJoined, icon: Calendar, accent: 'text-[#c9a96e]' },
                      { label: 'BMI', val: bmi ? bmi.value : '—', icon: Activity, accent: bmi?.category === 'Normal' ? 'text-emerald-400' : 'text-amber-400', click: calcBMI },
                      { label: 'Credits Left', val: credits.isPremium ? '∞' : credits.limit - credits.used, icon: Zap, accent: 'text-blue-400' },
                      { label: 'Streak', val: profile.streak || 0, icon: Flame, accent: 'text-orange-400' },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card-m p-4 cursor-pointer" onClick={s.click}>
                        <div className="flex items-center justify-between mb-2"><s.icon className={`w-4 h-4 ${s.accent}`} /><span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">{s.label}</span></div>
                        <div className="font-syne text-2xl font-extrabold text-white">{s.val}</div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Today's Workout Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <GlassCard>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#c9a96e] to-[#a8884d] rounded-lg flex items-center justify-center"><Dumbbell className="w-4 h-4 text-white" /></div>
                        <div><div className="text-white font-semibold text-sm">Today's Workout</div><div className="text-slate-500 text-[10px]">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div></div>
                      </div>
                      <div className="space-y-1.5">
                        {(SPLITS.intermediate[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || { exercises: ['Rest Day — recover and stretch'] }).exercises.slice(0, 4).map((ex, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-white/70"><div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]/60" />{ex}</div>
                        ))}
                        <button onClick={() => setActiveSection('split')} className="text-[#c9a96e] text-xs font-semibold mt-2 hover:underline">View full split →</button>
                      </div>
                    </GlassCard>
                    <GlassCard>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center"><Leaf className="w-4 h-4 text-white" /></div>
                        <div><div className="text-white font-semibold text-sm">Nutrition Tip</div><div className="text-slate-500 text-[10px]">Daily reminder</div></div>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">Post-workout: consume 25-40g protein + fast carbs within 45 minutes. Whey + banana is a proven combo for optimal recovery.</p>
                      <button onClick={() => setActiveSection('diet')} className="text-emerald-400 text-xs font-semibold mt-3 hover:underline">Explore diet plans →</button>
                    </GlassCard>
                  </div>

                  {/* Supplement Spotlight */}
                  <GlassCard>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center"><Pill className="w-4 h-4 text-white" /></div>
                      <div><div className="text-white font-semibold text-sm">Supplement Spotlight</div><div className="text-slate-500 text-[10px]">Top picks for you</div></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {SUPPLEMENTS.slice(0, 4).map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                          className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                          <div className="text-white font-semibold text-xs">{s.name}</div>
                          <div className="text-slate-500 text-[9px] mt-0.5">{s.dose}</div>
                          <div className="flex gap-0.5 mt-1.5">{[...Array(5)].map((_, j) => <Star key={j} className={`w-2.5 h-2.5 ${j < s.rating ? 'text-[#c9a96e] fill-[#c9a96e]' : 'text-slate-700'}`} />)}</div>
                        </motion.div>
                      ))}
                    </div>
                    <button onClick={() => setActiveSection('supplements')} className="text-purple-400 text-xs font-semibold mt-3 hover:underline">View all supplements →</button>
                  </GlassCard>
                </motion.div>
              )}


            {/* WORKOUT SPLIT */}
            {activeSection === 'split' && (
              <motion.div key="split" {...fadeIn} className="max-w-3xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Workout Split</h2>
                <p className={`${gold} text-sm mb-6`}>Weekly programs</p>
                {!splitLevel ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[['beginner', <Leaf className={`w-8 h-8 ${gold}`}/>, 'Beginner', 'Full Body 3×/week'], ['intermediate', <Flame className={`w-8 h-8 ${gold}`}/>, 'Intermediate', 'PPL 6×/week']].map(([k, em, lbl, desc]) => (
                      <motion.button key={k} onClick={() => setSplitLevel(k)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                        className={`p-8 ${dm ? 'bg-slate-900/40 border-slate-700/25' : 'bg-white/50 border-slate-200/50'} border hover:border-[#c9a96e]/40 rounded-2xl transition text-center`}>
                        <div className="text-4xl mb-3 flex justify-center">{em}</div><div className={`${tp} font-bold`}>{lbl}</div><div className={`${ts} text-xs mt-1`}>{desc}</div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div {...fadeIn} className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {days.map(d => (
                        <button key={d} onClick={() => setActiveDay(d)} className={`px-3 py-2 rounded-lg font-medium text-sm capitalize transition ${activeDay === d ? 'bg-[#c9a96e] text-[#0a0f1c]' : dm ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{d.slice(0, 3)}</button>
                      ))}
                    </div>
                    {SPLITS[splitLevel][activeDay] && (
                      <div className={`${dm ? 'bg-slate-900/40 border-slate-700/25' : 'bg-white/50 border-slate-200/50'} border rounded-xl p-5`}>
                        <h3 className={`text-lg font-bold ${gold} mb-3`}>{SPLITS[splitLevel][activeDay].name}</h3>
                        <div className="space-y-1.5">
                          {SPLITS[splitLevel][activeDay].exercises.map((ex, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                              className={`flex items-center gap-3 p-3 ${dm ? 'bg-slate-800/30' : 'bg-slate-50/50'} rounded-lg`}>
                              <div className={`w-6 h-6 ${dm ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-200 text-slate-500'} rounded flex items-center justify-center font-bold text-[10px]`}>{i + 1}</div>
                              <span className={`${tp} text-sm font-medium`}>{ex}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => setSplitLevel('')} className={`flex items-center gap-2 px-4 py-2 ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'} font-medium text-sm transition`}>
                      <RefreshCw className="w-3.5 h-3.5" /> Change Level
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* EXERCISE DATABASE */}
            {activeSection === 'exercises' && (
              <motion.div key="exercises" {...fadeIn} className="max-w-3xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Exercise Database</h2>
                <p className={`${gold} text-sm mb-6`}>Browse by muscle</p>
                <AnimatePresence mode="wait">
                  {!activeMuscle ? (
                    <motion.div key="muscles" {...fadeIn} className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {Object.keys(MUSCLES).map(m => (
                        <motion.button key={m} onClick={() => setActiveMuscle(m)} whileHover={{ scale: 1.03 }}
                          className={`p-5 ${dm ? 'bg-slate-900/40 border-slate-700/25 hover:border-slate-600' : 'bg-white/50 border-slate-200/50 hover:border-slate-300'} border rounded-xl transition text-center capitalize`}>
                          <div className="flex justify-center mb-1.5"><Dumbbell className="w-6 h-6 opacity-60"/></div>
                          <div className={`${tp} font-semibold text-sm`}>{m}</div>
                          <div className={`${tm} text-[10px]`}>{MUSCLES[m].length} exercises</div>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key={activeMuscle} {...fadeIn} className="space-y-2">
                      <h3 className={`text-lg font-bold ${gold} capitalize mb-3`}>{activeMuscle}</h3>
                      {MUSCLES[activeMuscle].map((ex, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className={`flex items-center gap-3 p-3 ${dm ? 'bg-slate-900/40 border-slate-700/20' : 'bg-white/50 border-slate-200/40'} border rounded-lg`}>
                          <div className={`w-6 h-6 ${dm ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-200 text-slate-500'} rounded flex items-center justify-center font-bold text-[10px]`}>{i + 1}</div>
                          <span className={`${tp} text-sm font-medium`}>{ex}</span>
                        </motion.div>
                      ))}
                      <button onClick={() => setActiveMuscle('')} className={`flex items-center gap-2 mt-3 px-4 py-2 ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'} font-medium text-sm transition`}><ArrowLeft className="w-3.5 h-3.5" /> All Muscles</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* SUPPLEMENTS */}
            {activeSection === 'supplements' && (
              <motion.div key="supplements" {...fadeIn} className="max-w-3xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Supplement Guide</h2>
                <p className={`${gold} text-sm mb-6`}>Evidence-based recommendations</p>
                <div className="space-y-2.5">
                  {SUPPLEMENTS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`${dm ? 'bg-slate-900/40 border-slate-700/20' : 'bg-white/50 border-slate-200/40'} border rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`${tp} font-semibold text-sm`}>{s.name}</h4>
                        <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, j) => <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < s.rating ? 'bg-[#c9a96e]' : dm ? 'bg-slate-700' : 'bg-slate-200'}`} />)}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['Dose', s.dose], ['Timing', s.timing], ['Benefit', s.benefit]].map(([l, v]) => (
                          <div key={l} className={`${dm ? 'bg-slate-800/30' : 'bg-slate-50/50'} rounded-lg p-2`}>
                            <div className={`text-[9px] ${gold} font-semibold uppercase tracking-wider`}>{l}</div>
                            <div className={`${tp} text-[11px] font-medium`}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* DIET */}
            {activeSection === 'diet' && (
              <motion.div key="diet" {...fadeIn} className="max-w-3xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Nutrition</h2>
                <p className={`${gold} text-sm mb-6`}>Matched to your training phase</p>
                <AnimatePresence mode="wait">
                  {!dietGoal ? (
                    <motion.div key="diet-select" {...fadeIn} className="grid grid-cols-3 gap-3">
                      {[['bulk', '📈', 'Bulk'], ['cut', '📉', 'Cut'], ['maintain', '⚖️', 'Maintain']].map(([k, em, lbl]) => (
                        <motion.button key={k} onClick={() => setDietGoal(k)} whileHover={{ scale: 1.03 }}
                          className={`p-6 ${dm ? 'bg-slate-900/40 border-slate-700/25 hover:border-[#c9a96e]/25' : 'bg-white/50 border-slate-200/50 hover:border-[#c9a96e]/30'} border rounded-xl transition text-center`}>
                          <div className="text-3xl mb-2">{em}</div><div className={`${tp} font-bold text-sm`}>{lbl}</div>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key={dietGoal} {...fadeIn} className="space-y-4">
                      <div className={`${dm ? 'bg-slate-900/40 border-slate-700/25' : 'bg-white/50 border-slate-200/50'} border rounded-xl p-5`}>
                        <h3 className={`text-lg font-bold ${gold} capitalize mb-3`}>{dietGoal} Phase</h3>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {[['Calories', GYM_DIET[dietGoal].cal], ['Protein', GYM_DIET[dietGoal].protein]].map(([l, v]) => (
                            <div key={l} className={`p-3 ${dm ? 'bg-slate-800/30' : 'bg-slate-50/50'} rounded-lg`}>
                              <div className={`text-[10px] ${gold} font-semibold uppercase`}>{l}</div>
                              <div className={`${tp} font-semibold text-sm`}>{v}</div>
                            </div>
                          ))}
                        </div>
                        {GYM_DIET[dietGoal].meals.map((meal, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className={`flex items-center gap-3 p-2.5 mb-1.5 ${dm ? 'bg-slate-800/20' : 'bg-slate-50/30'} rounded-lg`}>
                            <div className={`w-5 h-5 ${dm ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-200 text-slate-500'} rounded flex items-center justify-center font-bold text-[9px]`}>{i + 1}</div>
                            <span className={`${tp} text-sm font-medium`}>{meal}</span>
                          </motion.div>
                        ))}
                      </div>
                      <button onClick={() => setDietGoal('')} className={`flex items-center gap-2 px-4 py-2 ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'} font-medium text-sm transition`}><RefreshCw className="w-3.5 h-3.5" /> Change</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* DEFICIENCY */}
            {activeSection === 'deficiency' && (
              <motion.div key="deficiency" {...fadeIn} className="max-w-2xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Deficiency Checker</h2>
                <p className={`${gold} text-sm mb-6`}>Symptom analysis</p>
                <div className={`${dm ? 'bg-slate-900/40 border-slate-700/25' : 'bg-white/50 border-slate-200/50'} border rounded-xl p-5 space-y-4`}>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. tired, cramps, brain fog..."
                    className={`w-full px-4 py-3 ${ib} border rounded-lg focus:border-[#c9a96e] focus:outline-none h-20 resize-none text-sm`} />
                  <button onClick={checkDeficiency} className="w-full py-3 rounded-xl font-bold text-[#0a0f1c] text-sm bg-[#c9a96e] hover:bg-[#b8985d] transition">Analyze</button>
                  <AnimatePresence>
                    {deficiencyResult !== null && (
                      <motion.div {...fadeIn} className="space-y-2">
                        {deficiencyResult ? deficiencyResult.map(([k, v]) => (
                          <div key={k} className={`p-3 ${dm ? 'bg-slate-800/30' : 'bg-slate-50'} rounded-lg flex items-start gap-2`}>
                            <CheckCircle className={`w-4 h-4 ${gold} flex-shrink-0 mt-0.5`} />
                            <div><p className={`${tp} font-semibold capitalize text-sm`}>{k}</p><p className={`${ts} text-xs`}>{v}</p></div>
                          </div>
                        )) : <p className={`${ts} text-center text-sm p-3`}>No matches. Try: tired, cramps, brain fog</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* 1RM CALCULATOR — DETAILED */}
            {activeSection === 'onerm' && (
              <motion.div key="onerm" {...fadeIn} className="max-w-2xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>1RM Calculator</h2>
                <p className={`${gold} text-sm mb-6`}>Estimate your one-rep max and training weights</p>

                {/* Explanation */}
                <div className="glass-card-m p-5 mb-4">
                  <h3 className={`text-sm font-bold ${tp} mb-2 flex items-center gap-2`}><BookOpen className="w-4 h-4 text-[#c9a96e]" /> What is 1RM?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Your <span className="text-white font-semibold">One-Rep Max (1RM)</span> is the maximum weight you can lift for a single repetition with proper form. It's the gold standard for measuring strength and programming your training intensity.</p>
                </div>

                {/* Calculator */}
                <div className="glass-card-m p-5 mb-4 space-y-4">
                  <h3 className={`text-sm font-bold ${tp} mb-1 flex items-center gap-2`}><TrendingUp className="w-4 h-4 text-[#c9a96e]" /> Calculate</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={`block ${gold} font-semibold text-[10px] uppercase tracking-wider mb-1`}>Weight Lifted (kg)</label>
                      <input type="number" value={oneRmWeight} onChange={e => setOneRmWeight(e.target.value)} placeholder="e.g. 100" className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 text-white placeholder-slate-600 rounded-xl focus:border-[#c9a96e] focus:outline-none text-sm" /></div>
                    <div><label className={`block ${gold} font-semibold text-[10px] uppercase tracking-wider mb-1`}>Reps Completed</label>
                      <input type="number" value={oneRmReps} onChange={e => setOneRmReps(e.target.value)} placeholder="e.g. 5" className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 text-white placeholder-slate-600 rounded-xl focus:border-[#c9a96e] focus:outline-none text-sm" /></div>
                  </div>
                  <button onClick={calc1RM} className="w-full py-3 rounded-xl font-bold text-[#0a0f1c] text-sm bg-[#c9a96e] hover:bg-[#b8985d] transition">Calculate 1RM</button>
                </div>

                {/* Results */}
                <AnimatePresence>
                  {oneRmResult && (
                    <motion.div {...fadeIn} className="space-y-4">
                      {/* Formulas */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass-card-m p-5 text-center">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Epley Formula</div>
                          <div className="font-syne text-3xl font-extrabold text-white">{oneRmResult.epley}<span className="text-slate-500 text-sm ml-1">kg</span></div>
                          <div className="text-[9px] text-slate-600 mt-2 font-mono">W × (1 + r/30)</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{oneRmResult.weight} × (1 + {oneRmResult.reps}/30)</div>
                        </div>
                        <div className="glass-card-m p-5 text-center">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Brzycki Formula</div>
                          <div className="font-syne text-3xl font-extrabold text-white">{oneRmResult.brzycki}<span className="text-slate-500 text-sm ml-1">kg</span></div>
                          <div className="text-[9px] text-slate-600 mt-2 font-mono">W × 36/(37 − r)</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{oneRmResult.weight} × 36/(37 − {oneRmResult.reps})</div>
                        </div>
                      </div>

                      {/* Training Weight Table */}
                      <div className="glass-card-m p-5">
                        <h3 className={`text-sm font-bold ${tp} mb-3 flex items-center gap-2`}><Dumbbell className="w-4 h-4 text-[#c9a96e]" /> Training Weight Table</h3>
                        <p className="text-slate-500 text-xs mb-3">Based on your estimated 1RM of <span className="text-white font-bold">{oneRmResult.epley}kg</span> (Epley)</p>
                        <div className="space-y-1.5">
                          {[
                            { pct: 95, reps: '1-2', use: 'Max strength / peaking' },
                            { pct: 90, reps: '2-3', use: 'Strength (low volume)' },
                            { pct: 85, reps: '3-5', use: 'Strength training' },
                            { pct: 80, reps: '5-7', use: 'Strength-hypertrophy' },
                            { pct: 75, reps: '8-10', use: 'Hypertrophy (muscle growth)' },
                            { pct: 70, reps: '10-12', use: 'Hypertrophy (volume)' },
                            { pct: 65, reps: '12-15', use: 'Muscular endurance' },
                          ].map((row, i) => (
                            <motion.div key={row.pct} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                              className="flex items-center gap-3 p-2.5 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition">
                              <div className="w-12 text-center">
                                <span className={`text-sm font-bold ${gold}`}>{row.pct}%</span>
                              </div>
                              <div className="w-16 text-center">
                                <span className="text-white font-bold text-sm">{Math.round(oneRmResult.epley * row.pct / 100)}kg</span>
                              </div>
                              <div className="w-14 text-center">
                                <span className="text-slate-400 text-xs">{row.reps} reps</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-slate-500 text-xs">{row.use}</span>
                              </div>
                              <div className="w-16">
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#c9a96e]/60 rounded-full" style={{ width: `${row.pct}%` }} />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="glass-card-m p-5">
                        <h3 className={`text-sm font-bold ${tp} mb-2 flex items-center gap-2`}><AlertTriangle className="w-4 h-4 text-amber-400" /> Important Notes</h3>
                        <div className="space-y-1.5 text-sm text-slate-400">
                          <p>• These are <span className="text-white">estimates</span> — actual 1RM can vary ±5% based on form, fatigue, and conditions.</p>
                          <p>• The formulas are most accurate with <span className="text-white">1-10 reps</span>. Above 10 reps, accuracy decreases.</p>
                          <p>• <span className="text-white">Never attempt a true 1RM alone</span> — always use a spotter or safety pins.</p>
                          <p>• Use the <span className="text-[#c9a96e]">75-80% range</span> for most hypertrophy work (8-10 reps).</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* REST TIMER */}
            {activeSection === 'timer' && (
              <motion.div key="timer" {...fadeIn} className="max-w-lg mx-auto text-center">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Rest Timer</h2>
                <p className={`${gold} text-sm mb-6`}>Between sets</p>
                <div className={`${dm ? 'bg-slate-900/40 border-slate-700/25' : 'bg-white/50 border-slate-200/50'} border rounded-xl p-8`}>
                  {restTimer === null ? (
                    <div className="space-y-6">
                      <div className="text-5xl mb-2">⏱️</div>
                      <div className="flex justify-center gap-2">{[60, 90, 120, 180].map(s => (
                        <button key={s} onClick={() => setRestSeconds(s)} className={`px-4 py-2 rounded-lg font-medium text-sm transition ${restSeconds === s ? 'bg-[#c9a96e] text-[#0a0f1c]' : dm ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{s}s</button>
                      ))}</div>
                      <button onClick={() => setRestTimer(restSeconds)} className="px-8 py-3.5 rounded-xl font-bold text-[#0a0f1c] bg-[#c9a96e] hover:bg-[#b8985d] transition text-sm">Start</button>
                    </div>
                  ) : (
                    <motion.div {...fadeIn}>
                      <div className="relative w-44 h-44 mx-auto mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke={dm ? '#1e293b' : '#e2e8f0'} strokeWidth="3" />
                          <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#c9a96e" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${(restTimer / restSeconds) * 283} 283`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center"><span className={`text-4xl font-bold ${tp}`}>{restTimer}</span></div>
                      </div>
                      <p className={`text-sm font-semibold ${restTimer <= 5 ? 'text-red-400' : gold} mb-4`}>{restTimer <= 0 ? "GO!" : restTimer <= 5 ? "Almost..." : "Resting"}</p>
                      <button onClick={() => setRestTimer(null)} className={`px-5 py-2 rounded-lg ${dm ? 'text-slate-400 bg-slate-800 hover:bg-slate-700' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'} font-medium text-sm transition`}>Cancel</button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* WISHLIST */}
            {activeSection === 'wishlist' && (
              <motion.div key="wishlist" {...fadeIn} className="max-w-2xl mx-auto">
                <h2 className={`text-2xl font-bold ${tp} mb-0.5 tracking-tight`}>Goal Planner</h2>
                <p className={`${gold} text-sm mb-6`}>Set goals, get a plan</p>
                <div className={`${dm ? 'bg-slate-900/40 border-slate-700/25' : 'bg-white/50 border-slate-200/50'} border rounded-xl p-5 space-y-4`}>
                  <textarea value={wishlistGoal} onChange={e => setWishlistGoal(e.target.value)} placeholder="e.g. build muscle, get abs, lose fat..."
                    className={`w-full px-4 py-3 ${ib} border rounded-lg focus:border-[#c9a96e] focus:outline-none h-20 resize-none text-sm`} />
                  <button onClick={generateWishlistPlan} className="w-full py-3 rounded-xl font-bold text-[#0a0f1c] text-sm bg-[#c9a96e] hover:bg-[#b8985d] transition">Generate Plan</button>
                  <AnimatePresence>
                    {wishlistPlan && (
                      <motion.div {...fadeIn} className="space-y-2">
                        <div className={`p-3 ${goldBg} border rounded-lg`}><div className={`${gold} font-semibold text-sm`}><Target className="w-4 h-4 inline-block -mt-0.5 mr-1" /> {wishlistPlan.goal}</div></div>
                        {[['Diet', wishlistPlan.diet], ['Training', wishlistPlan.workout], ['Timeline', wishlistPlan.timeline]].map(([l, v]) => (
                          <div key={l} className={`p-3 ${dm ? 'bg-slate-800/30' : 'bg-slate-50'} rounded-lg`}>
                            <div className={`${gold} font-semibold text-[10px] uppercase tracking-wider mb-0.5`}>{l}</div>
                            <div className={`${tp} text-sm`}>{v}</div>
                          </div>
                        ))}
                        <button onClick={() => { setWishlistPlan(null); setWishlistGoal(''); localStorage.removeItem('noodle_gym_wishlist'); }} className={`flex items-center gap-2 px-4 py-2 ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'} font-medium text-sm transition`}><RefreshCw className="w-3.5 h-3.5" /> New Goal</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* AI COACH */}
            {activeSection === 'coach' && (
              <motion.div key="coach" {...fadeIn}>
                <div className={`flex ${dm ? 'bg-slate-900/60' : 'bg-white/60'} backdrop-blur-xl border ${dm ? 'border-slate-700/30' : 'border-slate-200/50'} rounded-2xl overflow-hidden`} style={{ height: 'calc(100vh - 180px)', minHeight: 500 }}>
                  {/* Sidebar */}
                  <div className={`${showChatSidebar ? 'w-60' : 'w-0'} ${dm ? 'bg-slate-950/40 border-slate-800/40' : 'bg-slate-50/80 border-slate-200/50'} border-r flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden`}>
                    <div className="p-3">
                      <button onClick={startNewChat} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg ${dm ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border font-medium text-sm transition`}><Plus className="w-4 h-4" /> New Chat</button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                      {chatHistory.map(ch => (
                        <div key={ch.id} onClick={() => loadChat(ch)} className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition text-sm ${activeChatId === ch.id ? (dm ? 'bg-slate-800/60 text-white' : 'bg-slate-100 text-slate-900') : (dm ? 'text-slate-400 hover:bg-slate-800/30' : 'text-slate-500 hover:bg-slate-50')}`}>
                          <MessageSquare className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-1 truncate text-xs">{ch.title || 'Untitled'}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteChat(ch.id); }} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      {chatHistory.length === 0 && <div className={`text-center py-8 ${tm} text-xs`}>No history yet</div>}
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className={`flex items-center gap-3 px-5 py-3 border-b ${dm ? 'border-slate-800/40' : 'border-slate-100'}`}>
                      <button onClick={() => setShowChatSidebar(!showChatSidebar)} className={`p-1.5 rounded-lg ${dm ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'} transition`}><ListChecks className="w-4 h-4" /></button>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-7 h-7 bg-[#c9a96e] rounded-lg flex items-center justify-center text-sm text-[#0a0f1c] font-bold">N</div>
                        <div><div className={`${tp} font-semibold text-sm`}>Performance Coach</div><div className={`${tm} text-[10px]`}>AI-powered</div></div>
                      </div>
                      <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /><span className={`text-[10px] ${tm}`}>Online</span></div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                      {chatMessages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'ai' && <div className="w-6 h-6 bg-[#c9a96e] rounded-md flex items-center justify-center text-[10px] text-[#0a0f1c] font-bold mr-2 flex-shrink-0 mt-1">N</div>}
                          <div className={`max-w-[75%] ${msg.role === 'user'
                            ? 'bg-[#c9a96e] text-[#0a0f1c] rounded-2xl rounded-br-sm'
                            : (dm ? 'bg-slate-800/60 text-slate-200 rounded-2xl rounded-bl-sm' : 'bg-slate-50 text-slate-800 border border-slate-200/50 rounded-2xl rounded-bl-sm')
                            } px-4 py-2.5 text-sm leading-relaxed`}>
                            {msg.role === 'ai' ? (
                              <div className="prose prose-invert max-w-none prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2">
                                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.text}</ReactMarkdown>
                              </div>
                            ) : msg.text}
                          </div>
                          {msg.role === 'user' && profilePhoto && <div className="w-6 h-6 rounded-full border border-[#c9a96e]/20 overflow-hidden ml-2 flex-shrink-0 mt-1"><img src={profilePhoto} alt="" className="w-full h-full object-cover" /></div>}
                        </motion.div>
                      ))}
                      {aiLoading && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                          <div className="w-6 h-6 bg-[#c9a96e] rounded-md flex items-center justify-center text-[10px] text-[#0a0f1c] font-bold mr-2 flex-shrink-0 mt-1">N</div>
                          <div className={`${dm ? 'bg-slate-800/60 text-slate-200 rounded-2xl rounded-bl-sm' : 'bg-slate-50 text-slate-800 border border-slate-200/50 rounded-2xl rounded-bl-sm'} px-5 py-3 flex items-center gap-1.5`}>
                            <div className="w-2 h-2 bg-[#c9a96e]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[#c9a96e]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[#c9a96e]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className={`p-4 border-t ${dm ? 'border-slate-800/40' : 'border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-medium ${limitReached ? 'text-red-400' : credits.isPremium ? 'text-[#c9a96e]' : tm}`}>
                          {credits.isPremium ? 'Unlimited' : limitReached ? 'Daily limit reached' : `${credits.limit - credits.used} messages remaining today`}
                        </span>
                      </div>
                      {limitReached && (
                        <div className={`mb-2 px-3 py-2 rounded-lg text-xs font-medium ${dm ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                          You've used all {credits.limit} messages for today. Upgrade to Premium for unlimited access.
                        </div>
                      )}
                      <div className={`flex items-center gap-2 px-4 py-2.5 ${dm ? 'bg-slate-800/50 border-slate-700/50 focus-within:border-[#c9a96e]/50' : 'bg-white border-slate-200 focus-within:border-[#c9a96e]/50'} border rounded-xl transition`}>
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={limitReached ? 'Daily limit reached...' : 'Message...'} disabled={aiLoading || limitReached}
                          className={`flex-1 bg-transparent ${dm ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'} focus:outline-none text-sm disabled:opacity-50`} />
                        <motion.button onClick={sendChat} disabled={!chatInput.trim() || aiLoading || limitReached} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${chatInput.trim() && !aiLoading && !limitReached ? 'bg-[#c9a96e]' : dm ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <Send className={`w-3 h-3 ${chatInput.trim() && !limitReached ? 'text-[#0a0f1c]' : 'text-slate-400'}`} />
                        </motion.button>
                      </div>
                      <p className={`text-center mt-1.5 ${tm} text-[9px]`}>AI responses are for guidance only</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <ProfileBar />
    </div>
  );
}
