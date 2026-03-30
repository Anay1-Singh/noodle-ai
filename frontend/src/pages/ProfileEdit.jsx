import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Camera, Check, Crown, ScanFace, User,
  Calendar, Target, Award, Flame, Shield, Sparkles, Save, X, Wand2
} from 'lucide-react';
import { AVATAR_DECORATIONS, BAR_EFFECTS, BANNER_THEMES, AnimatedBanner, AvatarRing } from '../components/ProfileBar';
import NoodleXButton from '../components/NoodleXButton';

/* ──────────────────────────────────────────────
   AVATAR DATA — DiceBear adventurer
   25 Male + 25 Female
   ────────────────────────────────────────────── */
const M = ['James', 'Liam', 'Noah', 'Oliver', 'Ethan', 'Lucas', 'Mason', 'Logan', 'Alex', 'Jack',
  'Daniel', 'Henry', 'Owen', 'Samuel', 'Ben', 'Leo', 'Ryan', 'Nathan', 'Max', 'Jake',
  'Dylan', 'Eli', 'Caleb', 'Gavin', 'Oscar'];
const F = ['Sophia', 'Emma', 'Olivia', 'Ava', 'Mia', 'Isabella', 'Luna', 'Chloe', 'Aria', 'Ella',
  'Lily', 'Zoe', 'Nora', 'Riley', 'Grace', 'Layla', 'Ivy', 'Ruby', 'Maya', 'Stella',
  'Hazel', 'Violet', 'Aurora', 'Willow', 'Jade'];
const mkAv = (n, bg) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${n}&backgroundColor=${bg}`;
const MALE_AV = M.map(n => ({ url: mkAv(n, 'b6e3f4'), name: n }));
const FEMALE_AV = F.map(n => ({ url: mkAv(n, 'ffd5dc'), name: n }));

const BANNERS = [
  '#5865f2', '#57f287', '#fee75c', '#eb459e', '#ed4245',
  '#f47b67', '#45ddc0', '#3ba5b9', '#946bde', '#e0a740',
  '#1a1b1e', '#2d2f34', '#5c64f4', '#23272a', '#99aab5',
];

const GOALS = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Gain Strength', 'Improve Endurance', 'Flexibility'];

/* ──────────────────────────────────────────────
   SECTION WRAPPERS
   ────────────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    className={`rounded-xl border p-5 ${className}`}
    style={{
      background: 'rgba(255,255,255,0.02)',
      borderColor: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
    }}
  >
    {children}
  </motion.div>
);

const Label = ({ children }) => (
  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2"
    style={{ color: 'rgba(255,255,255,0.3)' }}>{children}</label>
);

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  fontSize: 13, color: '#fff', fontFamily: "'Inter',sans-serif",
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  outline: 'none', transition: 'border-color 0.2s',
};

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function ProfileEdit() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  // Form state
  const [avatar, setAvatar] = useState(null);
  const [pendAvatar, setPendAvatar] = useState(null);
  const [bannerColor, setBannerColor] = useState('#5865f2');
  const [pendBanner, setPendBanner] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [avatarDecoration, setAvatarDecoration] = useState('none');
  const [barEffect, setBarEffect] = useState('none');
  const [bannerTheme, setBannerTheme] = useState('none');
  const [goal, setGoal] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState('');

  // Avatar picker
  const [showAvatars, setShowAvatars] = useState(false);
  const [avTab, setAvTab] = useState('male');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      let u = {};
      try {
        const res = await fetch('http://localhost:5000/api/user/me', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          u = data.user;
          localStorage.setItem('user', JSON.stringify(u)); // cache it safely
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }

      // Fallback or process fetched data
      try {
        if (!u.name) u = JSON.parse(localStorage.getItem('user') || '{}');
      } catch { }

      setAvatar(u.avatar || null);
      setBannerColor(u.bannerColor || '#5865f2');
      setName(u.name || '');
      setBio(u.bio || '');
      setAge(u.age || '');
      setHeight(u.height || '');
      setWeight(u.weight || '');
      setGoal(u.goal || '');
      setJoinedDate(u.joinedDate || new Date().toISOString());
      setStreak(u.streak || 0);
      setLevel(u.level || 'Wellness Seeker');
      setAvatarDecoration(u.avatarDecoration || 'none');
      setBarEffect(u.barEffect || 'none');
      setBannerTheme(u.bannerTheme || 'none');
    };
    fetchProfile();
  }, []);

  const previewAv = pendAvatar || avatar;
  const previewBn = pendBanner || bannerColor;
  const daysSince = Math.max(1, Math.floor((Date.now() - new Date(joinedDate).getTime()) / 86400000));

  // Save
  const handleSave = async () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (pendAvatar) u.avatar = pendAvatar;
      if (pendBanner) u.bannerColor = pendBanner;
      u.name = name;
      u.bio = bio;
      u.age = age;
      u.height = height;
      u.weight = weight;
      u.goal = goal;
      u.avatarDecoration = avatarDecoration;
      u.barEffect = barEffect;
      u.bannerTheme = bannerTheme;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('noodle_profile_update'));

      // Sync to backend rigorously as source of truth
      await fetch('http://localhost:5000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          bio,
          avatar: pendAvatar || avatar || '',
          bannerColor: pendBanner || bannerColor || '#5865f2',
          avatarDecoration,
          barEffect,
          bannerTheme,
          height: Number(height),
          weight: Number(weight),
          age: Number(age),
          goal
        }),
      });
    } catch (e) { console.error("Save profile error:", e); }

    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  // Premium scan
  const doScan = () => {
    setScanning(true); setScanDone(false);
    setTimeout(() => setScanDone(true), 1600);
    setTimeout(() => {
      setScanning(false); setScanDone(false);
      setPendAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`);
      setShowAvatars(false);
    }, 2600);
  };

  const avs = avTab === 'male' ? MALE_AV : FEMALE_AV;

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "'Inter',sans-serif", color: '#fff', background: '#0a0a0f' }}>
      {/* Subtle grid pattern bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Ambient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${previewBn}12, transparent 70%)` }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(88,101,242,0.08), transparent 70%)' }} />

      {/* ═══ TOP BAR ═══ */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <motion.button onClick={() => navigate(-1)} whileHover={{ x: -2 }} whileTap={{ scale: 0.92 }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <h1 className="text-[15px] font-bold text-white">Edit Profile</h1>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Customize your presence across Noodle</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:underline"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Discard
          </button>
          <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-bold transition-all"
            style={{ background: '#5865f2', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(88,101,242,0.25)' }}>
            {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          {/* ═══ LEFT: LIVE PREVIEW ═══ */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Label>Preview</Label>
            <Card>
              {/* Mini banner with animated theme */}
              <div className="h-[60px] rounded-lg mb-[-20px] relative overflow-hidden" style={{ background: bannerTheme !== 'none' ? '#000' : previewBn }}>
                <AnimatedBanner theme={bannerTheme} bannerColor={previewBn} />
                {bannerTheme === 'none' && <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }} />}
              </div>
              {/* Avatar with decoration */}
              <div className="relative w-16 h-16 mx-auto mb-3">
                <AvatarRing decoration={avatarDecoration} size={60} />
                <div className="w-full h-full rounded-full overflow-hidden relative" style={{ border: `3px solid #0a0a0f`, zIndex: 2 }}>
                  {previewAv
                    ? <img src={previewAv} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: '#1e1f22' }}>
                      <User className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  }
                </div>
                <div className="absolute bottom-0 right-0 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: '#0a0a0f', zIndex: 3 }}>
                  <div className="w-[11px] h-[11px] rounded-full" style={{ background: '#23a559' }} />
                </div>
              </div>
              {/* Info */}
              <div className="text-center">
                <div className="text-[14px] font-bold text-white mb-0.5">{name || 'Unnamed'}</div>
                <div className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>{level}</div>
                {bio && <div className="text-[11px] px-3 py-2 rounded-lg mb-3" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>{bio}</div>}
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { l: 'Days', v: daysSince, ic: <Calendar className="w-3 h-3" /> },
                  { l: 'Streak', v: streak, ic: <Flame className="w-3 h-3" /> },
                  { l: 'Level', v: level?.split(' ')[0] || '—', ic: <Shield className="w-3 h-3" /> },
                ].map(s => (
                  <div key={s.l} className="text-center py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="mb-1" style={{ color: 'rgba(255,255,255,0.1)' }}>{s.ic}</div>
                    <div className="text-[13px] font-bold text-white">{s.v}</div>
                    <div className="text-[7px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.15)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ═══ RIGHT: EDIT SECTIONS ═══ */}
          <div className="flex flex-col gap-5">

            {/* ── AVATAR SECTION ── */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-white">Avatar</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Choose your identity across Noodle</p>
                </div>
                <motion.button onClick={() => setShowAvatars(!showAvatars)} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{ background: showAvatars ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  <Camera className="w-3 h-3" />
                  {showAvatars ? 'Close' : 'Change'}
                </motion.button>
              </div>

              {/* Current avatar display */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatars(true)}>
                  <div className="w-[72px] h-[72px] rounded-full overflow-hidden" style={{ border: `3px solid ${previewBn}30` }}>
                    {previewAv
                      ? <img src={previewAv} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center" style={{ background: '#1e1f22' }}>
                        <User className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.1)' }} />
                      </div>
                    }
                  </div>
                  <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {pendAvatar ? 'New avatar selected' : 'Current avatar'}
                  </div>
                  {/* AI Scan */}
                  <button onClick={doScan} disabled={scanning}
                    className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:brightness-110 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, rgba(88,101,242,0.15), rgba(235,69,158,0.1))', border: '1px solid rgba(88,101,242,0.2)', color: '#a78bfa', cursor: scanning ? 'default' : 'pointer' }}>
                    {scanning && !scanDone ? (
                      <><div className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid rgba(167,139,250,0.3)', borderTopColor: '#a78bfa' }} />Scanning…</>
                    ) : scanDone ? (
                      <><Check className="w-3 h-3" style={{ color: '#57f287' }} />Done!</>
                    ) : (
                      <><ScanFace className="w-3 h-3" />AI Face Scan <Crown className="w-3 h-3 ml-0.5" style={{ color: '#f0b232' }} /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Avatar Grid (expandable) */}
              <AnimatePresence>
                {showAvatars && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }} className="overflow-hidden">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3">
                      {[{ k: 'male', l: '♂ Male (25)' }, { k: 'female', l: '♀ Female (25)' }].map(t => (
                        <button key={t.k} onClick={() => setAvTab(t.k)}
                          className="flex-1 py-2 rounded-lg text-[11px] font-bold transition-all"
                          style={{
                            background: avTab === t.k ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            border: avTab === t.k ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                            color: avTab === t.k ? '#fff' : 'rgba(255,255,255,0.25)', cursor: 'pointer',
                          }}>{t.l}</button>
                      ))}
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
                      {avs.map(a => {
                        const sel = previewAv === a.url;
                        return (
                          <motion.button key={a.name} whileTap={{ scale: 0.92 }} onClick={() => setPendAvatar(a.url)}
                            className="relative aspect-square rounded-lg overflow-hidden transition-all"
                            style={{
                              outline: sel ? '2px solid #5865f2' : '1px solid rgba(255,255,255,0.05)',
                              outlineOffset: sel ? 2 : 0,
                              opacity: sel ? 1 : 0.6, cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                            }}
                            onMouseEnter={e => { if (!sel) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.outline = '1px solid rgba(255,255,255,0.15)'; } }}
                            onMouseLeave={e => { if (!sel) { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.outline = '1px solid rgba(255,255,255,0.05)'; } }}>
                            <img src={a.url} alt={a.name} className="w-full h-full object-cover rounded-lg" style={{ background: '#1e1f22' }} loading="lazy" />
                            {sel && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#5865f2' }}>
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* ── PERSONAL INFO ── */}
            <Card>
              <h3 className="text-[14px] font-bold text-white mb-1">Personal Info</h3>
              <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Your details are private and only used for AI coaching</p>

              <div className="space-y-4">
                <div>
                  <Label>Display Name</Label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#5865f2'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                </div>

                <div>
                  <Label>About Me</Label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={190}
                    placeholder="Tell people about yourself…"
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#5865f2'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                  <div className="text-right mt-1">
                    <span className="text-[11px] font-medium" style={{ color: bio.length > 170 ? '#ed4245' : 'rgba(255,255,255,0.2)' }}>
                      {bio.length}/190
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Age</Label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="24" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#5865f2'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#5865f2'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="72" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#5865f2'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
                  </div>
                </div>

                <div>
                  <Label>Fitness Goal</Label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(g => (
                      <button key={g} onClick={() => setGoal(g)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                        style={{
                          background: goal === g ? 'rgba(88,101,242,0.15)' : 'rgba(255,255,255,0.03)',
                          border: goal === g ? '1px solid rgba(88,101,242,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          color: goal === g ? '#818cf8' : 'rgba(255,255,255,0.35)',
                          cursor: 'pointer',
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── BANNER & THEME ── */}
            <Card>
              <h3 className="text-[14px] font-bold text-white mb-1">Banner & Theme</h3>
              <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Customize your profile banner color</p>

              {/* Banner preview */}
              <div className="h-[48px] rounded-lg mb-4 relative overflow-hidden" style={{ background: previewBn }}>
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }} />
              </div>

              {/* Color grid */}
              <div className="flex flex-wrap gap-2">
                {BANNERS.map(c => (
                  <button key={c} onClick={() => setPendBanner(c)}
                    className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: c,
                      outline: previewBn === c ? '2px solid rgba(255,255,255,0.6)' : 'none',
                      outlineOffset: 2,
                      cursor: 'pointer', border: 'none',
                    }}
                  />
                ))}
              </div>
            </Card>

            {/* ── EFFECTS & DECORATIONS ✦ ── */}
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="w-4 h-4" style={{ color: '#a78bfa' }} />
                <h3 className="text-[14px] font-bold text-white">Effects & Decorations</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'linear-gradient(135deg, #fbbf2420, #f9731620)', color: '#fbbf24', border: '1px solid #fbbf2430' }}>✦ PREMIUM</span>
              </div>
              <p className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Animated effects for your profile — like Discord Nitro!</p>
              <div className="mb-5"><NoodleXButton variant="inline" /></div>

              {/* ─── BANNER THEME ─── */}
              <Label>Banner Theme</Label>
              <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}>Animated background for your profile bar and banner</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {BANNER_THEMES.map(t => {
                  const sel = bannerTheme === t.id;
                  return (
                    <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setBannerTheme(t.id)}
                      className="relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
                      style={{
                        background: sel ? 'rgba(88,101,242,0.12)' : 'rgba(255,255,255,0.02)',
                        border: sel ? '1px solid rgba(88,101,242,0.35)' : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                      }}>
                      {/* Animated thumbnail */}
                      <div className="w-full h-6 rounded-md overflow-hidden relative" style={{
                        background: t.id === 'none' ? 'rgba(255,255,255,0.05)' :
                          t.id === 'aurora' ? 'linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #7b2ff7)' :
                            t.id === 'solar' ? 'linear-gradient(-45deg, #1a0000, #4a1500, #cc5500, #4a1500)' :
                              t.id === 'cyber' ? '#000a00' :
                                t.id === 'rosegold' ? 'linear-gradient(-45deg, #1a0a0f, #3d1f35, #4a2540)' :
                                  t.id === 'ocean' ? 'linear-gradient(-45deg, #000814, #001d3d, #003566)' :
                                    t.id === 'void' ? 'radial-gradient(ellipse, #0a0015, #000)' :
                                      t.id === 'starfield' ? '#050510' :
                                        'rgba(255,255,255,0.05)',
                      }}>
                        {t.id === 'cyber' && <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'linear-gradient(0deg, #00ff4120 1px, transparent 1px), linear-gradient(90deg, #00ff4120 1px, transparent 1px)', backgroundSize: '6px 6px' }} />}
                        {t.id === 'starfield' && [0, 1, 2, 3, 4].map(i => <div key={i} style={{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: '50%', background: '#fff', left: `${15 + i * 17}%`, top: `${20 + (i * 30) % 60}%`, opacity: 0.6 }} />)}
                        {t.id === 'none' && <X className="absolute inset-0 m-auto w-2.5 h-2.5" style={{ color: 'rgba(255,255,255,0.1)' }} />}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-semibold text-center leading-tight" style={{ color: sel ? '#818cf8' : 'rgba(255,255,255,0.35)' }}>{t.name}</span>
                        {t.premium && <span className="text-[7px]" style={{ color: '#fbbf24' }}>✦</span>}
                      </div>
                      {sel && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#5865f2' }}>
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* ─── AVATAR DECORATIONS ─── */}
              <Label>Avatar Decoration</Label>
              <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}>Animated ring with orbiting particles around your avatar</p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {AVATAR_DECORATIONS.map(d => {
                  const sel = avatarDecoration === d.id;
                  return (
                    <motion.button key={d.id} whileTap={{ scale: 0.95 }} onClick={() => setAvatarDecoration(d.id)}
                      className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                      style={{
                        background: sel ? 'rgba(88,101,242,0.12)' : 'rgba(255,255,255,0.02)',
                        border: sel ? '1px solid rgba(88,101,242,0.35)' : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                      }}>
                      <div className="relative w-8 h-8">
                        <div className="w-8 h-8 rounded-full" style={{
                          background: d.id === 'none' ? 'rgba(255,255,255,0.05)' :
                            d.id === 'rainbow' ? 'conic-gradient(#ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0088, #ff0000)' :
                              d.id === 'cosmic' ? 'conic-gradient(#8b5cf6, #06b6d4, #d946ef, #8b5cf6)' :
                                d.id === 'electric' ? 'radial-gradient(circle, #38bdf830, #38bdf8)' :
                                  d.id === 'golden' ? 'linear-gradient(135deg, #b8860b, #ffd700, #fff8dc, #ffd700)' :
                                    d.id === 'emerald' ? 'radial-gradient(circle, #22c55e30, #22c55e)' :
                                      d.id === 'sakura' ? 'radial-gradient(circle, #ff69b430, #ff69b4)' :
                                        'rgba(255,255,255,0.05)',
                          mask: d.id !== 'none' ? 'radial-gradient(farthest-side, transparent 60%, #000 60%)' : undefined,
                          WebkitMask: d.id !== 'none' ? 'radial-gradient(farthest-side, transparent 60%, #000 60%)' : undefined,
                        }} />
                        {d.id === 'none' && <X className="absolute inset-0 m-auto w-3 h-3" style={{ color: 'rgba(255,255,255,0.15)' }} />}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: sel ? '#818cf8' : 'rgba(255,255,255,0.35)' }}>{d.name}</span>
                        {d.premium && <span className="text-[7px]" style={{ color: '#fbbf24' }}>✦</span>}
                      </div>
                      {sel && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#5865f2' }}>
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* ─── BAR EFFECTS ─── */}
              <Label>Bar Effect</Label>
              <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}>Animated overlay on your profile bar</p>
              <div className="grid grid-cols-4 gap-2">
                {BAR_EFFECTS.map(e => {
                  const sel = barEffect === e.id;
                  return (
                    <motion.button key={e.id} whileTap={{ scale: 0.95 }} onClick={() => setBarEffect(e.id)}
                      className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                      style={{
                        background: sel ? 'rgba(88,101,242,0.12)' : 'rgba(255,255,255,0.02)',
                        border: sel ? '1px solid rgba(88,101,242,0.35)' : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                      }}>
                      <div className="w-full h-5 rounded-md overflow-hidden relative" style={{
                        background: e.id === 'none' ? 'rgba(255,255,255,0.05)' :
                          e.id === 'aurora' ? 'linear-gradient(135deg, #06b6d430, #8b5cf640, #d946ef30)' :
                            e.id === 'sparkle' ? 'rgba(255,255,255,0.05)' :
                              e.id === 'wave' ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' :
                                e.id === 'prismatic' ? 'linear-gradient(90deg, #ff000020, #ffff0020, #00ff0020, #0088ff20, #8800ff20)' :
                                  e.id === 'ember' ? 'linear-gradient(to top, #f9731620, transparent)' :
                                    e.id === 'neon' ? 'rgba(255,255,255,0.03)' :
                                      'rgba(255,255,255,0.05)',
                      }}>
                        {e.id === 'sparkle' && [0, 1, 2].map(i => (
                          <div key={i} className="absolute w-1 h-1 rounded-full bg-white/50" style={{ left: `${20 + i * 25}%`, top: `${30 + (i % 2) * 30}%` }} />
                        ))}
                        {e.id === 'ember' && [0, 1].map(i => (
                          <div key={i} className="absolute w-1 h-1 rounded-full" style={{ background: i % 2 ? '#fbbf24' : '#f97316', left: `${30 + i * 30}%`, bottom: '20%' }} />
                        ))}
                        {e.id === 'neon' && <div className="absolute inset-0 rounded-md" style={{ boxShadow: 'inset 0 0 6px #5865f250' }} />}
                        {e.id === 'none' && <X className="absolute inset-0 m-auto w-2.5 h-2.5" style={{ color: 'rgba(255,255,255,0.1)' }} />}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: sel ? '#818cf8' : 'rgba(255,255,255,0.35)' }}>{e.name}</span>
                        {e.premium && <span className="text-[7px]" style={{ color: '#fbbf24' }}>✦</span>}
                      </div>
                      {sel && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: '#5865f2' }}>
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </Card>

            {/* ── ACCOUNT INFO ── */}
            <Card>
              <h3 className="text-[14px] font-bold text-white mb-1">Account</h3>
              <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Your Noodle membership information</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: 'Member Since', v: new Date(joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), ic: <Calendar className="w-4 h-4" />, c: '#5865f2' },
                  { l: 'Current Streak', v: `${streak} days`, ic: <Flame className="w-4 h-4" />, c: '#f47b67' },
                  { l: 'Active Days', v: daysSince, ic: <Target className="w-4 h-4" />, c: '#57f287' },
                  { l: 'Profile Level', v: level, ic: <Award className="w-4 h-4" />, c: '#fee75c' },
                ].map(item => (
                  <div key={item.l} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.c}12`, color: item.c }}>
                      {item.ic}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>{item.l}</div>
                      <div className="text-[13px] font-bold text-white">{item.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bottom save */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
              <button onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-lg text-[12px] font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                Discard
              </button>
              <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[12px] font-bold"
                style={{ background: '#5865f2', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(88,101,242,0.25)' }}>
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-lg"
            style={{ background: '#23a559', boxShadow: '0 8px 30px rgba(35,165,89,0.3)' }}>
            <Check className="w-4 h-4 text-white" />
            <span className="text-[13px] font-bold text-white">Profile saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
