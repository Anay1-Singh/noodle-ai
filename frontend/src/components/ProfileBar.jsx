import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Flame, User, GripHorizontal } from 'lucide-react';

/* eslint-disable react-refresh/only-export-components */

/* ══════════════════════════════════════════════════════════
   ANIMATED BANNER THEMES — Premium ✦
   Replace solid gradient with animated backgrounds
   ══════════════════════════════════════════════════════════ */
export const BANNER_THEMES = [
  { id: 'none',      name: 'None',            desc: 'Solid color',                premium: false },
  { id: 'aurora',    name: 'Midnight Aurora',  desc: 'Flowing blue/purple/teal',   premium: true },
  { id: 'solar',     name: 'Solar Flare',      desc: 'Pulsing orange/red/golden',  premium: true },
  { id: 'cyber',     name: 'Cyber Neon',       desc: 'Animated neon grid',         premium: true },
  { id: 'rosegold',  name: 'Rosé Gold',        desc: 'Shimmering pink/gold',       premium: true },
  { id: 'ocean',     name: 'Deep Ocean',       desc: 'Dark blue/teal waves',       premium: true },
  { id: 'void',      name: 'Void',             desc: 'Dark pulsing abyss',         premium: true },
  { id: 'starfield', name: 'Starfield',        desc: 'Twinkling stars',            premium: true },
  { id: 'lava',      name: 'Lava Flow',        desc: 'Molten magma river',         premium: true },
  { id: 'matrix',    name: 'Digital Rain',     desc: 'Green code cascade',         premium: true },
  { id: 'nebula',    name: 'Nebula',           desc: 'Cosmic dust clouds',         premium: true },
  { id: 'thunder',   name: 'Thunderstorm',     desc: 'Electric storm flashes',     premium: true },
  { id: 'blossom',   name: 'Sakura Bloom',     desc: 'Falling cherry petals',      premium: true },
  { id: 'crystal',   name: 'Crystal Cave',     desc: 'Sparkling gem refractions',  premium: true },
  { id: 'midnight',  name: 'Midnight City',    desc: 'City lights bokeh',          premium: true },
];

/* ══════════════════════════════════════════════════════════
   AVATAR DECORATIONS — Premium ✦
   Animated rings / borders around the avatar
   ══════════════════════════════════════════════════════════ */
export const AVATAR_DECORATIONS = [
  { id: 'none',       name: 'None',          desc: 'No decoration',             premium: false },
  { id: 'rainbow',    name: 'Rainbow Ring',  desc: 'Spinning prismatic ring',   premium: true },
  { id: 'cosmic',     name: 'Cosmic Pulse',  desc: 'Pulsing cosmic glow',       premium: true },
  { id: 'electric',   name: 'Electric Arc',  desc: 'Flickering electric',        premium: true },
  { id: 'golden',     name: 'Golden Aura',   desc: 'Shimmering gold ring',      premium: true },
  { id: 'emerald',    name: 'Emerald Flame', desc: 'Green fire ring',           premium: true },
  { id: 'sakura',     name: 'Sakura',        desc: 'Cherry blossom pink',       premium: true },
  { id: 'inferno',    name: 'Inferno',       desc: 'Blazing fire vortex',       premium: true },
  { id: 'frost',      name: 'Frost Crown',   desc: 'Icy crystalline halo',      premium: true },
  { id: 'bloodmoon',  name: 'Blood Moon',    desc: 'Dark crimson eclipse',      premium: true },
  { id: 'glitch',     name: 'Glitch',        desc: 'Digital distortion',        premium: true },
  { id: 'arcane',     name: 'Arcane Sigil',  desc: 'Mystic rune circle',        premium: true },
  { id: 'supernova',  name: 'Supernova',     desc: 'Exploding star burst',      premium: true },
  { id: 'shadowflame',name: 'Shadowflame',   desc: 'Dark purple fire aura',     premium: true },
];

/* ══════════════════════════════════════════════════════════
   BAR EFFECTS — Premium ✦
   Animated overlays on the profile bar
   ══════════════════════════════════════════════════════════ */
export const BAR_EFFECTS = [
  { id: 'none',      name: 'None',        desc: 'Solid gradient',        premium: false },
  { id: 'aurora',    name: 'Aurora',       desc: 'Northern lights',       premium: true },
  { id: 'sparkle',   name: 'Sparkle',     desc: 'Floating particles',    premium: true },
  { id: 'wave',      name: 'Wave',        desc: 'Ripple animation',      premium: true },
  { id: 'prismatic', name: 'Prismatic',   desc: 'Color-shifting',        premium: true },
  { id: 'ember',     name: 'Ember',       desc: 'Fire particles',        premium: true },
  { id: 'neon',      name: 'Neon Glow',   desc: 'Pulsing neon border',   premium: true },
  { id: 'confetti',  name: 'Confetti',    desc: 'Party sparkles',        premium: true },
  { id: 'plasma',    name: 'Plasma',      desc: 'Electric plasma arcs',  premium: true },
  { id: 'barglitch', name: 'Glitch',      desc: 'Digital distortion',    premium: true },
  { id: 'matrix',    name: 'Matrix Rain', desc: 'Green code rain',       premium: true },
  { id: 'barfrost',  name: 'Frost',       desc: 'Ice crystal shimmer',   premium: true },
  { id: 'barlava',   name: 'Lava',        desc: 'Molten flow effect',    premium: true },
  { id: 'rainbowwave', name: 'Rainbow Wave', desc: 'Prismatic sweep',    premium: true },
];

/* ══════════════════════════════════════════════════════════
   CSS KEYFRAMES
   ══════════════════════════════════════════════════════════ */
const seededRandom = (seed) => {
  const x = Math.sin(seed * 997.13) * 10000;
  return x - Math.floor(x);
};

const readProfileBarUser = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      name: u.name || 'User',
      bio: u.bio || '',
      bannerColor: u.bannerColor || '#5865f2',
      avatar: u.avatar || null,
      streak: u.streak || 0,
      avatarDecoration: u.avatarDecoration || 'none',
      barEffect: u.barEffect || 'none',
      bannerTheme: u.bannerTheme || 'none',
    };
  } catch {
    return {
      name: 'User',
      bio: '',
      bannerColor: '#5865f2',
      avatar: null,
      streak: 0,
      avatarDecoration: 'none',
      barEffect: 'none',
      bannerTheme: 'none',
    };
  }
};

const EFFECT_STYLES = `
/* Avatar decorations */
@keyframes noodle-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes noodle-pulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
@keyframes noodle-electric { 0% { opacity: 0.5; filter: blur(1px) brightness(1); } 25% { opacity: 1; filter: blur(0) brightness(1.3); } 50% { opacity: 0.3; filter: blur(2px) brightness(0.8); } 75% { opacity: 0.9; filter: blur(0.5px) brightness(1.1); } 100% { opacity: 0.5; filter: blur(1px) brightness(1); } }
@keyframes noodle-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes noodle-sakura-glow { 0%, 100% { box-shadow: 0 0 8px #ff69b460, 0 0 16px #ff69b430; } 50% { box-shadow: 0 0 14px #ff69b480, 0 0 28px #ff69b450, 0 0 4px #fff0f5; } }
@keyframes noodle-emerald { 0%, 100% { box-shadow: 0 0 8px #22c55e50, 0 0 16px #22c55e30; } 50% { box-shadow: 0 0 14px #22c55e70, 0 0 28px #22c55e40; } }
@keyframes noodle-orbit { 0% { transform: rotate(0deg) translateX(22px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(22px) rotate(-360deg); } }
@keyframes noodle-orbit-reverse { 0% { transform: rotate(0deg) translateX(20px) rotate(0deg); } 100% { transform: rotate(-360deg) translateX(20px) rotate(360deg); } }
@keyframes noodle-flicker { 0%, 100% { opacity: 0.3; } 20% { opacity: 1; } 40% { opacity: 0.5; } 60% { opacity: 0.9; } 80% { opacity: 0.2; } }
@keyframes noodle-inferno { 0%, 100% { box-shadow: 0 0 10px #ef4444, 0 0 20px #f97316a0, 0 0 35px #ef444440; } 50% { box-shadow: 0 0 15px #ef4444, 0 0 30px #f97316c0, 0 0 50px #ef444460, 0 0 70px #fbbf2430; } }
@keyframes noodle-frost-shimmer { 0% { background-position: -200% 0; filter: brightness(1); } 50% { filter: brightness(1.3); } 100% { background-position: 200% 0; filter: brightness(1); } }
@keyframes noodle-bloodmoon { 0%, 100% { box-shadow: 0 0 10px #dc262680, 0 0 25px #7f1d1d50; filter: brightness(1); } 50% { box-shadow: 0 0 18px #dc2626a0, 0 0 40px #7f1d1d70, 0 0 60px #45000040; filter: brightness(1.1); } }
@keyframes noodle-glitch-shift { 0% { transform: translate(0,0); } 20% { transform: translate(-2px,1px); } 40% { transform: translate(2px,-1px); } 60% { transform: translate(-1px,-2px); } 80% { transform: translate(1px,2px); } 100% { transform: translate(0,0); } }
@keyframes noodle-glitch-color { 0%, 100% { border-color: #22d3ee; } 25% { border-color: #f43f5e; } 50% { border-color: #a3e635; } 75% { border-color: #c084fc; } }
@keyframes noodle-arcane-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes noodle-arcane-pulse { 0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 3px #a78bfa); } 50% { opacity: 0.9; filter: drop-shadow(0 0 8px #a78bfa); } }
@keyframes noodle-supernova-burst { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 1; } }
@keyframes noodle-supernova-rays { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes noodle-shadowflame { 0%, 100% { box-shadow: 0 0 10px #7c3aed80, 0 0 20px #1e1b4b60; } 50% { box-shadow: 0 0 18px #7c3aeda0, 0 0 35px #1e1b4b80, 0 0 55px #7c3aed30; } }

/* Bar effects */
@keyframes noodle-aurora-bar { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes noodle-float { 0%, 100% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 0.8; } 100% { transform: translateY(-20px) scale(0.5); opacity: 0; } }
@keyframes noodle-wave-move { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes noodle-neon-pulse { 0%, 100% { box-shadow: 0 0 5px var(--neon-c), 0 0 10px var(--neon-c), 0 0 20px var(--neon-c); } 50% { box-shadow: 0 0 10px var(--neon-c), 0 0 25px var(--neon-c), 0 0 40px var(--neon-c); } }

/* Banner themes */
@keyframes noodle-banner-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes noodle-banner-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes noodle-star-twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes noodle-grid-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
@keyframes noodle-void-breathe { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 0.8; } }
@keyframes noodle-wave-drift { 0% { transform: translateX(-30%) rotate(-2deg); } 50% { transform: translateX(30%) rotate(2deg); } 100% { transform: translateX(-30%) rotate(-2deg); } }
`;

/* ══════════════════════════════════════════════════════════
   ANIMATED BANNER — Replaces solid gradient bg
   ══════════════════════════════════════════════════════════ */
export function AnimatedBanner({ theme, className = '', style = {} }) {
  if (!theme || theme === 'none') return null;

  const base = {
    position: 'absolute', inset: 0, borderRadius: 'inherit',
    pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
    ...style,
  };

  switch (theme) {
    case 'aurora':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0d324d, #7b2ff7, #1a1a2e, #16213e, #0f3460)`,
            backgroundSize: '400% 400%',
            animation: 'noodle-banner-flow 8s ease infinite',
          }} />
          {/* Aurora streaks */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, transparent 20%, #06b6d415 30%, transparent 40%, #8b5cf620 55%, transparent 65%, #d946ef15 80%, transparent 90%)',
            backgroundSize: '300% 300%',
            animation: 'noodle-banner-flow 5s ease infinite',
            animationDirection: 'reverse',
            mixBlendMode: 'screen',
          }} />
          {/* Subtle glow orbs */}
          <div style={{
            position: 'absolute', width: '60%', height: '120%', top: '-30%', left: '10%',
            borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed20, transparent 60%)',
            animation: 'noodle-void-breathe 6s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '50%', height: '100%', top: '-20%', right: '5%',
            borderRadius: '50%', background: 'radial-gradient(circle, #06b6d418, transparent 60%)',
            animation: 'noodle-void-breathe 7s ease-in-out 2s infinite',
          }} />
        </div>
      );

    case 'solar':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(-45deg, #1a0000, #4a1500, #6b2000, #8b3a00, #cc5500, #4a1500, #2a0a00, #1a0000)`,
            backgroundSize: '400% 400%',
            animation: 'noodle-banner-flow 6s ease infinite',
          }} />
          {/* Solar flare burst */}
          <div style={{
            position: 'absolute', width: '80%', height: '150%', top: '-50%', left: '30%',
            borderRadius: '50%', background: 'radial-gradient(circle, #f9731625, #fbbf2415, transparent 60%)',
            animation: 'noodle-void-breathe 4s ease-in-out infinite',
          }} />
          {/* Ember particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#f97316' : '#fbbf24',
              left: `${5 + (i * 12.5)}%`, bottom: '10%',
              animation: `noodle-float ${1.5 + (i % 4) * 0.4}s ease-out ${i * 0.25}s infinite`,
              opacity: 0, filter: 'blur(0.5px)',
            }} />
          ))}
        </div>
      );

    case 'cyber':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(-45deg, #000a00, #001a00, #002200, #001500, #000a00)`,
            backgroundSize: '400% 400%',
            animation: 'noodle-banner-flow 10s linear infinite',
          }} />
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: `
              linear-gradient(0deg, #00ff4120 1px, transparent 1px),
              linear-gradient(90deg, #00ff4120 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }} />
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
            animation: 'noodle-grid-scan 3s linear infinite',
            filter: 'blur(1px)', opacity: 0.6,
          }} />
          {/* Neon glow */}
          <div style={{
            position: 'absolute', width: '40%', height: '200%', top: '-50%', left: '30%',
            borderRadius: '50%', background: 'radial-gradient(circle, #00ff4110, transparent 60%)',
            animation: 'noodle-banner-pulse 3s ease-in-out infinite',
          }} />
        </div>
      );

    case 'rosegold':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(-45deg, #1a0a0f, #2a1520, #3d1f35, #4a2540, #3d1f35, #2a1520, #1a0a0f)`,
            backgroundSize: '400% 400%',
            animation: 'noodle-banner-flow 7s ease infinite',
          }} />
          {/* Rose shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, #f472b612, #fbbf2410, #f472b612, transparent)',
            backgroundSize: '200% 100%',
            animation: 'noodle-shimmer 3s linear infinite',
          }} />
          {/* Gold highlights */}
          <div style={{
            position: 'absolute', width: '50%', height: '130%', top: '-30%', right: '10%',
            borderRadius: '50%', background: 'radial-gradient(circle, #fbbf2410, transparent 60%)',
            animation: 'noodle-void-breathe 5s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '40%', height: '120%', top: '-20%', left: '5%',
            borderRadius: '50%', background: 'radial-gradient(circle, #f472b60c, transparent 60%)',
            animation: 'noodle-void-breathe 6s ease-in-out 1.5s infinite',
          }} />
        </div>
      );

    case 'ocean':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(-45deg, #000814, #001d3d, #003566, #001d3d, #000814)`,
            backgroundSize: '400% 400%',
            animation: 'noodle-banner-flow 9s ease infinite',
          }} />
          {/* Wave layers */}
          <div style={{
            position: 'absolute', bottom: 0, left: '-30%', right: '-30%', height: '60%',
            borderRadius: '40%', background: 'rgba(6, 182, 212, 0.07)',
            animation: 'noodle-wave-drift 7s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', left: '-20%', right: '-20%', height: '50%',
            borderRadius: '45%', background: 'rgba(34, 197, 94, 0.05)',
            animation: 'noodle-wave-drift 5s ease-in-out 1s infinite',
            animationDirection: 'reverse',
          }} />
          {/* Bubble particles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i % 2 === 0 ? 4 : 3, height: i % 2 === 0 ? 4 : 3,
              borderRadius: '50%',
              background: 'transparent', border: '1px solid rgba(6, 182, 212, 0.25)',
              left: `${10 + i * 18}%`, bottom: '5%',
              animation: `noodle-float ${2.5 + (i % 3) * 0.5}s ease-out ${i * 0.5}s infinite`,
              opacity: 0,
            }} />
          ))}
        </div>
      );

    case 'void':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 50%, #0a0015 0%, #000005 60%, #000000 100%)`,
          }} />
          {/* Pulsing void orbs */}
          <div style={{
            position: 'absolute', width: '60%', height: '200%', top: '-50%', left: '20%',
            borderRadius: '50%', background: 'radial-gradient(circle, #4c1d9515, transparent 50%)',
            animation: 'noodle-void-breathe 5s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '40%', height: '150%', top: '-40%', left: '50%',
            borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed10, transparent 50%)',
            animation: 'noodle-void-breathe 7s ease-in-out 2s infinite',
          }} />
          {/* Subtle lines */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 4px, #fff 4px, #fff 5px)`,
          }} />
        </div>
      );

    case 'starfield':
      return (
        <div className={className} style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, #000005, #050510, #000005)',
          }} />
          {/* Stars */}
          {Array.from({ length: 20 }).map((_, i) => {
            const size = 1 + seededRandom(i + 1) * 2;
            return (
              <div key={i} style={{
                position: 'absolute',
                width: size, height: size,
                borderRadius: '50%',
                background: i % 5 === 0 ? '#fef3c7' : i % 3 === 0 ? '#bfdbfe' : '#ffffff',
                left: `${(i * 37 + 13) % 95}%`,
                top: `${(i * 23 + 7) % 90}%`,
                animation: `noodle-star-twinkle ${1.5 + (i % 5) * 0.5}s ease-in-out ${(i * 0.3) % 2}s infinite`,
                boxShadow: i % 4 === 0 ? `0 0 3px ${i % 5 === 0 ? '#fef3c7' : '#fff'}` : 'none',
              }} />
            );
          })}
        </div>
      );

    case 'lava':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #1a0000, #3d0000, #5c1a00, #7a2e00, #5c1a00, #3d0000, #1a0000)', backgroundSize: '400% 400%', animation: 'noodle-banner-flow 5s ease infinite' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '-20%', right: '-20%', height: '50%', borderRadius: '40%', background: 'rgba(239,68,68,0.12)', animation: 'noodle-wave-drift 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-5%', left: '-10%', right: '-10%', height: '40%', borderRadius: '45%', background: 'rgba(249,115,22,0.08)', animation: 'noodle-wave-drift 3s ease-in-out 0.5s infinite', animationDirection: 'reverse' }} />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: i%2===0?3:2, height: i%2===0?3:2, borderRadius: '50%', background: i%3===0?'#ef4444':i%3===1?'#f97316':'#fbbf24', left: `${3+i*10}%`, bottom: '5%', animation: `noodle-float ${1+i%4*0.3}s ease-out ${i*0.2}s infinite`, opacity: 0 }} />
          ))}
        </div>
      );

    case 'matrix':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: '#000800' }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(0deg, #00ff4115 1px, transparent 1px), linear-gradient(90deg, #00ff4115 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 2, height: 8+i%5*4, background: `linear-gradient(to bottom, transparent, #00ff41${30+i%4*15})`, left: `${(i*7+3)%95}%`, top: '-10%', animation: `noodle-grid-scan ${1.5+i%5*0.5}s linear ${(i*0.3)%2}s infinite`, opacity: 0.6+i%3*0.15 }} />
          ))}
          <div style={{ position: 'absolute', width: '50%', height: '150%', top: '-30%', left: '25%', borderRadius: '50%', background: 'radial-gradient(circle, #00ff4108, transparent 60%)', animation: 'noodle-void-breathe 5s ease infinite' }} />
        </div>
      );

    case 'nebula':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0a001a, #150030, #1a0040, #100025, #0a001a)', backgroundSize: '400% 400%', animation: 'noodle-banner-flow 10s ease infinite' }} />
          <div style={{ position: 'absolute', width: '70%', height: '200%', top: '-50%', left: '10%', borderRadius: '50%', background: 'radial-gradient(ellipse, #8b5cf620, #d946ef10, transparent 60%)', animation: 'noodle-void-breathe 7s ease infinite' }} />
          <div style={{ position: 'absolute', width: '50%', height: '180%', top: '-40%', right: '5%', borderRadius: '50%', background: 'radial-gradient(ellipse, #06b6d415, #3b82f610, transparent 60%)', animation: 'noodle-void-breathe 9s ease 3s infinite' }} />
          {Array.from({ length: 12 }).map((_, i) => {
            const s = 1 + (i%3)*0.5;
            return (<div key={i} style={{ position: 'absolute', width: s, height: s, borderRadius: '50%', background: i%4===0?'#c084fc':i%4===1?'#818cf8':i%4===2?'#22d3ee':'#f0abfc', left: `${(i*29+5)%92}%`, top: `${(i*31+11)%85}%`, animation: `noodle-star-twinkle ${2+i%4*0.5}s ease ${i*0.4%3}s infinite` }} />);
          })}
        </div>
      );

    case 'thunder':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0c0c1d, #1a1a3e, #0d0d2b, #15153a, #0c0c1d)', backgroundSize: '400% 400%', animation: 'noodle-banner-flow 6s ease infinite' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(56,189,248,0.04) 50%, transparent 60%)', animation: 'noodle-banner-pulse 2s ease infinite' }} />
          {[0,1,2].map(i => (
            <div key={i} style={{ position: 'absolute', width: 1, height: '70%', top: '15%', left: `${20+i*30}%`, background: `linear-gradient(to bottom, transparent, #38bdf8${40+i*20}, transparent)`, animation: `noodle-flicker ${0.5+i*0.3}s ease ${i*0.8}s infinite`, filter: `blur(${1+i}px)` }} />
          ))}
          <div style={{ position: 'absolute', bottom: 0, left: '-20%', right: '-20%', height: '35%', borderRadius: '40%', background: 'rgba(100,116,139,0.1)', animation: 'noodle-wave-drift 6s ease infinite' }} />
        </div>
      );

    case 'blossom':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #1a0a10, #2a1520, #1f0f18, #2a1520, #1a0a10)', backgroundSize: '400% 400%', animation: 'noodle-banner-flow 8s ease infinite' }} />
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 4+i%3*2, height: 4+i%3*2, borderRadius: i%2===0?'50%':'30% 70% 70% 30%', background: i%3===0?'#f472b618':i%3===1?'#fda4af15':'#fecdd312', left: `${(i*23+5)%90}%`, top: `-5%`, animation: `noodle-float ${2.5+i%4*0.5}s ease-in-out ${i*0.4}s infinite`, animationDirection: 'reverse', transform: `rotate(${i*30}deg)`, opacity: 0 }} />
          ))}
          <div style={{ position: 'absolute', width: '60%', height: '150%', top: '-30%', left: '20%', borderRadius: '50%', background: 'radial-gradient(circle, #f472b60a, transparent 60%)', animation: 'noodle-void-breathe 6s ease infinite' }} />
        </div>
      );

    case 'crystal':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(-45deg, #0a0a1a, #141430, #0d0d25, #181840, #0a0a1a)', backgroundSize: '400% 400%', animation: 'noodle-banner-flow 7s ease infinite' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(60deg, transparent 30%, #818cf810 40%, transparent 45%, #22d3ee08 55%, transparent 60%)', backgroundSize: '200% 200%', animation: 'noodle-shimmer 4s linear infinite' }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 2+i%3, height: 2+i%3, background: i%3===0?'#c4b5fd':i%3===1?'#67e8f9':'#fff', left: `${(i*31+7)%90}%`, top: `${(i*23+15)%80}%`, animation: `noodle-star-twinkle ${1.5+i%3*0.8}s ease ${i*0.5%2.5}s infinite`, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', transform: `scale(${0.6+i%3*0.3})` }} />
          ))}
        </div>
      );

    case 'midnight':
      return (
        <div className={className} style={base}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #060612, #0f0f25, #0a0a18)' }} />
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 3+i%4*2, height: 3+i%4*2, borderRadius: '50%', background: i%4===0?'#fbbf2415':i%4===1?'#f472b612':i%4===2?'#60a5fa10':'#34d39910', left: `${(i*19+5)%88}%`, top: `${(i*29+10)%75}%`, filter: `blur(${2+i%3*2}px)`, animation: `noodle-star-twinkle ${2+i%3}s ease ${i*0.4%3}s infinite` }} />
          ))}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, rgba(15,15,37,0.9), transparent)' }} />
        </div>
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   ENHANCED AVATAR DECORATION RENDERER
   Multi-layer effects with particle trails
   ══════════════════════════════════════════════════════════ */
export function AvatarRing({ decoration, size = 36 }) {
  const pad = 6;
  const outer = size + pad * 2;
  if (!decoration || decoration === 'none') return null;

  const base = {
    position: 'absolute', inset: -pad,
    width: outer, height: outer,
    borderRadius: '50%',
    pointerEvents: 'none', zIndex: 1,
  };

  switch (decoration) {
    case 'rainbow':
      return (
        <div style={{ ...base }}>
          {/* Main spinning ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0088, #ff0000)',
            animation: 'noodle-spin 3s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Outer glow */}
          <div style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            background: 'conic-gradient(#ff000030, #ff880030, #ffff0030, #00ff0030, #0088ff30, #8800ff30, #ff008830, #ff000030)',
            animation: 'noodle-spin 3s linear infinite',
            filter: 'blur(4px)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px) calc(100% - 2px), transparent calc(100% - 2px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px) calc(100% - 2px), transparent calc(100% - 2px))',
          }} />
          {/* Orbiting particles */}
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 3, height: 3, marginLeft: -1.5, marginTop: -1.5,
              borderRadius: '50%',
              background: ['#ff0088', '#00ff88', '#8800ff'][i],
              animation: `noodle-orbit ${2 + i * 0.5}s linear ${i * 0.7}s infinite`,
              boxShadow: `0 0 4px ${['#ff0088', '#00ff88', '#8800ff'][i]}`,
            }} />
          ))}
        </div>
      );

    case 'cosmic':
      return (
        <div style={{ ...base }}>
          {/* Inner ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#8b5cf6, #06b6d4, #8b5cf6, #d946ef, #8b5cf6)',
            animation: 'noodle-spin 4s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Pulsing cosmic glow */}
          <div style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            background: 'radial-gradient(circle, #8b5cf620, transparent 60%)',
            animation: 'noodle-pulse 2.5s ease-in-out infinite',
          }} />
          {/* Orbiting cosmic particles */}
          {[0, 1].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 2.5, height: 2.5, marginLeft: -1.25, marginTop: -1.25,
              borderRadius: '50%',
              background: i === 0 ? '#06b6d4' : '#d946ef',
              animation: `${i === 0 ? 'noodle-orbit' : 'noodle-orbit-reverse'} ${3 + i}s linear ${i * 0.5}s infinite`,
              boxShadow: `0 0 5px ${i === 0 ? '#06b6d4' : '#d946ef'}`,
            }} />
          ))}
        </div>
      );

    case 'electric':
      return (
        <div style={{ ...base }}>
          {/* Main electric ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid #38bdf8',
            boxShadow: '0 0 8px #38bdf8, 0 0 16px #38bdf850, inset 0 0 8px #38bdf830',
            animation: 'noodle-electric 1.5s ease-in-out infinite',
          }} />
          {/* Spark nodes */}
          {[0, 1, 2, 3].map(i => {
            const angle = i * 90;
            const rad = angle * Math.PI / 180;
            const r = outer / 2;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `calc(50% + ${Math.cos(rad) * r}px - 2px)`,
                top: `calc(50% + ${Math.sin(rad) * r}px - 2px)`,
                width: 4, height: 4, borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 6px #38bdf8, 0 0 12px #38bdf850',
                animation: `noodle-flicker ${0.8 + i * 0.2}s ease-in-out ${i * 0.15}s infinite`,
              }} />
            );
          })}
        </div>
      );

    case 'golden':
      return (
        <div style={{ ...base }}>
          {/* Golden shimmer ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(90deg, #92400e, #b8860b, #ffd700, #fff8dc, #ffd700, #b8860b, #92400e)',
            backgroundSize: '200% 100%',
            animation: 'noodle-shimmer 2.5s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Outer glow */}
          <div style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            background: 'radial-gradient(circle, #ffd70020, transparent 60%)',
            animation: 'noodle-pulse 3s ease-in-out infinite',
          }} />
          {/* Floating gold sparkle */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 3, height: 3, marginLeft: -1.5, marginTop: -1.5,
            borderRadius: '50%', background: '#ffd700',
            animation: 'noodle-orbit 4s linear infinite',
            boxShadow: '0 0 4px #ffd700',
          }} />
        </div>
      );

    case 'emerald':
      return (
        <div style={{ ...base }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid #22c55e',
            animation: 'noodle-emerald 2s ease-in-out infinite',
          }} />
          {/* Flame-like outer glow */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'radial-gradient(circle, #22c55e15, transparent 60%)',
            animation: 'noodle-pulse 2s ease-in-out infinite',
          }} />
          {/* Green fire particles */}
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', left: `${25 + i * 25}%`, bottom: -2,
              width: 3, height: 3, borderRadius: '50%',
              background: i === 1 ? '#4ade80' : '#22c55e',
              animation: `noodle-float ${1.2 + i * 0.3}s ease-out ${i * 0.3}s infinite`,
              opacity: 0, filter: 'blur(0.5px)',
            }} />
          ))}
        </div>
      );

    case 'sakura':
      return (
        <div style={{ ...base }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid #f472b6',
            animation: 'noodle-sakura-glow 2s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'radial-gradient(circle, #f472b612, transparent 60%)',
            animation: 'noodle-pulse 2.5s ease-in-out infinite',
          }} />
          {[0, 1].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 3, height: 3, marginLeft: -1.5, marginTop: -1.5,
              borderRadius: '50%', background: i === 0 ? '#f472b6' : '#fda4af',
              animation: `${i === 0 ? 'noodle-orbit' : 'noodle-orbit-reverse'} ${3.5 + i}s linear ${i * 0.8}s infinite`,
              boxShadow: `0 0 3px ${i === 0 ? '#f472b6' : '#fda4af'}`,
            }} />
          ))}
        </div>
      );

    /* ═══════ NEW PREMIUM DECORATIONS ═══════ */

    case 'inferno':
      return (
        <div style={{ ...base }}>
          {/* Main fire ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#ef4444, #f97316, #fbbf24, #f97316, #ef4444, #dc2626, #ef4444)',
            animation: 'noodle-spin 2s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Outer heat glow */}
          <div style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            animation: 'noodle-inferno 1.5s ease-in-out infinite',
          }} />
          {/* Rising flame particles */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              position: 'absolute',
              left: `${15 + i * 18}%`, bottom: -2,
              width: i % 2 === 0 ? 4 : 3, height: i % 2 === 0 ? 4 : 3,
              borderRadius: '50%',
              background: ['#ef4444', '#f97316', '#fbbf24', '#ef4444', '#f97316'][i],
              animation: `noodle-float ${0.8 + i * 0.25}s ease-out ${i * 0.15}s infinite`,
              opacity: 0, filter: 'blur(0.5px)',
              boxShadow: `0 0 4px ${['#ef4444', '#f97316', '#fbbf24', '#ef4444', '#f97316'][i]}`,
            }} />
          ))}
          {/* Counter-rotating inner embers */}
          {[0, 1, 2].map(i => (
            <div key={`e${i}`} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 2.5, height: 2.5, marginLeft: -1.25, marginTop: -1.25,
              borderRadius: '50%', background: '#fbbf24',
              animation: `noodle-orbit-reverse ${1.5 + i * 0.6}s linear ${i * 0.3}s infinite`,
              boxShadow: '0 0 5px #fbbf24',
            }} />
          ))}
        </div>
      );

    case 'frost':
      return (
        <div style={{ ...base }}>
          {/* Icy shimmer ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(90deg, #164e63, #22d3ee, #a5f3fc, #ecfeff, #a5f3fc, #22d3ee, #164e63)',
            backgroundSize: '200% 100%',
            animation: 'noodle-frost-shimmer 3s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Frost crystalline outer glow */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'radial-gradient(circle, #22d3ee18, transparent 60%)',
            animation: 'noodle-pulse 3s ease-in-out infinite',
          }} />
          {/* Orbiting ice shards */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 3, height: 6, marginLeft: -1.5, marginTop: -3,
              borderRadius: '1px',
              background: i % 2 === 0 ? '#a5f3fc' : '#67e8f9',
              animation: `noodle-orbit ${3 + i * 0.8}s linear ${i * 0.5}s infinite`,
              boxShadow: `0 0 4px ${i % 2 === 0 ? '#a5f3fc' : '#67e8f9'}`,
              transform: `rotate(${i * 45}deg)`,
            }} />
          ))}
          {/* Snowflake particles */}
          {[0, 1, 2].map(i => (
            <div key={`s${i}`} style={{
              position: 'absolute',
              left: `${20 + i * 30}%`, top: -2,
              width: 2, height: 2, borderRadius: '50%', background: '#ecfeff',
              animation: `noodle-float ${1.5 + i * 0.4}s ease-out ${i * 0.4}s infinite`,
              opacity: 0, animationDirection: 'reverse',
            }} />
          ))}
        </div>
      );

    case 'bloodmoon':
      return (
        <div style={{ ...base }}>
          {/* Dark crimson spinning ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#7f1d1d, #dc2626, #991b1b, #450a0a, #7f1d1d, #dc2626, #7f1d1d)',
            animation: 'noodle-spin 5s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Blood moon glow */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            animation: 'noodle-bloodmoon 3s ease-in-out infinite',
          }} />
          {/* Eclipse corona particles */}
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 3, height: 3, marginLeft: -1.5, marginTop: -1.5,
              borderRadius: '50%', background: '#dc2626',
              animation: `noodle-orbit ${4 + i}s linear ${i * 1.2}s infinite`,
              boxShadow: '0 0 6px #dc2626, 0 0 12px #7f1d1d',
            }} />
          ))}
          {/* Inner dark haze */}
          <div style={{
            position: 'absolute', inset: 2, borderRadius: '50%',
            background: 'radial-gradient(circle, #45000030, transparent 70%)',
            animation: 'noodle-pulse 4s ease-in-out infinite',
          }} />
        </div>
      );

    case 'glitch':
      return (
        <div style={{ ...base }}>
          {/* Main glitchy border */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid #22d3ee',
            animation: 'noodle-glitch-color 0.8s steps(4) infinite, noodle-glitch-shift 0.3s steps(3) infinite',
          }} />
          {/* RGB split layers */}
          <div style={{
            position: 'absolute', inset: -1, borderRadius: '50%',
            border: '1px solid #f43f5e40',
            animation: 'noodle-glitch-shift 0.4s steps(5) 0.1s infinite',
            filter: 'blur(0.5px)',
          }} />
          <div style={{
            position: 'absolute', inset: -2, borderRadius: '50%',
            border: '1px solid #a3e63530',
            animation: 'noodle-glitch-shift 0.35s steps(4) 0.2s infinite',
            filter: 'blur(1px)',
          }} />
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: -pad, right: -pad, height: 2,
            background: 'linear-gradient(90deg, transparent, #22d3ee80, transparent)',
            animation: 'noodle-grid-scan 1.5s linear infinite',
            filter: 'blur(0.5px)',
          }} />
          {/* Data particles */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute',
              width: 2, height: 2, borderRadius: '1px',
              background: ['#22d3ee', '#f43f5e', '#a3e635', '#c084fc'][i],
              left: `${10 + i * 25}%`, bottom: 0,
              animation: `noodle-float ${0.6 + i * 0.15}s linear ${i * 0.1}s infinite`,
              opacity: 0,
            }} />
          ))}
        </div>
      );

    case 'arcane':
      return (
        <div style={{ ...base }}>
          {/* Outer mystic ring — slow spin */}
          <div style={{
            position: 'absolute', inset: -2, borderRadius: '50%',
            border: '1px solid #a78bfa40',
            animation: 'noodle-arcane-spin 8s linear infinite',
          }}>
            {/* Rune marks on the outer ring */}
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <div key={deg} style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 4, height: 4, marginLeft: -2, marginTop: -2,
                borderRadius: '1px',
                background: '#a78bfa',
                transform: `rotate(${deg}deg) translateY(-${(outer / 2) + 1}px)`,
                boxShadow: '0 0 3px #a78bfa',
                animation: 'noodle-arcane-pulse 2s ease-in-out infinite',
                animationDelay: `${deg / 360}s`,
              }} />
            ))}
          </div>
          {/* Inner ring — reverse spin */}
          <div style={{
            position: 'absolute', inset: 1, borderRadius: '50%',
            border: '1.5px dashed #a78bfa30',
            animation: 'noodle-arcane-spin 6s linear infinite',
            animationDirection: 'reverse',
          }} />
          {/* Central glow */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: 'radial-gradient(circle, #a78bfa15, transparent 60%)',
            animation: 'noodle-pulse 3s ease-in-out infinite',
          }} />
          {/* Orbiting sigil particles */}
          {[0, 1].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 3, height: 3, marginLeft: -1.5, marginTop: -1.5,
              borderRadius: '50%', background: i === 0 ? '#c4b5fd' : '#a78bfa',
              animation: `${i === 0 ? 'noodle-orbit' : 'noodle-orbit-reverse'} ${4 + i * 2}s linear ${i}s infinite`,
              boxShadow: `0 0 5px ${i === 0 ? '#c4b5fd' : '#a78bfa'}`,
            }} />
          ))}
        </div>
      );

    case 'supernova':
      return (
        <div style={{ ...base }}>
          {/* Pulsing core ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#fbbf24, #f59e0b, #fff, #f59e0b, #ef4444, #fbbf24)',
            animation: 'noodle-spin 2.5s linear infinite, noodle-supernova-burst 3s ease-in-out infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Light ray burst */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            background: `conic-gradient(
              transparent 0deg, #fbbf2415 5deg, transparent 10deg,
              transparent 30deg, #fbbf2410 35deg, transparent 40deg,
              transparent 60deg, #fbbf2412 65deg, transparent 70deg,
              transparent 90deg, #fbbf2408 95deg, transparent 100deg,
              transparent 120deg, #fbbf2415 125deg, transparent 130deg,
              transparent 150deg, #fbbf2410 155deg, transparent 160deg,
              transparent 180deg, #fbbf2412 185deg, transparent 190deg,
              transparent 210deg, #fbbf2408 215deg, transparent 220deg,
              transparent 240deg, #fbbf2415 245deg, transparent 250deg,
              transparent 270deg, #fbbf2410 275deg, transparent 280deg,
              transparent 300deg, #fbbf2412 305deg, transparent 310deg,
              transparent 330deg, #fbbf2408 335deg, transparent 340deg,
              transparent 360deg
            )`,
            animation: 'noodle-supernova-rays 6s linear infinite',
            filter: 'blur(2px)',
          }} />
          {/* Outer explosive glow */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: 'radial-gradient(circle, #fbbf2425, #f59e0b15, transparent 65%)',
            animation: 'noodle-supernova-burst 3s ease-in-out infinite',
          }} />
          {/* Debris particles */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 2, height: 2, marginLeft: -1, marginTop: -1,
              borderRadius: '50%', background: ['#fbbf24', '#fff', '#f59e0b', '#fbbf24'][i],
              animation: `noodle-orbit ${2 + i * 0.7}s linear ${i * 0.4}s infinite`,
              boxShadow: '0 0 4px #fbbf24',
            }} />
          ))}
        </div>
      );

    case 'shadowflame':
      return (
        <div style={{ ...base }}>
          {/* Dark purple fire ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#1e1b4b, #4c1d95, #7c3aed, #6d28d9, #4c1d95, #1e1b4b, #2e1065, #7c3aed, #1e1b4b)',
            animation: 'noodle-spin 3s linear infinite',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          }} />
          {/* Shadow aura */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            animation: 'noodle-shadowflame 2s ease-in-out infinite',
          }} />
          {/* Dark flame particles rising */}
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              position: 'absolute',
              left: `${10 + i * 20}%`, bottom: -2,
              width: 3, height: 3, borderRadius: '50%',
              background: ['#7c3aed', '#a78bfa', '#6d28d9', '#c084fc', '#7c3aed'][i],
              animation: `noodle-float ${1 + i * 0.2}s ease-out ${i * 0.2}s infinite`,
              opacity: 0, filter: 'blur(0.5px)',
              boxShadow: `0 0 5px ${['#7c3aed', '#a78bfa', '#6d28d9', '#c084fc', '#7c3aed'][i]}`,
            }} />
          ))}
          {/* Counter-rotating shadow orbs */}
          {[0, 1].map(i => (
            <div key={`o${i}`} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 3, height: 3, marginLeft: -1.5, marginTop: -1.5,
              borderRadius: '50%', background: i === 0 ? '#a78bfa' : '#6d28d9',
              animation: `${i === 0 ? 'noodle-orbit' : 'noodle-orbit-reverse'} ${2.5 + i}s linear ${i * 0.5}s infinite`,
              boxShadow: `0 0 6px ${i === 0 ? '#a78bfa' : '#6d28d9'}`,
            }} />
          ))}
        </div>
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   BAR EFFECT OVERLAY RENDERER
   ══════════════════════════════════════════════════════════ */
function BarEffectOverlay({ effect, bannerColor }) {
  if (!effect || effect === 'none') return null;

  const base = {
    position: 'absolute', inset: 0, borderRadius: 'inherit',
    pointerEvents: 'none', overflow: 'hidden', zIndex: 1,
  };

  switch (effect) {
    case 'aurora':
      return (
        <div style={{
          ...base,
          background: `linear-gradient(135deg, ${bannerColor}00, #06b6d430, #8b5cf630, #d946ef30, ${bannerColor}00)`,
          backgroundSize: '300% 300%',
          animation: 'noodle-aurora-bar 6s ease-in-out infinite',
          mixBlendMode: 'screen',
        }} />
      );
    case 'sparkle':
      return (
        <div style={base}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 3, height: 3, borderRadius: '50%', background: '#fff',
              left: `${12 + (i * 11) % 80}%`, bottom: `${10 + (i * 17) % 60}%`,
              animation: `noodle-float ${1.5 + (i % 3) * 0.5}s ease-in-out ${i * 0.3}s infinite`,
              opacity: 0,
            }} />
          ))}
        </div>
      );
    case 'wave':
      return (
        <div style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            animation: 'noodle-wave-move 3s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            animation: 'noodle-wave-move 3s ease-in-out 1.5s infinite',
          }} />
        </div>
      );
    case 'prismatic':
      return (
        <div style={{
          ...base,
          background: 'linear-gradient(90deg, #ff000015, #ff880015, #ffff0015, #00ff0015, #0088ff15, #8800ff15, #ff008815)',
          backgroundSize: '300% 100%',
          animation: 'noodle-aurora-bar 4s linear infinite',
          mixBlendMode: 'screen',
        }} />
      );
    case 'ember':
      return (
        <div style={base}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i % 2 === 0 ? 4 : 3, height: i % 2 === 0 ? 4 : 3,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#f97316' : '#fbbf24',
              left: `${8 + (i * 15) % 85}%`, bottom: '5%',
              animation: `noodle-float ${1.8 + (i % 3) * 0.4}s ease-out ${i * 0.4}s infinite`,
              opacity: 0, filter: 'blur(0.5px)',
            }} />
          ))}
        </div>
      );
    case 'neon':
      return (
        <div style={{
          ...base, borderRadius: 16,
          '--neon-c': bannerColor,
          animation: 'noodle-neon-pulse 2s ease-in-out infinite',
        }} />
      );
    case 'confetti':
      return (
        <div style={base}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i%3===0?4:3, height: i%3===0?2:3,
              borderRadius: i%2===0?'50%':'1px',
              background: ['#f43f5e','#fbbf24','#34d399','#60a5fa','#c084fc','#fb923c','#f472b6','#22d3ee','#a3e635','#e879f9','#facc15','#38bdf8'][i],
              left: `${(i*8+3)%90}%`, bottom: `${5+(i*11)%60}%`,
              animation: `noodle-float ${1.2+(i%4)*0.3}s ease-out ${i*0.15}s infinite`,
              opacity: 0, transform: `rotate(${i*30}deg)`,
            }} />
          ))}
        </div>
      );
    case 'plasma':
      return (
        <div style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, #38bdf815, #8b5cf615, transparent)',
            backgroundSize: '200% 100%',
            animation: 'noodle-shimmer 2s linear infinite',
            mixBlendMode: 'screen',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(270deg, transparent, #d946ef10, #06b6d410, transparent)',
            backgroundSize: '200% 100%',
            animation: 'noodle-shimmer 2.5s linear 0.5s infinite',
            mixBlendMode: 'screen',
          }} />
        </div>
      );
    case 'barglitch':
      return (
        <div style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #f43f5e08, transparent, #22d3ee08, transparent, #a3e63508)',
            backgroundSize: '300% 100%',
            animation: 'noodle-aurora-bar 1.5s steps(5) infinite',
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            animation: 'noodle-grid-scan 2s linear infinite',
          }} />
        </div>
      );
    case 'matrix':
      return (
        <div style={base}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 1.5, height: 6+i%4*3,
              background: `linear-gradient(to bottom, transparent, #00ff41${20+i%3*15})`,
              left: `${(i*13+5)%90}%`, top: '-20%',
              animation: `noodle-grid-scan ${1.2+i%4*0.4}s linear ${i*0.2}s infinite`,
              opacity: 0.5+i%3*0.2,
            }} />
          ))}
        </div>
      );
    case 'barfrost':
      return (
        <div style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, #22d3ee08, #a5f3fc10, #ecfeff08, transparent)',
            backgroundSize: '200% 100%',
            animation: 'noodle-shimmer 3.5s linear infinite',
          }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 2, height: 2, borderRadius: '50%',
              background: i%2===0?'#a5f3fc':'#ecfeff',
              left: `${10+i*18}%`, top: `${15+(i*23)%55}%`,
              animation: `noodle-star-twinkle ${1.5+i%3*0.5}s ease ${i*0.4}s infinite`,
            }} />
          ))}
        </div>
      );
    case 'barlava':
      return (
        <div style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, #ef444410, #f9731615, #fbbf2410, transparent)',
            backgroundSize: '200% 100%',
            animation: 'noodle-shimmer 2.5s linear infinite',
          }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: i%2===0?3:2, height: i%2===0?3:2,
              borderRadius: '50%',
              background: i%3===0?'#ef4444':i%3===1?'#f97316':'#fbbf24',
              left: `${5+i*20}%`, bottom: '10%',
              animation: `noodle-float ${1+i*0.3}s ease-out ${i*0.25}s infinite`,
              opacity: 0, filter: 'blur(0.5px)',
            }} />
          ))}
        </div>
      );
    case 'rainbowwave':
      return (
        <div style={base}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #ef444410, #f9731610, #fbbf2410, #22c55e10, #3b82f610, #8b5cf610, #ec489910, #ef444410)',
            backgroundSize: '300% 100%',
            animation: 'noodle-aurora-bar 3s linear infinite',
            mixBlendMode: 'screen',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
            animation: 'noodle-wave-move 2.5s ease-in-out infinite',
          }} />
        </div>
      );
    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   MAIN PROFILEBAR COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function ProfileBar() {
  const navigate = useNavigate();
  const [p, setP] = useState(readProfileBarUser);
  const [isDragging, setIsDragging] = useState(false);
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const barRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const load = () => setP(readProfileBarUser());

  useEffect(() => {
    window.addEventListener('noodle_profile_update', load);
    return () => window.removeEventListener('noodle_profile_update', load);
  }, []);

  useEffect(() => {
    const updateConstraints = () => {
      if (!barRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      setConstraints({
        top: -(rect.top), left: -(rect.left),
        right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.bottom,
      });
    };
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const darken = (hex, amt = 40) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    const n = parseInt(c, 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };

  const bg = p.bannerColor;
  const bgDark = darken(bg, 60);
  const hasBannerTheme = p.bannerTheme && p.bannerTheme !== 'none';

  return (
    <>
      <style>{EFFECT_STYLES}</style>

      <motion.div
        ref={barRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        drag dragConstraints={constraints} dragMomentum={false} dragElastic={0.1}
        onDragStart={(e) => {
          dragStartPos.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, y: e.clientY || e.touches?.[0]?.clientY || 0 };
          setIsDragging(true);
        }}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
        className="fixed bottom-4 left-4 z-[80] group"
        style={{ width: 240, cursor: isDragging ? 'grabbing' : 'grab' }}
        whileDrag={{ scale: 1.05, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
      >
        <motion.div
          onClick={() => { if (!isDragging) navigate('/hub/profile'); }}
          whileHover={!isDragging ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isDragging ? { scale: 0.98 } : {}}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: hasBannerTheme ? '#000' : `linear-gradient(135deg, ${bg}, ${bgDark})`,
            boxShadow: `0 8px 32px ${bg}30, 0 2px 8px rgba(0,0,0,0.3)`,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Animated banner theme (replaces solid gradient when active) */}
          <AnimatedBanner theme={p.bannerTheme} bannerColor={bg} />

          {/* Bar effect overlay */}
          <BarEffectOverlay effect={p.barEffect} bannerColor={bg} />

          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            zIndex: 2,
          }} />

          {/* Shine on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" style={{ zIndex: 3 }} />

          <div className="relative flex items-center gap-3 px-3 py-2.5" style={{ zIndex: 4 }}>
            {/* Drag handle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripHorizontal className="w-4 h-4 text-white/30" />
            </div>

            {/* Avatar with decoration */}
            <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
              <AvatarRing decoration={p.avatarDecoration} size={36} />
              <div className="w-9 h-9 rounded-full overflow-hidden relative" style={{
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 2,
              }}>
                {p.avatar ? (
                  <img src={p.avatar} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <User className="w-4 h-4 text-white/40" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-[13px] h-[13px] rounded-full flex items-center justify-center"
                style={{ background: bgDark, border: `2px solid ${bg}`, zIndex: 3 }}>
                <div className="w-[7px] h-[7px] rounded-full bg-[#23a559]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-white truncate drop-shadow-sm">{p.name}</div>
              <div className="text-[10px] text-white/50 truncate">{p.bio || 'Online'}</div>
            </div>

            {/* Streak + settings */}
            <div className="flex items-center gap-1 shrink-0">
              {p.streak > 0 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <Flame className="w-3 h-3 text-orange-300" />
                  <span className="text-[10px] font-bold text-white/80">{p.streak}</span>
                </div>
              )}
              <motion.div whileHover={{ rotate: 45 }} transition={{ duration: 0.2 }}
                className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Settings className="w-3.5 h-3.5 text-white/60" />
              </motion.div>
            </div>
          </div>

          {/* Bottom edge glow */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ zIndex: 3 }} />
        </motion.div>
      </motion.div>
    </>
  );
}
