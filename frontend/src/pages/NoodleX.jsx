import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import {
  Crown, Zap, Brain, Sparkles, Rocket, ArrowRight, Check, X,
  Palette, Shield, Clock, Star, Infinity as InfinityIcon, MessageSquare, Eye,
  ArrowLeft, ChevronRight
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   3D GOLD PARTICLE FIELD
═══════════════════════════════════════════════════════ */
function GoldParticles({ count = 1500 }) {
  const mesh = useRef();
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * 14 + 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      if (t < 0.35) { col[i3] = 1.0; col[i3+1] = 0.85; col[i3+2] = 0.3; }       // gold
      else if (t < 0.55) { col[i3] = 0.85; col[i3+1] = 0.65; col[i3+2] = 1.0; }  // purple
      else if (t < 0.75) { col[i3] = 1.0; col[i3+1] = 0.95; col[i3+2] = 0.85; }  // warm white
      else { col[i3] = 0.6; col[i3+1] = 0.4; col[i3+2] = 0.9; }                  // violet
      sz[i] = Math.random() * 3 + 0.5;
    }
    return [pos, col, sz];
  }, [count]);

  useFrame((s) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = s.clock.elapsedTime * 0.015;
    mesh.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.008) * 0.08;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* 3D Gold Orb */
function GoldOrb() {
  const mesh = useRef();
  useFrame((s) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = s.clock.elapsedTime * 0.12;
    mesh.current.rotation.y = s.clock.elapsedTime * 0.18;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1.2}>
      <Sphere ref={mesh} args={[1.3, 64, 64]}>
        <MeshDistortMaterial color="#fbbf24" emissive="#b8860b" emissiveIntensity={0.5} roughness={0.15} metalness={0.9} distort={0.35} speed={1.5} transparent opacity={0.75} />
      </Sphere>
    </Float>
  );
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ position: "absolute", inset: 0 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#7c3aed" />
      <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={0.5} />
      <GoldParticles />
      <GoldOrb />
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   REVEAL ANIMATION
═══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0 }) {
  const ref = useRef();
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50, filter: "blur(8px)" }} animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE CARD — Gold glassmorphism
═══════════════════════════════════════════════════════ */
function PremiumCard({ feature, index }) {
  const ref = useRef();
  const [mp, setMp] = useState({ x: 0, y: 0 });
  return (
    <Reveal delay={index * 0.1}>
      <motion.div ref={ref} onMouseMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (r) setMp({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="relative group cursor-default">
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(400px circle at ${mp.x}% ${mp.y}%, rgba(251,191,36,0.12), transparent 60%)` }} />
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/[0.08] group-hover:border-amber-500/30 transition-all duration-500 overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${feature.c1}, ${feature.c2})`, boxShadow: `0 8px 24px ${feature.c1}40` }}>
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">{feature.title}</h3>
            <p className="text-white/50 leading-relaxed text-[15px]">{feature.desc}</p>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN NOODLE X PAGE
═══════════════════════════════════════════════════════ */
export default function NoodleX() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(smoothProgress, [0, 0.2], [0, -120]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  const features = [
    { icon: <InfinityIcon className="w-6 h-6 text-white" />, title: "10× Token Limit", desc: "100,000 tokens per session vs 10,000 on Free. Generate massive workout plans, deep nutrition analysis, and full body transformation roadmaps in a single conversation.", c1: "#fbbf24", c2: "#f59e0b" },
    { icon: <Brain className="w-6 h-6 text-white" />, title: "Smartest AI Models", desc: "Access GPT-4o, Claude 3.5 Sonnet, and Gemini Pro — the world's most intelligent models. Get coaching that rivals a PhD-level sports scientist.", c1: "#7c3aed", c2: "#6d28d9" },
    { icon: <MessageSquare className="w-6 h-6 text-white" />, title: "Detailed Responses", desc: "Longer, more thorough, and more accurate AI responses. Every answer is deeply researched with citations, references, and scientific backing.", c1: "#06b6d4", c2: "#0891b2" },
    { icon: <Palette className="w-6 h-6 text-white" />, title: "Animated Profile Effects", desc: "Unlock all 8 animated banner themes, 7 avatar decorations with orbiting particles, and 7 bar effects. Make your profile truly stand out.", c1: "#f472b6", c2: "#ec4899" },
    { icon: <Rocket className="w-6 h-6 text-white" />, title: "Early Access", desc: "Be the first to try new features, experimental AI models, and beta tools before they're released to everyone. Shape the future of Noodle.", c1: "#22c55e", c2: "#16a34a" },
    { icon: <Shield className="w-6 h-6 text-white" />, title: "Priority Support", desc: "Skip the queue. Get dedicated support with faster response times, priority bug fixes, and a direct line to the Noodle development team.", c1: "#f97316", c2: "#ea580c" },
  ];

  const comparison = [
    { feature: "AI Tokens per Session", free: "10,000", x: "100,000" },
    { feature: "AI Models Available", free: "1 Basic Model", x: "GPT-4o, Claude, Gemini" },
    { feature: "Response Detail Level", free: "Standard", x: "Ultra Detailed" },
    { feature: "Animated Banner Themes", free: "—", x: "8 Premium Themes" },
    { feature: "Avatar Decorations", free: "—", x: "7 Animated Rings" },
    { feature: "Bar Effects", free: "—", x: "7 Animated Effects" },
    { feature: "Priority Support", free: "—", x: "✓" },
    { feature: "Early Access Features", free: "—", x: "✓" },
    { feature: "Custom AI Personality", free: "—", x: "✓" },
    { feature: "Advanced Analytics", free: "Basic", x: "Full Dashboard" },
  ];

  return (
    <div className="bg-black text-white overflow-x-hidden selection:bg-amber-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #fbbf24; border-radius: 99px; }

        @keyframes nxShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes nxFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes nxPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes nxGlow { 0%, 100% { box-shadow: 0 0 20px #fbbf2430, 0 0 60px #fbbf2410; } 50% { box-shadow: 0 0 30px #fbbf2450, 0 0 80px #fbbf2420; } }
      `}</style>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left" style={{ scaleX: smoothProgress, background: "linear-gradient(90deg, #fbbf24, #7c3aed, #fbbf24)" }} />

      {/* Back button */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        onClick={() => navigate(-1)} className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </motion.button>

      {/* ═══════════════════════════════════════════════
         HERO — Gold 3D galaxy
      ═══════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0"><HeroScene /></div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black" />

        <motion.div className="relative z-10 text-center px-6 max-w-5xl mx-auto" style={{ y: heroY, opacity: heroOpacity }}>
          {/* Floating badge */}
          <Reveal>
            <motion.div className="inline-flex items-center gap-2 mb-8 px-6 py-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #fbbf2415, #7c3aed15)", border: "1px solid #fbbf2430" }}
              animate={{ borderColor: ["#fbbf2430", "#7c3aed50", "#fbbf2430"] }} transition={{ duration: 3, repeat: Infinity }}>
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-bold tracking-wide">PREMIUM EXPERIENCE</span>
            </motion.div>
          </Reveal>

          {/* Title */}
          <Reveal delay={0.15}>
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black mb-4 leading-[0.9] tracking-tight">
              <span className="text-white">Noodle</span>{" "}
              <span className="relative inline-block">
                <span style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24, #7c3aed, #fbbf24)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "nxShimmer 4s linear infinite" }}>X</span>
                <motion.div className="absolute -inset-6 rounded-full -z-10" style={{ background: "radial-gradient(circle, #fbbf2420, transparent 60%)" }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 3, repeat: Infinity }} />
              </span>
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.3}>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Unlock the full power of AI fitness coaching.<br />
              Smarter models. Deeper insights. Premium everything.
            </p>
          </Reveal>

          {/* CTA */}
          <Reveal delay={0.45}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                className="group relative px-10 py-5 rounded-2xl text-lg font-bold overflow-hidden shadow-2xl"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 8px 40px #fbbf2440", animation: "nxGlow 3s ease-in-out infinite" }}>
                <span className="relative z-10 flex items-center gap-3 text-black">
                  <Crown className="w-5 h-5" />
                  Upgrade to Noodle X
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { const el = document.getElementById("nx-compare"); el?.scrollIntoView({ behavior: "smooth" }); }}
                className="px-8 py-5 rounded-2xl text-lg font-semibold text-white/70 transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Compare Plans
              </motion.button>
            </div>
          </Reveal>

          {/* Trust */}
          <Reveal delay={0.6}>
            <div className="flex items-center justify-center flex-wrap gap-6 mt-10 text-sm text-white/30">
              {[{ ic: <Zap className="w-4 h-4 text-amber-400" />, t: "Instant activation" }, { ic: <Shield className="w-4 h-4 text-amber-400" />, t: "Cancel anytime" }, { ic: <Clock className="w-4 h-4 text-amber-400" />, t: "7-day money-back" }].map(b => (
                <div key={b.t} className="flex items-center gap-2">{b.ic}<span>{b.t}</span></div>
              ))}
            </div>
          </Reveal>
        </motion.div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="text-white/15 text-xs font-medium tracking-widest uppercase">Discover</span>
          <div className="w-5 h-8 border border-white/15 rounded-full flex items-start justify-center pt-1.5">
            <motion.div className="w-1 h-2 bg-amber-400 rounded-full" animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
         FEATURES — 6 premium benefit cards
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-4 block">Exclusive Benefits</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                Everything in <span style={{ background: "linear-gradient(135deg, #fbbf24, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Noodle X</span>
              </h2>
              <p className="text-xl text-white/40 max-w-2xl mx-auto">Premium features that transform your fitness journey into an extraordinary experience.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <PremiumCard key={i} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         COMPARISON TABLE — Free vs X
      ═══════════════════════════════════════════════ */}
      <section id="nx-compare" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-4 block">Compare</span>
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Free vs <span style={{ background: "linear-gradient(135deg, #fbbf24, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Noodle X</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-3xl overflow-hidden border border-white/[0.08]" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}>
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1fr_150px_170px] text-center font-bold text-sm border-b border-white/[0.06]">
                <div className="p-5 text-left text-white/40 font-semibold">Feature</div>
                <div className="p-5 text-white/50">Free</div>
                <div className="p-5 relative">
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #fbbf2408, transparent)" }} />
                  <span className="relative flex items-center justify-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Noodle X</span>
                  </span>
                </div>
              </div>

              {/* Rows */}
              {comparison.map((row, i) => (
                <div key={i} className={`grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1fr_150px_170px] text-center text-sm ${i < comparison.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                  <div className="p-4 text-left text-white/60 font-medium">{row.feature}</div>
                  <div className="p-4 text-white/30">{row.free}</div>
                  <div className="p-4 relative">
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #fbbf2404, transparent)" }} />
                    <span className="relative text-amber-300 font-semibold">
                      {row.x === "✓" ? <Check className="w-4 h-4 text-amber-400 mx-auto" /> : row.x}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
         PRICING CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-lg mx-auto relative">
          <Reveal>
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 rounded-[2.5rem] blur-3xl" style={{ background: "radial-gradient(circle, #fbbf2418, #7c3aed10, transparent)" }} />

              <div className="relative rounded-3xl p-[1px] overflow-hidden" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #7c3aed, #fbbf24)" }}>
                <div className="rounded-3xl p-8 sm:p-10" style={{ background: "linear-gradient(to bottom, #0a0a0f, #0d0d15)" }}>

                  {/* Badge */}
                  <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2 px-5 py-2 rounded-full" style={{ background: "linear-gradient(135deg, #fbbf2418, #7c3aed18)", border: "1px solid #fbbf2430" }}>
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 text-sm font-bold">NOODLE X</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-6xl font-black text-white mb-1">
                      $9<span className="text-2xl font-semibold text-white/40">.99</span>
                    </div>
                    <div className="text-white/30 text-sm">per month, cancel anytime</div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 mb-8">
                    {["100K tokens per AI session", "Access to GPT-4o, Claude, Gemini", "Ultra-detailed AI responses", "All animated profile effects", "Priority support", "Early access to features"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #fbbf2425, #7c3aed25)" }}>
                          <Check className="w-3 h-3 text-amber-400" strokeWidth={3} />
                        </div>
                        <span className="text-white/70 text-sm font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl text-lg font-bold text-black relative overflow-hidden group"
                    style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 8px 30px #fbbf2430" }}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Upgrade Now
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </motion.button>

                  <p className="text-center text-white/20 text-xs mt-4">7-day money-back guarantee · No commitments</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-white" />
            <span className="text-xl font-black text-white">Noodle <span style={{ background: "linear-gradient(135deg, #fbbf24, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>X</span></span>
          </div>
          <p className="text-white/20 text-sm">The premium AI fitness experience. Made with love by the Noodle team.</p>
        </div>
      </footer>
    </div>
  );
}
