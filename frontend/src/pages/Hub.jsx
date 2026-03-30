import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  ArrowRight, X, User, LogOut, Edit3, ChevronDown,
  Calendar, Target, Award, Settings, Palette, Shield, Zap, Sparkles
} from 'lucide-react';
import AvatarSelectModal from '../components/AvatarSelectModal';
import ProfileBar from '../components/ProfileBar';
import NoodleXButton from '../components/NoodleXButton';

/* ══════════════════════════════════════════════════════════════════
   CONFIG
   ══════════════════════════════════════════════════════════════════ */
const PATH_CONFIG = { easy: { route: '/hub/easy', label: 'Easy' }, medium: { route: '/hub/medium', label: 'Medium' }, hard: { route: '/hub/hard', label: 'Hard' } };
const DEFAULT_PROFILE = { name: '', age: '', weight: '', height: '', goal: '', joinedDate: new Date().toISOString(), streak: 0, level: 'Wellness Seeker' };

const TIERS = [
  { key: 'easy', title: 'Beginner', tag: 'EASY', desc: 'Beginner AI coach that helps build consistency and learn fundamentals.', icon: <Shield size={20} strokeWidth={1.5} />, color: '#34d399', rgb: '52,211,153', grad: 'linear-gradient(135deg,#34d399,#059669)' },
  { key: 'medium', title: 'Intermediate', tag: 'MEDIUM', desc: 'Intermediate level coaching designed for steady progression and muscle growth.', icon: <Target size={20} strokeWidth={1.5} />, color: '#a78bfa', rgb: '167,139,250', grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)' },
  { key: 'hard', title: 'Advanced', tag: 'HARD', desc: 'Advanced intensity strategy focused on peak performance and advanced methods.', icon: <Zap size={20} strokeWidth={1.5} />, color: '#fb923c', rgb: '251,146,60', grad: 'linear-gradient(135deg,#fb923c,#ea580c)' },
];

/* ══════════════════════════════════════════════════════════════════
   ORGANIC CANVAS — Soft flowing color blobs, dreamy & professional
   Inspired by wherecolorsdream.art — organic shapes, muted tones,
   slow breathing motion, no grids or hard edges
   ══════════════════════════════════════════════════════════════════ */
function OrganicCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let w, h, raf;

    const resize = () => { w = cvs.width = window.innerWidth; h = cvs.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    });

    // Organic blobs — soft, slow, muted
    const blobs = [
      { x: 0.15, y: 0.25, baseX: 0.15, baseY: 0.25, r: 0.5, h: 250, s: 25, l: 12, speed: 0.0004, phase: 0 },
      { x: 0.8, y: 0.7, baseX: 0.8, baseY: 0.7, r: 0.45, h: 170, s: 30, l: 10, speed: 0.0003, phase: 1.5 },
      { x: 0.5, y: 0.15, baseX: 0.5, baseY: 0.15, r: 0.4, h: 30, s: 28, l: 11, speed: 0.00035, phase: 3 },
      { x: 0.3, y: 0.85, baseX: 0.3, baseY: 0.85, r: 0.42, h: 290, s: 22, l: 10, speed: 0.00025, phase: 4.5 },
      { x: 0.75, y: 0.3, baseX: 0.75, baseY: 0.3, r: 0.38, h: 140, s: 20, l: 9, speed: 0.0003, phase: 6 },
    ];

    let t = 0;
    const render = () => {
      t += 1;
      // Soft fade for trailing effect
      ctx.fillStyle = 'rgba(5,5,10,0.06)';
      ctx.fillRect(0, 0, w, h);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      blobs.forEach((b, i) => {
        // Organic drift: figure-8 pattern with mouse influence
        const drift = t * b.speed;
        b.x = b.baseX + Math.sin(drift + b.phase) * 0.12 + Math.cos(drift * 0.7 + b.phase * 2) * 0.06;
        b.y = b.baseY + Math.cos(drift + b.phase * 1.3) * 0.1 + Math.sin(drift * 0.5 + b.phase) * 0.05;

        // Gentle cursor attraction
        b.x += (mx - 0.5) * 0.015;
        b.y += (my - 0.5) * 0.015;

        // Slowly shifting hue — very subtle
        const hue = b.h + Math.sin(t * 0.001 + i * 0.8) * 15;
        const pulseR = b.r + Math.sin(t * 0.002 + b.phase) * 0.04;
        const cx = b.x * w;
        const cy = b.y * h;
        const radius = pulseR * Math.min(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `hsla(${hue}, ${b.s}%, ${b.l}%, 0.18)`);
        grad.addColorStop(0.35, `hsla(${hue}, ${b.s}%, ${b.l}%, 0.08)`);
        grad.addColorStop(0.7, `hsla(${hue}, ${b.s + 5}%, ${b.l - 2}%, 0.03)`);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };

    // Initial fill
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, w, h);
    render();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ══════════════════════════════════════════════════════════════════
   FLOATING BUBBLES — Soft, translucent, slow-drifting particles
   ══════════════════════════════════════════════════════════════════ */
function FloatingBubbles() {
  const bubbles = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 14,
    x: Math.random() * 100,
    dur: 30 + Math.random() * 50,
    delay: Math.random() * -60,
    opacity: 0.03 + Math.random() * 0.06,
    drift: (Math.random() - 0.5) * 20,
  })), []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {bubbles.map(b => (
        <motion.div key={b.id}
          initial={{ y: '110vh', x: `${b.x}vw`, opacity: 0 }}
          animate={{ y: '-10vh', x: `${b.x + b.drift}vw`, opacity: [0, b.opacity, b.opacity, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: b.size, height: b.size, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)',
            boxShadow: '0 0 4px rgba(255,255,255,0.03)',
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   CURSOR GLOW — Soft ambient light following cursor
   ══════════════════════════════════════════════════════════════════ */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const h = e => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div style={{
      position: 'fixed', zIndex: 2, pointerEvents: 'none',
      width: 500, height: 500, borderRadius: '50%',
      left: pos.x - 250, top: pos.y - 250,
      background: 'radial-gradient(circle, rgba(255,255,255,0.018) 0%, transparent 55%)',
      transition: 'left 0.2s ease-out, top 0.2s ease-out',
    }} />
  );
}

/* ══════════════════════════════════════════════════════════════════
   CINEMATIC TEXT — Per-character staggered reveal
   ══════════════════════════════════════════════════════════════════ */
function CinematicText({ text, delay = 0, style = {} }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} style={{ display: 'inline-flex', overflow: 'hidden', ...style }}>
      {text.split('').map((ch, i) => (
        <motion.span key={i}
          initial={{ y: '120%', opacity: 0 }}
          animate={inView ? { y: '0%', opacity: 1 } : {}}
          transition={{ duration: 0.65, delay: delay + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block' }}
        >{ch === ' ' ? '\u00A0' : ch}</motion.span>
      ))}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TIER CARD — Clean, professional with beam border
   ══════════════════════════════════════════════════════════════════ */
function TierCard({ tier, index, onSelect }) {
  const [hover, setHover] = useState(false);
  const [mp, setMp] = useState({ x: 50, y: 50 });
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setMp({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 80, filter: 'blur(16px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 1, delay: 0.15 + index * 0.18, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setMp({ x: 50, y: 50 }); }}
      onMouseMove={onMove}
      onClick={() => onSelect(tier.key)}
      style={{ width: '100%', maxWidth: 600, margin: '0 auto', cursor: 'pointer' }}
    >
      <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ position: 'relative', borderRadius: 28, overflow: 'hidden' }}>
        {/* Beam border */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28, padding: 1.5, zIndex: 0,
          background: hover
            ? `conic-gradient(from ${(mp.x + mp.y) * 1.8}deg at ${mp.x}% ${mp.y}%, rgba(${tier.rgb},0.6) 0%, transparent 15%, rgba(${tier.rgb},0.3) 30%, transparent 45%, rgba(${tier.rgb},0.5) 60%, transparent 75%, rgba(${tier.rgb},0.25) 90%, transparent 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))`,
          transition: 'all 0.5s',
        }}><div style={{ width: '100%', height: '100%', borderRadius: 27, background: 'rgba(6,6,12,0.92)' }} /></div>

        {/* Spotlight */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28, zIndex: 1, pointerEvents: 'none',
          background: hover ? `radial-gradient(600px circle at ${mp.x}% ${mp.y}%, rgba(${tier.rgb},0.05), transparent 40%)` : 'none',
        }} />

        {/* Outer glow */}
        <div style={{
          position: 'absolute', inset: -40, zIndex: -1, pointerEvents: 'none',
          background: hover ? `radial-gradient(ellipse at ${mp.x}% ${mp.y}%, rgba(${tier.rgb},0.08) 0%, transparent 50%)` : 'none',
          filter: 'blur(60px)', transition: 'all 0.5s',
        }} />

        {/* Card body */}
        <div style={{ position: 'relative', zIndex: 2, padding: '48px 44px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <motion.div
                animate={hover ? { rotate: [0, -10, 10, 0], scale: 1.15 } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: tier.color, background: `rgba(${tier.rgb},0.08)`, border: `1px solid rgba(${tier.rgb},0.12)`,
                  boxShadow: hover ? `0 0 30px rgba(${tier.rgb},0.15)` : 'none', transition: 'box-shadow 0.3s',
                }}
              >{tier.icon}</motion.div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: tier.color, opacity: 0.8 }}>{tier.tag}</span>
            </div>
            <h3 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
              {tier.title}<span style={{ color: 'rgba(255,255,255,0.12)', fontWeight: 400 }}> — Tier</span>
            </h3>
            <p style={{ fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.28)', lineHeight: 1.75, maxWidth: 380, marginBottom: 28 }}>{tier.desc}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-[#0a0a0f] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold"
              style={{ background: tier.grad }}
            >
              Start Training <ArrowRight size={15} strokeWidth={2.5} />
            </motion.button>
          </div>
          <div style={{
            fontSize: 120, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.06em',
            color: 'transparent', WebkitTextStroke: `1.5px rgba(${tier.rgb},${hover ? 0.22 : 0.06})`,
            transition: 'all 0.5s', userSelect: 'none',
          }}>{String(index + 1).padStart(2, '0')}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN HUB
   ══════════════════════════════════════════════════════════════════ */
export default function NoodleHub() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [transition, setTransition] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showDD, setShowDD] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [editProfile, setEditProfile] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroP, [0, 1], [0, -120]);
  const heroOp = useTransform(heroP, [0, 0.5], [1, 0]);
  const heroSc = useTransform(heroP, [0, 0.5], [1, 0.93]);

  useEffect(() => {
    const loadProfile = () => {
      const su = localStorage.getItem('user'); let ud = null;
      if (su) { try { ud = JSON.parse(su); } catch {} }
      if (ud) { if (ud.avatar) setProfilePhoto(ud.avatar); const p = { ...DEFAULT_PROFILE, name: ud.name||'', weight: ud.weight||'', height: ud.height||'', age: ud.age||'', goal: ud.goal||'', joinedDate: ud.joinedDate||DEFAULT_PROFILE.joinedDate }; setProfile(p); setEditProfile(p); }
    };
    loadProfile();
    const hc = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDD(false); };
    document.addEventListener('mousedown', hc);
    window.addEventListener('noodle_profile_update', loadProfile);
    return () => { document.removeEventListener('mousedown', hc); window.removeEventListener('noodle_profile_update', loadProfile); };
  }, []);

  const saveProfile = p => { setProfile(p); setEditProfile(p); const su = localStorage.getItem('user'); let ud = {}; if (su) try { ud = JSON.parse(su); } catch {} localStorage.setItem('user', JSON.stringify({ ...ud, name: p.name, weight: p.weight, height: p.height, age: p.age, goal: p.goal, level: p.level })); };
  const handleProfileSave = async () => { saveProfile(editProfile); setIsEditing(false); try { const su = localStorage.getItem('user'); let ud = {}; if (su) try { ud = JSON.parse(su); } catch {} const r = await fetch('http://localhost:5000/api/user/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: editProfile.name||'', avatar: ud.avatar||'', height: Number(editProfile.height), weight: Number(editProfile.weight), age: Number(editProfile.age), goal: editProfile.goal||'' }) }); const d = await r.json(); if (r.ok && d.user) { localStorage.setItem('user', JSON.stringify(d.user)); if (d.user.avatar) setProfilePhoto(d.user.avatar); } } catch (e) { console.error(e); } };
  const handleAvatarSelect = async url => { setSelectedAvatar(url); setProfilePhoto(url); try { const r = await fetch('http://localhost:5000/api/user/avatar', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ avatar: url }) }); const d = await r.json(); if (r.ok) { const su = localStorage.getItem('user'); let ud = {}; if (su) try { ud = JSON.parse(su); } catch {} localStorage.setItem('user', JSON.stringify({ ...ud, avatar: url })); } } catch (e) { console.error(e); } };
  const handleSelectPath = k => { if (transition) return; setTransition({ label: PATH_CONFIG[k].label }); setTimeout(() => navigate(PATH_CONFIG[k].route), 900); };
  const daysSince = Math.max(1, Math.floor((Date.now() - new Date(profile.joinedDate).getTime()) / 86400000));

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: '#fff', background: '#05050a', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth} body{background:#05050a}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.03);border-radius:99px}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes breathe{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes lineGrow{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
        ::selection{background:rgba(167,139,250,0.2);color:#fff}
      `}</style>

      {/* ── Living background ── */}
      <OrganicCanvas />
      <FloatingBubbles />
      <CursorGlow />
      {/* Grain texture */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.02, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }} />

      {/* Scroll progress */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 1.5, zIndex: 200, background: 'linear-gradient(90deg,rgba(52,211,153,0.6),rgba(167,139,250,0.6),rgba(251,146,60,0.6))', transformOrigin: '0%', scaleX: smoothScroll }} />

      {/* ══ TRANSITION ══ */}
      <AnimatePresence>
        {transition && (
          <motion.div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,10,0.97)', backdropFilter: 'blur(60px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, type: 'spring', damping: 25 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'float 2s ease-in-out infinite' }}>
                <Zap size={24} color="rgba(255,255,255,0.45)" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>Entering {transition.label}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>Preparing your AI coach</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
                {[0,1,2].map(i => <motion.div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} animate={{ opacity: [0.2,0.9,0.2] }} transition={{ duration: 1.2, delay: i*0.2, repeat: Infinity }} />)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ PROFILE PANEL ══ */}
      <AnimatePresence>
        {showPanel && (
          <motion.div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowPanel(false); setIsEditing(false); }}>
            <motion.div style={{ position: 'relative', background: 'rgba(8,8,14,0.98)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, maxWidth: 700, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { setShowPanel(false); setIsEditing(false); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.25)' }}><X size={16} /></button>
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 18, padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 14 }}>
                    {profilePhoto ? <img src={profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}><User size={28} color="rgba(255,255,255,0.15)" /></div>}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{profile.name||'Unnamed'}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>{profile.level}</div>
                  <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                    {[{l:'Age',v:profile.age||'—'},{l:'Height',v:profile.height?`${profile.height}cm`:'—'},{l:'Weight',v:profile.weight?`${profile.weight}kg`:'—'}].map(s=>(
                      <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.025)', borderRadius: 10, padding: '10px 4px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{s.v}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, marginTop: 3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div><div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Profile</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 3 }}>Manage your info</div></div>
                    {!isEditing ? <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}><Edit3 size={11} /> Edit</button>
                    : <button onClick={handleProfileSave} style={{ padding: '8px 20px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#0a0a0f', background: '#fff', border: 'none', cursor: 'pointer' }}>Save</button>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[{l:'Name',k:'name',t:'text',p:'Your name'},{l:'Age',k:'age',t:'number',p:'e.g. 24'},{l:'Height (cm)',k:'height',t:'number',p:'e.g. 175'},{l:'Weight (kg)',k:'weight',t:'number',p:'e.g. 72'}].map(f=>(
                      <div key={f.k}><label style={{ display: 'block', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: 6 }}>{f.l}</label>
                        <input type={f.t} value={editProfile[f.k]} onChange={e=>setEditProfile({...editProfile,[f.k]:e.target.value})} placeholder={f.p} disabled={!isEditing}
                          style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', outline: 'none', fontFamily: "'Inter',sans-serif", opacity: isEditing?1:0.4 }} /></div>
                    ))}
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <label style={{ display: 'block', fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: 10 }}>Avatar</label>
                    {profilePhoto && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}><img src={profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></div></div>}
                    <button onClick={() => setShowAvatarModal(true)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(52,211,153,0.08))', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
                      onMouseEnter={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.15)'} onMouseLeave={e=>e.currentTarget.style.border='1px solid rgba(255,255,255,0.06)'}>
                      <Sparkles size={14} color="rgba(255,255,255,0.5)" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{profilePhoto ? 'Change Avatar' : 'Choose Avatar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Avatar Selection Modal */}
      <AvatarSelectModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={profilePhoto}
      />

      {/* ══ HEADER ══ */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60, padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.025)', background: 'rgba(5,5,10,0.4)', backdropFilter: 'blur(30px) saturate(1.3)', WebkitBackdropFilter: 'blur(30px) saturate(1.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={14} color="rgba(255,255,255,0.5)" /></div>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.7)' }}>NOODLE AI</span>
            <NoodleXButton variant="nav" />
          </div>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <motion.button onClick={() => setShowDD(!showDD)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {profilePhoto ? <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}><img src={profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></div> : <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={12} color="rgba(255,255,255,0.2)" /></div>}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{profile.name||'User'}</span>
              <motion.div animate={{ rotate: showDD?180:0 }}><ChevronDown size={12} color="rgba(255,255,255,0.15)" /></motion.div>
            </motion.button>
            <AnimatePresence>
              {showDD && (
                <motion.div initial={{ opacity:0,y:-6,scale:0.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:-6,scale:0.96 }} transition={{ type:'spring',damping:28,stiffness:380 }}
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 260, background: 'rgba(8,8,14,0.98)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden', backdropFilter: 'blur(40px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {profilePhoto ? <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}><img src={profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></div> : <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="rgba(255,255,255,0.2)" /></div>}
                    <div><div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{profile.name||'Unnamed'}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{profile.level}</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {[{l:'Days',v:daysSince,ic:<Calendar size={9}/>},{l:'Weight',v:profile.weight?`${profile.weight}kg`:'—',ic:<Target size={9}/>},{l:'Age',v:profile.age||'—',ic:<Award size={9}/>}].map(s=>(
                      <div key={s.l} style={{ textAlign: 'center', padding: '7px 2px', borderRadius: 8, background: 'rgba(255,255,255,0.012)', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <div style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 2 }}>{s.ic}</div><div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{s.v}</div><div style={{ fontSize: 7, color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '5px 6px' }}>
                    {[{ic:<Settings size={13}/>,l:'Edit Profile',fn:()=>{setShowDD(false);setShowAvatarModal(true)}},{ic:<Palette size={13}/>,l:'Avatar & Settings',fn:()=>{setShowDD(false);setShowAvatarModal(true)}}].map((it,i)=>(
                      <button key={i} onClick={it.fn} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 10px', borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.025)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <span style={{ color: 'rgba(255,255,255,0.15)' }}>{it.ic}</span><span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>{it.l}</span></button>
                    ))}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.025)', margin: '4px 0' }} />
                    <button onClick={async () => { await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' }); localStorage.removeItem('user'); setShowDD(false); navigate('/'); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 10px', borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(220,38,38,0.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <LogOut size={13} color="rgba(255,255,255,0.1)" /><span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.2)' }}>Sign Out</span></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════════════════════
         HERO
      ══════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', zIndex: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 64 }}>
        <motion.div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 900, margin: '0 auto', opacity: heroOp, y: heroY, scale: heroSc }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 100, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: 48, backdropFilter: 'blur(20px)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'breathe 2.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>AI Training Hub</span>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(48px, 9vw, 96px)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.95, marginBottom: 32 }}>
            <CinematicText text="Choose" delay={0.5} style={{ background: 'linear-gradient(135deg, #fff 30%, rgba(167,139,250,0.75) 70%)', backgroundSize: '200% auto', animation: 'shimmer 5s linear infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            <br />
            <CinematicText text="Your Path" delay={0.8} style={{ color: 'rgba(255,255,255,0.12)' }} />
          </h1>

          <motion.p initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.8, delay: 1.3 }}
            style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', fontWeight: 400, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
            Three coaching tiers. One AI that adapts to you.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.5 }}
            style={{ marginTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))', animation: 'lineGrow 1.5s ease-out forwards', transformOrigin: 'top' }} />
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown size={14} color="rgba(255,255,255,0.1)" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════
         TIER CARDS
      ══════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 3, paddingTop: 40, paddingBottom: 160 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 48 }}>
          {TIERS.map((t, i) => <TierCard key={t.key} tier={t} index={i} onSelect={handleSelectPath} />)}
        </div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: 80, fontSize: 13, color: 'rgba(255,255,255,0.05)' }}>
          Not sure which path? You can always switch. Your AI adapts to you.
        </motion.p>
      </section>

      <ProfileBar />
    </div>
  );
}