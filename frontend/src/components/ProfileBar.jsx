import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Flame, User, GripHorizontal } from 'lucide-react';

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
];

/* ══════════════════════════════════════════════════════════
   AVATAR DECORATIONS — Premium ✦
   Animated rings / borders around the avatar
   ══════════════════════════════════════════════════════════ */
export const AVATAR_DECORATIONS = [
  { id: 'none',     name: 'None',          desc: 'No decoration',           premium: false },
  { id: 'rainbow',  name: 'Rainbow Ring',  desc: 'Spinning prismatic ring', premium: true },
  { id: 'cosmic',   name: 'Cosmic Pulse',  desc: 'Pulsing cosmic glow',    premium: true },
  { id: 'electric', name: 'Electric Arc',  desc: 'Flickering electric',     premium: true },
  { id: 'golden',   name: 'Golden Aura',   desc: 'Shimmering gold ring',   premium: true },
  { id: 'emerald',  name: 'Emerald Flame', desc: 'Green fire ring',        premium: true },
  { id: 'sakura',   name: 'Sakura',        desc: 'Cherry blossom pink',    premium: true },
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
];

/* ══════════════════════════════════════════════════════════
   CSS KEYFRAMES
   ══════════════════════════════════════════════════════════ */
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
export function AnimatedBanner({ theme, bannerColor, className = '', style = {} }) {
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
            const size = 1 + Math.random() * 2;
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
          {/* Petal-like outer glow */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: 'radial-gradient(circle, #f472b612, transparent 60%)',
            animation: 'noodle-pulse 2.5s ease-in-out infinite',
          }} />
          {/* Floating petal particles */}
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
    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════
   MAIN PROFILEBAR COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function ProfileBar() {
  const navigate = useNavigate();
  const [p, setP] = useState({
    name: '', bio: '', bannerColor: '#5865f2', avatar: null, streak: 0,
    avatarDecoration: 'none', barEffect: 'none', bannerTheme: 'none',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const barRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const load = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setP({
        name: u.name || 'User', bio: u.bio || '',
        bannerColor: u.bannerColor || '#5865f2', avatar: u.avatar || null,
        streak: u.streak || 0,
        avatarDecoration: u.avatarDecoration || 'none',
        barEffect: u.barEffect || 'none',
        bannerTheme: u.bannerTheme || 'none',
      });
    } catch {}
  };

  useEffect(() => {
    load();
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
