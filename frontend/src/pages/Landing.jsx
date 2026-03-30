import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NoodleXButton from "../components/NoodleXButton";
import {
  Dumbbell, Zap, Target, Flame, Brain, ChevronRight, Menu, X,
  CheckCircle2, Trophy, Sparkles, Rocket, Activity, ArrowRight,
  Star, Shield, Clock, BarChart3, Users, Heart, Dna, Utensils, Gem
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════
   3D PARTICLE FIELD — Floating particle galaxy
═══════════════════════════════════════════════════════ */
function ParticleField({ count = 2000 }) {
  const mesh = useRef();
  const { viewport } = useThree();

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 12 + 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
      // Warm red/orange/white palette
      const t = Math.random();
      if (t < 0.3) { col[i3] = 0.95; col[i3 + 1] = 0.2; col[i3 + 2] = 0.15; }
      else if (t < 0.5) { col[i3] = 1.0; col[i3 + 1] = 0.5; col[i3 + 2] = 0.2; }
      else if (t < 0.7) { col[i3] = 1.0; col[i3 + 1] = 0.85; col[i3 + 2] = 0.7; }
      else { col[i3] = 0.6; col[i3 + 1] = 0.6; col[i3 + 2] = 0.7; }
      sz[i] = Math.random() * 3 + 0.5;
    }
    return [pos, col, sz];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   3D ENERGY ORB — floating distorted sphere
═══════════════════════════════════════════════════════ */
function EnergyOrb() {
  const mesh = useRef();
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.15;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <Sphere ref={mesh} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={0.4}
          speed={2}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  );
}

/* ═══════════════════════════════════════════════════════
   3D HERO SCENE
═══════════════════════════════════════════════════════ */
function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#dc2626" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#f97316" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <ParticleField />
      <EnergyOrb />
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════
   MAGNETIC BUTTON
═══════════════════════════════════════════════════════ */
function MagneticButton({ children, onClick, className = "", style = {} }) {
  const ref = useRef();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPos({ x, y });
  }, []);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={className}
      style={style}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════
   TEXT SCRAMBLE EFFECT
═══════════════════════════════════════════════════════ */
function ScrambleText({ text, className = "", delay = 0 }) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef();
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [isInView, delay]);

  useEffect(() => {
    if (!started) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i < iteration) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      iteration += 1 / 2;
      if (iteration >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [started, text]);

  return <span ref={ref} className={className}>{display || (started ? text : "\u00A0".repeat(text.length))}</span>;
}

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = "", duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef();
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const dirs = { up: { y: 60 }, down: { y: -60 }, left: { x: 60 }, right: { x: -60 } };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(10px)", ...dirs[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   HORIZONTAL INFINITE MARQUEE
═══════════════════════════════════════════════════════ */
function Marquee({ items, speed = 30, reverse = false }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="inline-flex gap-8"
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm shrink-0">
            <span className="text-red-500 text-lg">{item.icon}</span>
            <span className="text-white/50 text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE CARD — premium glassmorphism
═══════════════════════════════════════════════════════ */
function FeatureCard({ feature, index }) {
  const ref = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouse = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <Reveal delay={index * 0.1}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouse}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative group cursor-default"
      >
        {/* Spotlight follow effect */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(220,38,38,0.12), transparent 60%)`,
          }}
        />
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/[0.08] group-hover:border-red-600/30 transition-all duration-500 overflow-hidden h-full">
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-600/10 to-transparent rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/25 group-hover:shadow-red-600/40 group-hover:scale-110 transition-all duration-300">
                {feature.icon}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-white/50 leading-relaxed text-[15px]">
              {feature.description}
            </p>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIAL CARD
═══════════════════════════════════════════════════════ */
function TestimonialCard({ t, index }) {
  return (
    <Reveal delay={index * 0.15}>
      <motion.div
        whileHover={{ y: -4 }}
        className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500 h-full flex flex-col"
      >
        {/* Stars */}
        <div className="flex gap-1 mb-5">
          {[...Array(5)].map((_, j) => (
            <Star key={j} className="w-4 h-4 fill-red-500 text-red-500" />
          ))}
        </div>
        <p className="text-white/70 leading-relaxed text-[15px] italic flex-1 mb-6">"{t.quote}"</p>
        <div className="flex items-center justify-between pt-5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {t.author[0]}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{t.author}</div>
              <div className="text-xs text-white/40">Age {t.age}</div>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400 text-xs font-bold">
            {t.result}
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════
   STEP CARD — How it works
═══════════════════════════════════════════════════════ */
function StepCard({ step, index, total }) {
  return (
    <Reveal delay={index * 0.15} direction={index % 2 === 0 ? "left" : "right"}>
      <div className="relative flex items-start gap-6 group">
        {/* Number + line */}
        <div className="flex flex-col items-center shrink-0">
          <motion.div
            whileHover={{ scale: 1.15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-red-600/25 relative z-10"
          >
            {String(index + 1).padStart(2, "0")}
          </motion.div>
          {index < total - 1 && (
            <div className="w-px h-20 bg-gradient-to-b from-red-600/40 to-transparent mt-2" />
          )}
        </div>
        <div className="pt-2 pb-8">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{step.title}</h3>
          <p className="text-white/50 leading-relaxed">{step.description}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
═══════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Parallax values
  const heroY = useTransform(smoothProgress, [0, 0.25], [0, -150]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);

  // Nav background opacity
  const navBg = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  // GSAP scroll animations
  const mainRef = useRef();
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate sections on scroll
      gsap.utils.toArray(".gsap-fade-section").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
          }
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { icon: <Brain className="w-6 h-6 text-white" />, title: "AI That Knows You", description: "Not a chatbot with canned responses. Real AI that learns your body, goals, schedule, and energy patterns. It evolves with you.", emoji: "🧠" },
    { icon: <Dumbbell className="w-6 h-6 text-white" />, title: "Every Training Style", description: "Bodybuilding, powerlifting, CrossFit, calisthenics — we've got it all. From beginner to elite-level programs. Your style, your rules.", emoji: "🏋️" },
    { icon: <Target className="w-6 h-6 text-white" />, title: "Dream Body Builder", description: "Upload a photo of your goal physique. AI analyzes it and creates the exact workout + nutrition plan to sculpt that body.", emoji: "🎯" },
    { icon: <Flame className="w-6 h-6 text-white" />, title: "Smart Nutrition", description: "Macro-tracked meals with food you actually enjoy. Flexible dieting, meal prep guides, and no more boring chicken and rice.", emoji: "🔥" },
    { icon: <Activity className="w-6 h-6 text-white" />, title: "Progress Analytics", description: "AI-powered body analysis, strength tracking, body composition changes. Watch your transformation unfold with real data.", emoji: "📊" },
    { icon: <Trophy className="w-6 h-6 text-white" />, title: "Challenges & Streaks", description: "Compete with yourself and others. Build unstoppable workout streaks. The AI pushes you when you need it, rests you when you don't.", emoji: "🏆" },
  ];

  const steps = [
    { title: "Tell Us About You", description: "Your goals, experience level, available equipment, injuries, preferences — the AI builds a complete picture of who you are." },
    { title: "Get Your Plan", description: "Within seconds, receive a fully personalized training and nutrition plan designed specifically for your body and goals." },
    { title: "Train With AI Coaching", description: "Your AI coach guides every workout, adjusts weights, tracks rest, and adapts in real-time based on your performance." },
    { title: "Watch Yourself Transform", description: "Progress photos, body scans, strength curves — see undeniable proof of your transformation backed by hard data." },
  ];

  const testimonials = [
    { quote: "I was stuck at the same weight for 2 years. Noodle's AI noticed patterns I never saw — adjusted my training split and nutrition timing. 11kg of muscle in 6 months.", author: "Marcus J.", result: "+11kg muscle", age: "24" },
    { quote: "As a busy mom, I have 30 minutes max. The AI creates workouts that are insanely efficient. Lost 18kg and I've never felt stronger or more confident.", author: "Priya K.", result: "Lost 18kg", age: "28" },
    { quote: "The dream physique feature blew my mind. I uploaded a photo, got a complete roadmap, and I'm already seeing the transformation after just 8 weeks.", author: "David M.", result: "Body recomp", age: "31" },
  ];

  const marqueeItems = [
    { icon: <Zap className="w-5 h-5"/>, text: "AI-Powered Training" },
    { icon: <Dna className="w-5 h-5"/>, text: "Body Analysis" },
    { icon: <Target className="w-5 h-5"/>, text: "Goal Tracking" },
    { icon: <Utensils className="w-5 h-5"/>, text: "Smart Nutrition" },
    { icon: <Activity className="w-5 h-5"/>, text: "Progress Analytics" },
    { icon: <Trophy className="w-5 h-5"/>, text: "Streak Challenges" },
    { icon: <Dumbbell className="w-5 h-5"/>, text: "Custom Workouts" },
    { icon: <Brain className="w-5 h-5"/>, text: "Adaptive AI" },
    { icon: <Flame className="w-5 h-5"/>, text: "Fat Burn Mode" },
    { icon: <Gem className="w-5 h-5"/>, text: "Premium Coaching" },
  ];

  const stats = [
    { value: 50000, suffix: "+", label: "Active Athletes" },
    { value: 2, suffix: "M+", label: "Workouts Completed" },
    { value: 98, suffix: "%", label: "User Satisfaction" },
    { value: 150, suffix: "+", label: "Countries" },
  ];

  return (
    <div ref={mainRef} className="bg-black text-white overflow-x-hidden selection:bg-red-600/30 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 99px; }
        ::selection { background: rgba(220,38,38,0.3); }
      `}</style>

      {/* ═══ PROGRESS BAR ═══ */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 origin-left z-[100]"
        style={{ scaleX: smoothProgress }}
      />

      {/* ═══ NAVIGATION ═══ */}
      <motion.nav
        className="fixed top-0 w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: `rgba(0,0,0,${useTransform(navBg, v => v * 0.85)})`,
          backdropFilter: `blur(${useTransform(navBg, v => v * 20)}px)`,
          borderBottom: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/30 blur-xl rounded-full" />
                <Brain className="relative w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-white">Noodle</span>
              </span>
            </motion.div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how" },
                { label: "Testimonials", href: "#testimonials" },
              ].map(link => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-white/50 hover:text-white text-sm font-medium transition-colors relative group"
                  whileHover={{ y: -1 }}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-600 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
              <NoodleXButton variant="nav" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signup")}
                className="bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all duration-300"
              >
                Start Training
              </motion.button>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-white/70" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/5 overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {["Features", "How It Works", "Testimonials"].map(label => (
                  <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '')}`}
                    className="text-white/60 hover:text-white py-2 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >{label}</a>
                ))}
                <button onClick={() => navigate("/signup")}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold text-white mt-2"
                >Start Training</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════
         HERO SECTION — Cinematic 3D with text scramble
      ═══════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <HeroScene />
        </div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/20 to-black" />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Badge */}
          <Reveal>
            <motion.div
              className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-full"
              animate={{ borderColor: ["rgba(255,255,255,0.08)", "rgba(220,38,38,0.3)", "rgba(255,255,255,0.08)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-white/70 text-sm font-semibold tracking-wide">
                <AnimatedCounter value={50000} suffix="+" /> Athletes Training Daily
              </span>
            </motion.div>
          </Reveal>

          {/* Headline with scramble */}
          <Reveal delay={0.2}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-[7rem] font-black mb-6 leading-[0.9] tracking-tight">
              <ScrambleText text="Transform" className="text-white" delay={400} />
              <br />
              <ScrambleText text="Your Body" className="text-white" delay={600} />
              <br />
              <span className="relative inline-block">
                <ScrambleText text="With AI" className="text-red-600" delay={800} />
                <motion.div
                  className="absolute -inset-3 bg-red-600/15 blur-3xl -z-10 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.4}>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              The AI fitness coach that learns your body, creates your
              perfect plan, and guides you to your dream physique.
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/signup")}
                className="group relative px-10 py-5 rounded-2xl text-lg font-bold overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-3 text-white">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 rounded-2xl text-lg font-semibold bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300 text-white/80"
              >
                Watch Demo
              </motion.button>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={0.8}>
            <div className="flex items-center justify-center flex-wrap gap-6 text-sm text-white/40">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-red-500" />, text: "14-day free trial" },
                { icon: <Shield className="w-4 h-4 text-red-500" />, text: "Cancel anytime" },
                { icon: <Sparkles className="w-4 h-4 text-red-500" />, text: "Results guaranteed" },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2">
                  {b.icon}<span>{b.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white/20 text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <motion.div
              className="w-1 h-2 bg-red-600 rounded-full"
              animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ MARQUEE STRIP ═══ */}
      <section className="py-8 border-y border-white/[0.03] bg-white/[0.01]">
        <Marquee items={marqueeItems} speed={40} />
      </section>

      {/* ═══════════════════════════════════════════════════════
         STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="text-center group">
                  <div className="text-4xl sm:text-5xl font-black text-white group-hover:text-red-500 transition-colors duration-300">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-sm text-white/40 mt-2 font-medium">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         PROBLEM SECTION — The pain points
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative gsap-fade-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-red-500 text-sm font-bold tracking-widest uppercase mb-4 block">The Problem</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Most fitness apps?
                <br />
                <span className="text-red-600">They don't cut it.</span>
              </h2>
              <p className="text-xl text-white/40 max-w-2xl mx-auto">
                Generic plans. Fake motivation. Zero personalization.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { wrong: "One-size-fits-all programs that work for nobody", right: "AI creates YOUR personalized plan based on your body and goals" },
              { wrong: "Motivational quotes that feel empty and generic", right: "Real AI coaching that adapts to your schedule and energy levels" },
              { wrong: "Static workouts that never change or adapt", right: "Dynamic training that evolves as you progress and improve" },
              { wrong: "No accountability or real progress tracking", right: "AI tracks every rep, adjusts every set, and holds you accountable" },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <div className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-6 h-6 rounded-full bg-red-600/10 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <p className="text-white/30 line-through text-[15px] leading-relaxed">{p.wrong}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-600/15 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <p className="text-white/80 font-semibold text-[15px] leading-relaxed group-hover:text-white transition-colors">{p.right}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         FEATURES — Spotlight cards
      ═══════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-red-500 text-sm font-bold tracking-widest uppercase mb-4 block">Features</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                What makes Noodle <span className="text-red-600">different</span>
              </h2>
              <p className="text-xl text-white/40 max-w-2xl mx-auto">
                Not your average fitness app. Built for real results.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE STRIP (reverse) ═══ */}
      <section className="py-6 border-y border-white/[0.03]">
        <Marquee items={marqueeItems} speed={35} reverse />
      </section>

      {/* ═══════════════════════════════════════════════════════
         DASHBOARD PREVIEW — Glass card
      ═══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 gsap-fade-section">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-red-500 text-sm font-bold tracking-widest uppercase mb-4 block">Preview</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                Your <span className="text-red-600">dashboard</span>, reimagined
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-6 bg-red-600/10 rounded-[3rem] blur-3xl" />
              <div className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/[0.08] shadow-2xl">
                <div className="bg-black/50 rounded-2xl p-5 sm:p-7 border border-white/[0.04]">
                  {/* Window dots */}
                  <div className="flex items-center gap-2 mb-6 pb-5 border-b border-white/[0.04]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <div className="w-3 h-3 rounded-full bg-white/15" />
                      <div className="w-3 h-3 rounded-full bg-white/15" />
                    </div>
                    <div className="text-xs text-white/30 font-medium ml-3">Noodle Dashboard</div>
                  </div>

                  <div className="space-y-4">
                    {/* Current workout */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-600/10 to-red-600/5 rounded-2xl border border-red-600/15">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-red-600/30"><Dumbbell className="w-6 h-6 text-white"/></div>
                        <div>
                          <div className="font-bold text-white mb-0.5">Chest & Triceps — Power Day</div>
                          <div className="text-sm text-white/50">5 exercises • 50 min • High intensity</div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-red-500 font-black text-sm tracking-widest">LIVE</div>
                    </div>

                    {/* AI Message */}
                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-white font-bold mb-2 text-sm">
                        <Brain className="w-4 h-4 text-red-500" />
                        <span>AI Coach Update</span>
                      </div>
                      <div className="text-white/50 text-sm leading-relaxed">
                        Great job on yesterday's leg session! Today we're hitting chest hard. I noticed you have
                        more energy in the mornings, so I scheduled this for 9 AM. Let's push for that new bench PR!
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "18", label: "Day Streak", color: "text-red-500" },
                        { val: "6.4kg", label: "Muscle Gain", color: "text-white" },
                        { val: "2,940", label: "Calories", color: "text-white" },
                      ].map((s, i) => (
                        <div key={i} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] text-center">
                          <div className={`text-2xl font-black ${s.color} mb-0.5`}>{s.val}</div>
                          <div className="text-xs text-white/40 font-medium">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         HOW IT WORKS — Vertical steps
      ═══════════════════════════════════════════════════════ */}
      <section id="how" className="py-24 px-6 gsap-fade-section">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-red-500 text-sm font-bold tracking-widest uppercase mb-4 block">How It Works</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                Four steps to your <span className="text-red-600">dream body</span>
              </h2>
            </div>
          </Reveal>

          <div className="mt-12">
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} total={steps.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         TESTIMONIALS
      ═══════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 px-6 gsap-fade-section">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-red-500 text-sm font-bold tracking-widest uppercase mb-4 block">Success Stories</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                Real transformations. <span className="text-red-600">Real people.</span>
              </h2>
              <p className="text-xl text-white/40">Results that speak for themselves.</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         FINAL CTA — Cinematic close
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <motion.div
              className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-white/[0.05] border border-white/[0.08] rounded-full"
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-white/60 text-sm font-medium">Join 50,000+ athletes</span>
            </motion.div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Ready to transform
              <br />
              your <span className="text-red-600">body?</span>
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-xl sm:text-2xl text-white/40 mb-12 font-light">
              Your AI coach is ready. Are you?
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/signup")}
              className="group relative px-14 py-6 rounded-2xl text-xl font-black bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3 text-white">
                Start Free Trial
                <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="mt-8 text-white/30 text-base">
              14 days free • Then ₹50/month • Cancel anytime
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
         FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-white" />
              <span className="text-2xl font-black text-white">Noodle</span>
            </div>
            <p className="text-white/30 text-sm max-w-md">
              AI-powered fitness platform that transforms your body with personalized training and nutrition.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {["Features", "How It Works", "Testimonials"].map(label => (
              <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, "")}`}
                className="text-white/30 hover:text-white/60 text-sm transition-colors"
              >{label}</a>
            ))}
          </div>

          <div className="pt-8 border-t border-white/[0.04] text-center">
            <p className="text-white/20 text-sm">© 2026 Noodle. Built for athletes who demand more.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}