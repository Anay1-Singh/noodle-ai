import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Camera, Pencil, ScanFace } from 'lucide-react';
import { AnimatedBanner, AvatarRing } from './ProfileBar';

/* ──────────────────────────────────────────────────────────
   AVATAR DATA — DiceBear 'adventurer' (same style as before)
   25 Male + 25 Female
   ────────────────────────────────────────────────────────── */
const M = ['James','Liam','Noah','Oliver','Ethan','Lucas','Mason','Logan','Alex','Jack',
           'Daniel','Henry','Owen','Samuel','Ben','Leo','Ryan','Nathan','Max','Jake',
           'Dylan','Eli','Caleb','Gavin','Oscar'];
const F = ['Sophia','Emma','Olivia','Ava','Mia','Isabella','Luna','Chloe','Aria','Ella',
           'Lily','Zoe','Nora','Riley','Grace','Layla','Ivy','Ruby','Maya','Stella',
           'Hazel','Violet','Aurora','Willow','Jade'];
const mkAv = (n, bg) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${n}&backgroundColor=${bg}`;
const MALE_AV   = M.map(n => ({ url: mkAv(n, 'b6e3f4'), name: n }));
const FEMALE_AV = F.map(n => ({ url: mkAv(n, 'ffd5dc'), name: n }));

/* Banner presets */
const BANNERS = [
  '#5865f2','#57f287','#fee75c','#eb459e','#ed4245',
  '#f47b67','#45ddc0','#3ba5b9','#946bde','#e0a740',
  '#2b2d31','#1e1f22','#5c64f4','#23272a','#99aab5',
];

/* Styles (Discord colors) */
const C = {
  bg:     '#313338',
  card:   '#2b2d31',
  dark:   '#1e1f22',
  input:  '#1e1f22',
  border: '#3f4147',
  blue:   '#5865f2',
  blueHov:'#4752c4',
  green:  '#23a559',
  text:   '#dbdee1',
  muted:  '#949ba4',
  faint:  '#6d6f78',
  label:  '#b5bac1',
};

export default function AvatarSelectModal({ isOpen, onClose, onSelect, currentAvatar }) {
  const [tab, setTab]           = useState('male');
  const [pending, setPending]   = useState(null);
  const [banner, setBanner]     = useState(C.blue);
  const [pendBanner, setPendBanner] = useState(null);
  const [bio, setBio]           = useState('');
  const [pendBio, setPendBio]   = useState('');
  const [name, setName]         = useState('');
  const [pendName, setPendName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [view, setView]         = useState('profile');
  const [bannerTheme, setBannerTheme] = useState('none');
  const [avatarDecor, setAvatarDecor] = useState('none');

  useEffect(() => {
    if (!isOpen) return;
    setPending(null); setScanning(false); setScanDone(false); setView('profile');
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setBanner(u.bannerColor || C.blue); setPendBanner(null);
      setBio(u.bio || '');    setPendBio(u.bio || '');
      setName(u.name || '');  setPendName(u.name || '');
      setBannerTheme(u.bannerTheme || 'none');
      setAvatarDecor(u.avatarDecoration || 'none');
    } catch {}
  }, [isOpen]);

  const avs = tab === 'male' ? MALE_AV : FEMALE_AV;
  const prevAv = pending || currentAvatar;
  const prevBn = pendBanner || banner;
  const dirty  = !!(pending || pendBanner || pendBio !== bio || pendName !== name);

  const doScan = () => {
    setScanning(true); setScanDone(false);
    setTimeout(() => setScanDone(true), 1600);
    setTimeout(() => {
      setScanning(false); setScanDone(false);
      setPending(`https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`);
      setView('profile');
    }, 2600);
  };

  const doSave = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (pending) u.avatar = pending;
      if (pendBanner) u.bannerColor = pendBanner;
      u.bio = pendBio; u.name = pendName;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('noodle_profile_update'));
    } catch {}
    if (pending) onSelect(pending);
    onClose();
  };

  const doClose = () => { setScanning(false); setScanDone(false); setPending(null); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }} onClick={doClose}>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 400 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[480px] rounded-lg overflow-hidden flex flex-col"
            style={{ background: C.bg, boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)', maxHeight: '92vh' }}>

            {/* Close btn */}
            <button onClick={doClose}
              className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${C.faint} transparent` }}>
              <AnimatePresence mode="wait">
                {view === 'profile' ? (
                  <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>

                    {/* ═══ BANNER ═══ */}
                    <div className="relative h-[100px] group cursor-pointer" style={{ background: bannerTheme !== 'none' ? '#000' : prevBn }} onClick={() => {}}>
                      <AnimatedBanner theme={bannerTheme} bannerColor={prevBn} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.35)', zIndex: 5 }}>
                        <Pencil className="w-4 h-4 text-white mr-1.5" />
                        <span className="text-white text-xs font-semibold">Change Color</span>
                      </div>
                      {/* Color dots on banner */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 6 }}>
                        {BANNERS.map(c => (
                          <button key={c} onClick={e => { e.stopPropagation(); setPendBanner(c); }}
                            className="w-4 h-4 rounded-full transition-transform hover:scale-125"
                            style={{ background: c, border: prevBn === c ? '2px solid #fff' : '1px solid rgba(0,0,0,0.3)' }} />
                        ))}
                      </div>
                    </div>

                    {/* ═══ PROFILE AREA ═══ */}
                    <div className="relative px-4 pb-4" style={{ background: C.bg }}>
                      {/* Avatar overlapping banner */}
                      <div className="absolute -top-[40px] left-4 z-10">
                        <div className="relative group cursor-pointer" onClick={() => setView('avatars')}>
                          <div className="w-[80px] h-[80px] rounded-full p-[3px] relative" style={{ background: pending ? C.blue : C.bg }}>
                            <AvatarRing decoration={avatarDecor} size={74} />
                            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative" style={{ background: C.dark, zIndex: 2 }}>
                              {prevAv
                                ? <img src={prevAv} alt="" className="w-full h-full object-cover" />
                                : <span className="text-2xl font-black" style={{ color: 'rgba(255,255,255,0.08)' }}>?</span>
                              }
                            </div>
                          </div>
                          {/* Camera overlay */}
                          <div className="absolute inset-[3px] rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 3 }}>
                            <Camera className="w-4 h-4 text-white mb-0.5" />
                            <span className="text-[8px] text-white font-bold uppercase tracking-wider">Change</span>
                          </div>
                          {/* Status dot */}
                          <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.bg, zIndex: 3 }}>
                            <div className="w-3 h-3 rounded-full" style={{ background: pending ? C.blue : C.green }} />
                          </div>
                        </div>
                      </div>

                      {/* AI Scan badge */}
                      <div className="flex justify-end pt-2 pb-6">
                        <button onClick={doScan} disabled={scanning}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-all hover:brightness-110 active:scale-95"
                          style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}25` }}>
                          {scanning && !scanDone ? (
                            <div className="w-3 h-3 rounded-full animate-spin" style={{ border: `2px solid ${C.blue}40`, borderTopColor: C.blue }} />
                          ) : scanDone ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-3 h-3" style={{ color: '#57f287' }} /></motion.div>
                          ) : (
                            <ScanFace className="w-3 h-3" style={{ color: C.blue }} />
                          )}
                          <span className="text-[11px] font-semibold" style={{ color: C.blue }}>
                            {scanning && !scanDone ? 'Scanning…' : scanDone ? 'Done!' : 'AI Scan'}
                          </span>
                          <Crown className="w-3 h-3" style={{ color: '#f0b232' }} />
                        </button>
                      </div>

                      {/* Inner card */}
                      <div className="rounded-lg p-4" style={{ background: C.dark }}>
                        {/* Display Name */}
                        <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.label }}>Display Name</label>
                        <input type="text" value={pendName} onChange={e => setPendName(e.target.value)} placeholder="Your name"
                          className="w-full px-3 py-[9px] rounded text-sm font-medium outline-none mb-3 transition-all"
                          style={{ background: C.input, border: `1px solid ${C.border}`, color: '#fff' }}
                          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />

                        {/* Bio */}
                        <label className="block text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.label }}>About Me</label>
                        <textarea value={pendBio} onChange={e => setPendBio(e.target.value)} rows={2} maxLength={190}
                          placeholder="Tell us about yourself…"
                          className="w-full px-3 py-[9px] rounded text-[13px] font-normal outline-none resize-none mb-1 transition-all"
                          style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }}
                          onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                        <div className="text-right mb-3">
                          <span className="text-[11px] font-medium" style={{ color: pendBio.length > 170 ? '#ed4245' : C.muted }}>{pendBio.length}/190</span>
                        </div>

                        {/* Banner Color */}
                        <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: C.label }}>Banner Color</label>
                        <div className="flex flex-wrap gap-1.5">
                          {BANNERS.map(c => (
                            <button key={c} onClick={() => setPendBanner(c)}
                              className="w-[28px] h-[28px] rounded transition-all hover:scale-110"
                              style={{
                                background: c,
                                outline: prevBn === c ? '2px solid #fff' : 'none',
                                outlineOffset: 2,
                              }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ═══ AVATAR GRID VIEW ═══ */
                  <motion.div key="a" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.12 }}>
                    <div style={{ background: C.bg }}>
                      {/* Header */}
                      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                        <button onClick={() => setView('profile')}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Select Avatar</h3>
                          <p className="text-[11px]" style={{ color: C.muted }}>25 Male · 25 Female</p>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="px-4 flex" style={{ borderBottom: `1px solid ${C.border}50` }}>
                        {[{ k: 'male', l: 'Male' }, { k: 'female', l: 'Female' }].map(t => (
                          <button key={t.k} onClick={() => setTab(t.k)} className="relative px-3 pb-2 pt-1 mr-3">
                            <span className="text-[13px] font-medium transition-colors" style={{ color: tab === t.k ? '#fff' : C.muted }}>{t.l}</span>
                            {tab === t.k && (
                              <motion.div layoutId="avt" className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: '#fff' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Grid */}
                      <div className="p-3" style={{ maxHeight: 300, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${C.faint}40 transparent` }}>
                        <div className="grid grid-cols-5 gap-[6px]">
                          {avs.map(a => {
                            const sel = prevAv === a.url;
                            return (
                              <motion.button key={a.name} whileTap={{ scale: 0.93 }}
                                onClick={() => { setPending(a.url); setView('profile'); }}
                                className="relative aspect-square rounded-lg overflow-hidden transition-all"
                                style={{
                                  outline: sel ? `2px solid ${C.blue}` : '1px solid rgba(255,255,255,0.06)',
                                  outlineOffset: sel ? 2 : 0,
                                  opacity: sel ? 1 : 0.7,
                                }}
                                onMouseEnter={e => { if (!sel) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.outline = '1px solid rgba(255,255,255,0.2)'; } }}
                                onMouseLeave={e => { if (!sel) { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.outline = '1px solid rgba(255,255,255,0.06)'; } }}>
                                <img src={a.url} alt={a.name} className="w-full h-full object-cover" style={{ background: C.dark }} loading="lazy" />
                                {sel && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute top-[3px] right-[3px] w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{ background: C.blue }}>
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══ FOOTER ═══ */}
            <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ background: C.card }}>
              <span className="text-[12px] font-medium" style={{ color: dirty ? '#fee75c' : C.muted }}>
                {dirty ? '⚠ Careful — you have unsaved changes!' : 'Edit your profile'}
              </span>
              <div className="flex gap-2">
                <button onClick={doClose} className="px-3 py-[7px] rounded text-[13px] font-medium hover:underline transition-all" style={{ color: C.text }}>Cancel</button>
                <button onClick={doSave} disabled={!dirty}
                  className="px-5 py-[7px] rounded text-[13px] font-semibold transition-all"
                  style={{
                    background: dirty ? C.blue : `${C.blue}40`,
                    color: dirty ? '#fff' : 'rgba(255,255,255,0.3)',
                    cursor: dirty ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={e => { if (dirty) e.currentTarget.style.background = C.blueHov; }}
                  onMouseLeave={e => { if (dirty) e.currentTarget.style.background = C.blue; }}>
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
