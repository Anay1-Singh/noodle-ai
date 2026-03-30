import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, Send, User, Sparkles, Zap, Target, Trophy,
  Flame, Shield, Dumbbell, Activity, ChevronDown, Plus, Trash2,
  MessageSquare, X, Star, Clock, Award, Settings, LogOut,
  Camera, Edit3, Sun, Moon as MoonIcon, AlertTriangle, ShieldCheck,
  Cpu, Wand2, BarChart3, Pill, CalendarCheck, Utensils, Heart, RefreshCw, Maximize2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import AvatarSelectModal from '../components/AvatarSelectModal';
import ProfileBar from '../components/ProfileBar';
import NoodleXButton from '../components/NoodleXButton';
import NoodleChat from '../components/NoodleChat';
import { loadChatHistory, saveChatSession, deleteChatSession } from '../utils/chatStorage';

// ═══════════════════════════════════════════════════════
// DATA — Hidden from UI, surfaced through AI responses
// ═══════════════════════════════════════════════════════

const QUOTES = [
  { t: "Champions aren't made in gyms. Champions are made from something they have deep inside them.", a: "Muhammad Ali" },
  { t: "The last three or four reps is what makes the muscle grow.", a: "Arnold Schwarzenegger" },
  { t: "There are no shortcuts. Everything is reps, reps, reps.", a: "Arnold Schwarzenegger" },
  { t: "Suffer the pain of discipline or suffer the pain of regret.", a: "Jim Rohn" },
  { t: "When you hit failure, your workout has just begun.", a: "Ronnie Coleman" },
  { t: "The iron never lies to you. Two hundred pounds is always two hundred pounds.", a: "Henry Rollins" },
  { t: "Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.", a: "Ronnie Coleman" },
  { t: "The road to nowhere is paved with excuses.", a: "Noodle Elite" },
];

const AI_KNOWLEDGE = {
  periodization: `📋 **12-Week Periodization Mesocycle**

**Phase 1: Hypertrophy (Weeks 1–4)**
• Volume: 16–20 sets/muscle | Rest: 60–90s | RPE: 7–8
• 4×10-12 reps at 60-75% 1RM
• Focus: Build muscle tissue through high volume and moderate intensity

**Phase 2: Strength (Weeks 5–8)**
• Volume: 10–15 sets/muscle | Rest: 3–5 min | RPE: 8–9
• 5×3-5 reps at 80-90% 1RM
• Focus: Neurological adaptation and heavy compound lifts

**Phase 3: Peak (Weeks 9–11)**
• Volume: 6–10 sets/muscle | Rest: 5 min+ | RPE: 9–10
• 3×1-3 reps at 90-100% 1RM
• Focus: Test maxes, specificity, and skill refinement

**Phase 4: Deload (Week 12)**
• Volume: 8–10 sets/muscle | Rest: As needed | RPE: 5–6
• 50% volume, 60% intensity — Active recovery
• Focus: Supercompensation and systemic recovery

*This is your roadmap to peak performance. Each phase builds on the last. Trust the process.*`,

  competition_prep: `**Competition Prep Protocol**

**CUTTING PHASE**
• Calories: BW (lbs) × 10-11 | Protein: 1.2-1.4g/lb
• Carbs: Cycled 50-200g | Fats: 0.3g/lb minimum
• Training: Maintain intensity, reduce volume 10-20%
• Cardio: LISS 30-45min 4-5×/week + 2 HIIT sessions
• Refeed: Every 10-14 days (+500 cal from carbs)
• Drop rate: 0.5-1% BW/week — slower = more muscle retention

**OFFSEASON GAIN**
• Calories: BW (lbs) × 16-18 | Protein: 1.0-1.2g/lb
• Carbs: 2-3g/lb | Fats: 0.4-0.5g/lb
• Training: Progressive overload, high volume 5-6 days
• Gain rate: 0.25-0.5% BW/week, keep BF under 15%

**MAINTENANCE**
• Calories: BW (lbs) × 14-15 | Protein: 1.0g/lb
• Use between preps to restore hormones and mental health

*I recommend starting with a 16-week prep timeline. What phase are you currently in?*`,

  body_composition: `**Body Composition Analysis Guide**

**Stage Readiness Tiers:**
• ≤5% BF → Stage Ready — Dangerously Lean (show day only)
• 6-7% BF → Stage Ready — Competition Shape
• 8-10% BF → Near Stage Ready — 2-4 weeks out
• 11-12% BF → Prep Phase — 6-8 weeks out
• 13-15% BF → Early Prep — 12-16 weeks out
• >15% BF → Off-season / Building Phase

**Lean Mass Estimation:**
• Lean Mass = Weight × (1 - BF%/100)
• Fat Mass = Weight × (BF%/100)

**Recommended Assessment Methods (accuracy order):**
1. DEXA Scan (±1-2%)
2. Bod Pod (±2-3%)
3. Skinfold Calipers (±3-4%)
4. Bioelectrical Impedance (±4-5%)
5. Visual Estimation (±5-8%)

*Give me your weight and estimated body fat percentage, and I'll calculate your lean mass, fat mass, and stage readiness.*`,

  supplements: `💊 **Elite Supplement Timing Protocol**

**☀️ MORNING**
• Vitamin D3 + K2 (5000 IU + 100mcg) — Hormonal health & immunity
• Fish Oil / Omega-3 (3g EPA/DHA) — Inflammation & joint health
• Creatine Monohydrate (5g) — Strength & cell hydration

**PRE-WORKOUT**
• Caffeine (200-400mg) — CNS activation & performance
• Citrulline Malate (6-8g) — Blood flow & endurance
• Beta-Alanine (3.2g) — Buffer lactic acid

**🔄 INTRA-WORKOUT**
• EAAs / BCAAs (10-15g) — Prevent catabolism
• Cluster Dextrin (25-50g) — Sustained energy on high volume days

**POST-WORKOUT**
• Whey Isolate (30-50g) — Rapid protein synthesis
• Creatine if not taken AM (5g) — Replenish phosphocreatine
• Dextrose (30-50g) — Spike insulin, shuttle nutrients

**🌙 NIGHT**
• Magnesium Glycinate (400mg) — Deep sleep & recovery
• ZMA (per label) — Testosterone & repair
• Casein Protein (30g) — Slow-release overnight amino feed

*Every gram, every timing window matters at this level. What's your current stack?*`,

  peak_week: `**Peak Week Protocol — 7-Day Show Prep**

**Monday — Depletion Day 1**
Carbs: <50g | Water: 2 gallons | Sodium: Normal
Training: Full body high-rep depletion workout
→ Strip glycogen stores completely

**Tuesday — Depletion Day 2**
Carbs: <50g | Water: 2 gallons | Sodium: Normal
Training: Upper body pump — light weights, high reps

**Wednesday — Depletion Day 3**
Carbs: <30g | Water: 1.5 gallons | Sodium: Slightly reduce
Training: Lower body pump — light weights only
→ Body should look flat and depleted

**Thursday — Carb Load Day 1**
Carbs: 400-500g (complex) | Water: 1 gallon | Sodium: Cut 50%
Training: Complete rest — muscles begin to fill

**Friday — Carb Load Day 2**
Carbs: 500-600g (complex + simple) | Water: Sips only | Sodium: Near zero
Training: Light 20-min pump + posing practice
→ Fullness peaks. Monitor in mirror.

**Saturday — Show Eve**
Carbs: 200g (simple sugars) | Water: Sips only | Sodium: Zero
Training: Light pump 2hrs before prejudging
→ Rice cakes + honey backstage. Final adjustments.

**Sunday — SHOW DAY**
Carbs: Fast carbs backstage | Water: Minimal sips
Training: Pump up backstage with bands + push-ups
→ TRUST THE PROCESS. You've earned this.

*Peak week is where champions are separated. Want me to customize this for your show date?*`,

  training_split: `**Custom Training Split — Push/Pull/Legs ×2**

**Day 1 — PUSH (Chest/Shoulders/Triceps)**
• Bench Press 4×6-8
• Incline DB Press 3×10-12
• OHP 4×6-8
• Lateral Raises 4×12-15
• Cable Flyes 3×12-15
• Tricep Pushdowns 3×12-15
• Overhead Tricep Extension 3×10-12

**Day 2 — PULL (Back/Biceps/Rear Delts)**
• Deadlift 4×5-6
• Barbell Row 4×8-10
• Lat Pulldown 3×10-12
• Face Pulls 4×15-20
• DB Curls 3×10-12
• Hammer Curls 3×10-12

**Day 3 — LEGS (Quads/Hams/Glutes/Calves)**
• Squat 4×6-8
• Romanian Deadlift 3×8-10
• Leg Press 3×12-15
• Walking Lunges 3×12/leg
• Leg Curl 3×12-15
• Calf Raises 4×15-20

**Day 4 — REST**

**Day 5-7 — Repeat with higher rep ranges (hypertrophy)**

*Progressive overload is king. Add weight or reps every session. What are your current maxes?*`,

  macro_cycling: `🍗 **Macro Cycling Protocol**

**Training Day (High Carb)**
• Protein: 1.2g/lb | Carbs: 2.5g/lb | Fats: 0.3g/lb
• Focus carbs around training window (pre/intra/post)
• Example (200lb): 240P / 500C / 60F = ~3,540 cal

**Rest Day (Low Carb)**
• Protein: 1.4g/lb | Carbs: 0.5g/lb | Fats: 0.5g/lb
• Higher fats for satiety and hormone production
• Example (200lb): 280P / 100C / 100F = ~2,380 cal

**Refeed Day (High Carb Boost)**
• Every 10-14 days during a cut
• Protein: 1.0g/lb | Carbs: 3.0g/lb | Fats: 0.25g/lb
• Restores leptin, glycogen, and thyroid function
• Example (200lb): 200P / 600C / 50F = ~3,650 cal

**Carb Timing Breakdown:**
• Pre-workout (90 min before): 30% daily carbs
• Intra-workout: 15% daily carbs (liquid)
• Post-workout (within 60 min): 30% daily carbs
• Remaining meals: 25% daily carbs

*Give me your bodyweight and goal, and I'll calculate your exact macros.*`,

  recovery: `**Recovery Optimization Protocol**

**Sleep Architecture (Non-negotiable)**
• 7-9 hours per night minimum
• Consistent bed/wake time (±30 min)
• Room temp: 65-68°F (18-20°C)
• No screens 60 min before bed
• Magnesium glycinate 400mg before sleep

**Active Recovery Methods**
• Light walking: 20-30 min on rest days
• Foam rolling: 10-15 min full body
• Contrast showers: 30s cold / 90s hot × 5 rounds
• Stretching/mobility: 15-20 min daily

**Nutrition for Recovery**
• Post-workout protein within 60 min
• Anti-inflammatory foods: turmeric, ginger, berries
• Hydration: 1 gallon + 16oz per hour of training
• Tart cherry juice: 8oz AM/PM (natural melatonin + anti-inflammatory)

**Stress Management**
• Box breathing: 4s in / 4s hold / 4s out / 4s hold
• Training deloads every 4-6 weeks
• HRV monitoring for readiness
• Mental visualization: 10 min pre-training

**Red Flags to Watch**
• Elevated resting HR (+5-10 bpm)
• Disrupted sleep patterns
• Persistent joint pain
• Decreased appetite
• Mood disturbances / irritability

*Recovery is where gains are made. How's your sleep quality? Want me to build a recovery protocol for you?*`
};

const AI_GENERAL_RESPONSES = [
  "That's a great question for an elite athlete. Based on what I know about competition prep, I'd recommend focusing on progressive overload while monitoring recovery markers closely. What specific area would you like me to dive deeper into?",
  "At the elite level, the difference between good and great is in the details — sleep quality, nutrient timing, and stress management. Let me break down what I'd suggest for your situation.",
  "Competition prep requires a strategic approach. Every variable matters — from sodium manipulation to carb cycling. Tell me more about your timeline and I'll create a specific protocol.",
  "Training periodization is crucial at your level. Without proper phase management, you risk overtraining or peaking too early. What week are you currently in?",
  "The mind-muscle connection at the elite level is underrated. Combine visualization with your physical training for optimal results. What's your current training frequency?",
  "At the elite tier, I always recommend tracking HRV and resting heart rate to gauge recovery readiness. Have you been monitoring these metrics?",
  "Nutrition timing becomes increasingly important as you approach competition. Let me know your current macros and I'll help optimize your protocol.",
];

const QUICK_ACTIONS = [
  { id: 'periodization', icon: <Target className="w-5 h-5" />, label: 'Periodization Plan', desc: 'AI-generated 12-week mesocycle', gradient: 'from-amber-500 to-orange-600', prompt: 'Generate my periodization plan' },
  { id: 'competition_prep', icon: <Flame className="w-5 h-5" />, label: 'Competition Prep', desc: 'AI prep protocol builder', gradient: 'from-red-500 to-rose-600', prompt: 'Create my competition prep protocol' },
  { id: 'body_composition', icon: <BarChart3 className="w-5 h-5" />, label: 'Body Analysis', desc: 'AI composition calculator', gradient: 'from-blue-500 to-indigo-600', prompt: 'Analyze my body composition' },
  { id: 'supplements', icon: <Pill className="w-5 h-5" />, label: 'Supplement Protocol', desc: 'AI-timed supplementation', gradient: 'from-emerald-500 to-teal-600', prompt: 'Design my supplement timing protocol' },
  { id: 'peak_week', icon: <Trophy className="w-5 h-5" />, label: 'Peak Week Strategy', desc: 'AI show prep planner', gradient: 'from-amber-500 to-yellow-500', prompt: 'Generate my peak week strategy' },
  { id: 'training_split', icon: <Dumbbell className="w-5 h-5" />, label: 'Training Split', desc: 'AI custom programming', gradient: 'from-violet-500 to-purple-600', prompt: 'Create a custom training split for me' },
  { id: 'macro_cycling', icon: <Utensils className="w-5 h-5" />, label: 'Macro Cycling', desc: 'AI nutrition periodization', gradient: 'from-green-500 to-emerald-600', prompt: 'Design my macro cycling plan' },
  { id: 'recovery', icon: <Heart className="w-5 h-5" />, label: 'Recovery Protocol', desc: 'AI recovery optimizer', gradient: 'from-cyan-500 to-blue-600', prompt: 'Optimize my recovery protocol' },
];

// Animation variants
const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const cardFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: 'easeOut' } };

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function Hard() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Core state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [qProgress, setQProgress] = useState(0);

  // Profile
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: '' });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleAvatarSelect = (url) => {
    setProfilePhoto(url);
    const sp = localStorage.getItem('user');
    let ud = {};
    if (sp) try { ud = JSON.parse(sp); } catch {}
    ud.avatar = url;
    localStorage.setItem('user', JSON.stringify(ud));
    window.dispatchEvent(new Event('noodle_profile_update'));
  };

  // AI Chat
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Welcome to **Elite Command**\n\nI'm your AI Competition Coach — built for serious athletes. I generate personalized periodization plans, competition prep protocols, supplement timing, peak week strategies, and more.\n\n**Choose a quick action below** or ask me anything about elite training.", type: 'welcome' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [credits, setCredits] = useState({ used: 0, limit: 30, isPremium: false });
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(Date.now().toString());
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // ═══ EFFECTS ═══

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const str = localStorage.getItem('user');
        if (str) {
          const ud = JSON.parse(str);
          if (ud.avatar) setProfilePhoto(ud.avatar);
          setUserProfile({ name: ud.name || 'Athlete', ...ud });
        }
      } catch (err) {}
      
      const ch = await loadChatHistory('hard');
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

  // Quote rotation
  useEffect(() => {
    setQProgress(0);
    const pi = setInterval(() => setQProgress(p => Math.min(p + (100 / 80), 100)), 100);
    const qi = setInterval(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQProgress(0); }, 8000);
    return () => { clearInterval(pi); clearInterval(qi); };
  }, [quoteIdx]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isTyping]);



  // Canvas particle system — ember / flame theme
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const colors = [
      'rgba(245,158,11,0.3)', 'rgba(251,191,36,0.2)', 'rgba(217,119,6,0.25)',
      'rgba(245,158,11,0.15)', 'rgba(252,211,77,0.2)', 'rgba(180,83,9,0.2)'
    ];
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2, vy: -(Math.random() * 0.4 + 0.1),
      size: Math.random() * 2.5 + 0.5, color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2, angleV: (Math.random() - 0.5) * 0.01,
      orbit: Math.random() * 10 + 3, life: Math.random(),
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.02,
      flicker: Math.random() * 0.5 + 0.5
    }));
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      particlesRef.current.forEach(p => {
        p.angle += p.angleV; p.rot += p.rotV;
        p.x += p.vx; p.y += p.vy;
        p.life += 0.002;
        p.flicker = 0.5 + Math.sin(p.life * 3) * 0.3;
        if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        let tx = p.x + Math.cos(p.angle) * p.orbit;
        let ty = p.y + Math.sin(p.angle) * p.orbit;
        const dx = tx - mx, dy = ty - my, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const f = (120 - dist) / 120;
          tx += (dx / dist) * f * 30; ty += (dy / dist) * f * 30;
        }
        ctx.save();
        ctx.globalAlpha = p.flicker;
        ctx.translate(tx, ty);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.shadowColor = p.color.replace(/[\d.]+\)$/, '0.4)');
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.restore();
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // ═══ AI CHAT FUNCTIONS ═══

  const generateAIResponse = (userMsg) => {
    const lower = userMsg.toLowerCase();
    // Check for quick action keywords
    for (const [key, response] of Object.entries(AI_KNOWLEDGE)) {
      const keywords = key.split('_');
      if (keywords.some(kw => lower.includes(kw))) {
        return response;
      }
    }
    // Check broader keywords
    if (lower.includes('periodiz') || lower.includes('mesocycle') || lower.includes('12 week') || lower.includes('program')) return AI_KNOWLEDGE.periodization;
    if (lower.includes('comp') || lower.includes('prep') || lower.includes('cut') || lower.includes('bulk') || lower.includes('offseason')) return AI_KNOWLEDGE.competition_prep;
    if (lower.includes('body') || lower.includes('fat') || lower.includes('lean') || lower.includes('composition') || lower.includes('bf%')) return AI_KNOWLEDGE.body_composition;
    if (lower.includes('suppl') || lower.includes('creatine') || lower.includes('protein') || lower.includes('vitamin')) return AI_KNOWLEDGE.supplements;
    if (lower.includes('peak') || lower.includes('show') || lower.includes('stage') || lower.includes('depletion') || lower.includes('carb load')) return AI_KNOWLEDGE.peak_week;
    if (lower.includes('split') || lower.includes('ppl') || lower.includes('push pull') || lower.includes('routine') || lower.includes('training')) return AI_KNOWLEDGE.training_split;
    if (lower.includes('macro') || lower.includes('carb') || lower.includes('calorie') || lower.includes('nutrition') || lower.includes('diet')) return AI_KNOWLEDGE.macro_cycling;
    if (lower.includes('recov') || lower.includes('sleep') || lower.includes('rest') || lower.includes('deload') || lower.includes('stress')) return AI_KNOWLEDGE.recovery;
    // Fallback
    return AI_GENERAL_RESPONSES[Math.floor(Math.random() * AI_GENERAL_RESPONSES.length)];
  };

  const fetchCredits = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ai/credits?tier=hard', { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setCredits(data); }
    } catch { }
  };
  useEffect(() => { fetchCredits(); }, []);
  const limitReached = !credits.isPremium && credits.used >= credits.limit;

  const sendMessage = async (text) => {
    if (!text?.trim() || isTyping || limitReached) return;
    const userMsg = text.trim();
    setChatInput('');
    setShowQuickActions(false);
    const newMsgs = [...chatMessages, { role: 'user', text: userMsg }];
    setChatMessages(newMsgs);
    setIsTyping(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg, tier: 'hard' }),
      });
      if (res.status === 403) {
        setChatMessages([...newMsgs, { role: 'ai', text: 'Daily message limit reached. Come back tomorrow or upgrade to Premium!' }]);
        fetchCredits(); setIsTyping(false); return;
      }
      if (!res.ok) {
        let errMessage = 'Sorry, something went wrong.';
        try { const data = await res.json(); errMessage = data.message; } catch(e){}
        setChatMessages([...newMsgs, { role: 'ai', text: errMessage }]);
        fetchCredits(); setIsTyping(false); return;
      }
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (isFirstChunk) { setIsTyping(false); isFirstChunk = false; }
        aiText += decoder.decode(value, { stream: true });
        setChatMessages([...newMsgs, { role: 'ai', text: aiText }]);
      }
      fetchCredits();
    } catch (err) {
      setChatMessages([...newMsgs, { role: 'ai', text: 'Could not reach the AI server. Please try again later.' }]);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action.prompt);
  };

  const saveCurrentChat = () => {
    if (!chatMessages.some(m => m.role === 'user')) return;
    const first = chatMessages.find(m => m.role === 'user');
    const title = first ? first.text.slice(0, 35) + (first.text.length > 35 ? '...' : '') : 'Untitled';
    const id = activeChatId || Date.now().toString();
    const cd = { id, title, messages: [...chatMessages], date: new Date().toISOString() };
    setChatHistory(prev => [cd, ...prev.filter(c => c.id !== id)]);
    saveChatSession('hard', id, cd);
  };

  const startNewChat = () => {
    saveCurrentChat();
    setChatMessages([
      { role: 'ai', text: "Welcome to **Elite Command**\n\nI'm your AI Competition Coach — built for serious athletes. I generate personalized periodization plans, competition prep protocols, supplement timing, peak week strategies, and more.\n\n**Choose a quick action below** or ask me anything about elite training.", type: 'welcome' }
    ]);
    setActiveChatId(Date.now().toString());
    setShowQuickActions(true);
  };

  const loadChat = (ch) => { saveCurrentChat(); setChatMessages(ch.messages); setActiveChatId(ch.id); setShowQuickActions(false); };
  const deleteChat = (id) => { setChatHistory(prev => prev.filter(c => c.id !== id)); deleteChatSession('hard', id); if (activeChatId === id) startNewChat(); };

  // ═══ RENDER HELPERS ═══

  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="text-amber-400 font-black text-sm mt-3 mb-1">{line.replace(/\*\*/g, '')}</div>;
      }
      // Section headers with emoji
      if (/^[•*-]/.test(line) && line.includes('**')) {
        const clean = line.replace(/\*\*/g, '');
        return <div key={i} className="text-amber-300 font-black text-base mt-2 mb-2">{clean}</div>;
      }
      // Bold inline
      if (line.includes('**')) {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div key={i} className="text-zinc-300 text-sm leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <span key={j} className="text-amber-400 font-bold">{part.replace(/\*\*/g, '')}</span>
                : <span key={j}>{part}</span>
            )}
          </div>
        );
      }
      // Bullet points
      if (line.startsWith('•') || line.startsWith('→')) {
        return <div key={i} className="text-zinc-400 text-sm pl-2 leading-relaxed">{line}</div>;
      }
      // Warning lines
      if (line.startsWith('Caution:') || line.startsWith('Warning:')) {
        return <div key={i} className="text-amber-500/80 text-sm pl-2 leading-relaxed">{line}</div>;
      }
      // Italic lines
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return <div key={i} className="text-amber-500/70 text-xs italic mt-3 leading-relaxed">{line.replace(/^\*|\*$/g, '')}</div>;
      }
      // Empty lines
      if (line.trim() === '') return <div key={i} className="h-2" />;
      // Regular text
      return <div key={i} className="text-zinc-300 text-sm leading-relaxed">{line}</div>;
    });
  };

  return chatFullscreen ? (
    <NoodleChat
      tier="hard"
      messages={chatMessages}
      onSend={sendMessage}
      isLoading={isTyping}
      onClose={() => setChatFullscreen(false)}
      userName={userProfile?.name || 'Champion'}
      userAvatar={profilePhoto}
      creditInfo={credits}
      chatHistory={chatHistory}
      onNewChat={startNewChat}
      onLoadChat={loadChat}
      onDeleteChat={deleteChat}
      activeChatId={activeChatId}
    />
  ) : (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Canvas particle background */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />

      {/* Overlay gradients */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950/80 to-zinc-900/30" />
        {/* Mouse glow */}
        <div className="absolute rounded-full blur-3xl transition-all duration-500"
          style={{
            width: 600, height: 600, left: mousePos.x - 300, top: mousePos.y - 300,
            background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)'
          }} />
        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
          <defs>
            <pattern id="eliteGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(245,158,11)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eliteGrid)" />
        </svg>
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent"
          style={{ animation: 'eliteScan 10s linear infinite' }} />
      </div>

      <style>{`
        @keyframes eliteScan { 0% { top: -1px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes goldPulse { 0%,100% { box-shadow: 0 0 15px rgba(245,158,11,0.1); } 50% { box-shadow: 0 0 40px rgba(245,158,11,0.2), 0 0 80px rgba(245,158,11,0.05); } }
        @keyframes typingDot { 0%,60%,100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }
        .gold-glow { animation: goldPulse 4s ease-in-out infinite; }
        .typing-dot { animation: typingDot 1.4s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.15); border-radius: 100px; }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 100px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-2xl border-b border-amber-900/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/hub")}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Hub</span>
          </button>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-amber-500" />
            <span className="text-base font-bold tracking-tight">Noodle</span>
            <span className="text-[9px] px-2 py-0.5 bg-amber-500/8 border border-amber-500/25 rounded font-bold text-amber-400 uppercase tracking-[0.2em] mr-2">
              ELITE
            </span>
            <NoodleXButton variant="nav" />
          </div>
          </div>
        </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={profilePhoto}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── HERO QUOTE ── */}
        <motion.div {...fadeIn} className="mb-6">
          <div className="gold-glow bg-zinc-900/40 backdrop-blur-xl border border-amber-700/20 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-amber-500/60" />
              <span className="text-[10px] text-amber-500/60 font-bold uppercase tracking-[0.25em]">AI-Powered Elite Training</span>
              <Cpu className="w-4 h-4 text-amber-500/60" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={quoteIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                <p className="text-base md:text-xl lg:text-2xl font-bold text-white leading-snug max-w-3xl mx-auto mb-3">
                  "{QUOTES[quoteIdx].t}"
                </p>
                <p className="text-amber-400/80 font-semibold text-xs">— {QUOTES[quoteIdx].a}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 max-w-xs mx-auto h-px bg-zinc-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${qProgress}%` }} />
            </div>
          </div>
        </motion.div>

        {/* ── AI COMMAND CENTER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">

          {/* Command Center Header */}
          <div className="bg-gradient-to-r from-amber-900/20 via-zinc-900/80 to-zinc-900/80 px-5 py-3.5 flex items-center gap-3 border-b border-zinc-800/50">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-amber-500/10">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                Elite AI Command
                <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-bold uppercase tracking-wider">Online</span>
              </h4>
              <p className="text-[10px] text-zinc-500">Strategic • Analytical • Competition-Focused</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setChatFullscreen(true)}
                className="p-2 rounded-lg hover:bg-amber-500/10 transition text-zinc-500 hover:text-amber-400" title="Expand Chat">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setShowChatSidebar(!showChatSidebar)}
                className="p-2 rounded-lg hover:bg-zinc-800/50 transition text-zinc-500 hover:text-zinc-300" title="Chat History">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button onClick={startNewChat}
                className="p-2 rounded-lg hover:bg-zinc-800/50 transition text-zinc-500 hover:text-zinc-300" title="New Chat">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>

            {/* Chat Sidebar */}
            <AnimatePresence>
              {showChatSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-r border-zinc-800/50 bg-zinc-900/40 flex flex-col overflow-hidden flex-shrink-0">
                  <div className="p-3 border-b border-zinc-800/50">
                    <button onClick={startNewChat}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/15 transition">
                      <Plus className="w-3.5 h-3.5" /> New Conversation
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto sidebar-scroll p-2 space-y-1">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-8 text-zinc-600 text-xs">No past chats</div>
                    ) : (
                      chatHistory.map(ch => (
                        <div key={ch.id}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition text-left ${activeChatId === ch.id ? 'bg-amber-500/10 border border-amber-500/15' : 'hover:bg-zinc-800/40 border border-transparent'}`}
                          onClick={() => loadChat(ch)}>
                          <MessageSquare className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                          <span className="text-xs text-zinc-400 truncate flex-1">{ch.title}</span>
                          <button onClick={(e) => { e.stopPropagation(); deleteChat(ch.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition text-zinc-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto chat-scroll p-5 space-y-4">
                {chatMessages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i === chatMessages.length - 1 ? 0.05 : 0, duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                    {msg.role === 'ai' && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-xs shadow-md shadow-amber-500/10">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                      ? 'bg-amber-500 text-black font-medium text-sm rounded-br-md'
                      : 'bg-zinc-800/60 border border-zinc-700/40 rounded-bl-md'
                      }`}>
                      {msg.role === 'ai' ? (
                        <div className="prose prose-invert max-w-none prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2">
                          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="text-sm">{msg.text}</span>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 mt-1">
                        {profilePhoto ? (
                          <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/20">
                            <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
                            <User className="w-3 h-3 text-zinc-500" />
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div className="bg-zinc-800/60 border border-zinc-700/40 rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-amber-500/60 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-amber-500/60 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-amber-500/60 rounded-full typing-dot" />
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions — shown after welcome message */}
                {showQuickActions && chatMessages.length <= 1 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                    <div className="flex items-center gap-2 mb-3 ml-10">
                      <Wand2 className="w-3.5 h-3.5 text-amber-500/50" />
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Quick Actions</span>
                    </div>
                    <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-10" variants={stagger} initial="initial" animate="animate">
                      {QUICK_ACTIONS.map((action) => (
                        <motion.button key={action.id} variants={cardFade}
                          onClick={() => handleQuickAction(action)}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className="group bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/30 hover:border-amber-500/20 rounded-xl p-3 text-left transition-all duration-200">
                          <div className={`w-8 h-8 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mb-2 text-white shadow-sm group-hover:shadow-md transition-shadow`}>
                            {React.cloneElement(action.icon, { className: 'w-4 h-4' })}
                          </div>
                          <div className="text-[11px] font-semibold text-white leading-tight">{action.label}</div>
                          <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{action.desc}</div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 bg-zinc-900/60 border-t border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-medium ${limitReached ? 'text-red-400' : credits.isPremium ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {credits.isPremium ? 'Unlimited' : limitReached ? 'Daily limit reached' : `${credits.limit - credits.used} messages remaining today`}
                  </span>
                </div>
                {limitReached && (
                  <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    You've used all {credits.limit} messages for today. Upgrade to Premium for unlimited access.
                  </div>
                )}
                {/* Quick action chips — compact row */}
                {!showQuickActions && chatMessages.length > 1 && !limitReached && (
                  <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {QUICK_ACTIONS.slice(0, 4).map(a => (
                      <button key={a.id} onClick={() => handleQuickAction(a)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-zinc-400 hover:text-amber-400 hover:border-amber-500/20 text-[10px] font-semibold transition whitespace-nowrap">
                        {React.cloneElement(a.icon, { className: 'w-3 h-3' })}
                        {a.label}
                      </button>
                    ))}
                    <button onClick={() => setShowQuickActions(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-zinc-500 hover:text-zinc-300 text-[10px] font-semibold transition whitespace-nowrap">
                      <RefreshCw className="w-3 h-3" /> More
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(chatInput)}
                    placeholder={limitReached ? 'Daily limit reached...' : 'Ask about periodization, peak week, macros, recovery...'}
                    disabled={isTyping || limitReached}
                    className="flex-1 px-4 py-3 bg-black/40 border border-zinc-700/50 rounded-xl focus:border-amber-500/50 focus:outline-none text-white placeholder-zinc-600 text-sm transition disabled:opacity-50" />
                  <motion.button onClick={() => sendMessage(chatInput)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    disabled={isTyping || !chatInput.trim() || limitReached}
                    className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-amber-500/15 disabled:opacity-40 disabled:shadow-none">
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-6 mt-4">
          <div className="inline-flex items-center gap-2 text-zinc-700 text-xs">
            <Brain className="w-4 h-4 text-amber-500" />
            <span>Noodle Elite</span>
            <span className="text-zinc-800">•</span>
            <span>AI-Powered Competition Coaching</span>
          </div>
        </div>
      </div>
      <ProfileBar />
    </div>
  );
}