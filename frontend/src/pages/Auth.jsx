import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import NoodleXButton from "../components/NoodleXButton";
const API = "http://localhost:5000/api/auth";

/* ═══════════════════════════════════════════════════════
   PASSWORD VALIDATION
═══════════════════════════════════════════════════════ */
function validatePw(pw) {
  return {
    length: pw.length >= 10,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[@!#$%^&*]/.test(pw),
  };
}

/* ═══════════════════════════════════════════════════════
   NEURAL MESH CANVAS — Calm, Interactive, Enterprise AI
═══════════════════════════════════════════════════════ */
function NeuralCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let w, h, raf;
    const dots = [];
    const DOT_COUNT = window.innerWidth > 800 ? 90 : 40;
    const CONN_DIST = 140;

    const resize = () => { w = cvs.width = window.innerWidth; h = cvs.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.current.vx = e.clientX - mouse.current.x;
      mouse.current.vy = e.clientY - mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    });

    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        baseHue: 220 + Math.random() * 40 // Teal to Purple
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, w, h);

      // Mouse interaction decay
      mouse.current.vx *= 0.9;
      mouse.current.vy *= 0.9;

      // Draw mesh
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        // Mouse push
        const dx = mouse.current.x - d.x;
        const dy = mouse.current.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          d.x -= (dx / dist) * 0.4;
          d.y -= (dy / dist) * 0.4;
          // Connect to mouse
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mouse.current.x, mouse.current.y);
          ctx.strokeStyle = `hsla(${d.baseHue}, 70%, 60%, ${0.15 - dist / 1000})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.baseHue}, 80%, 70%, ${0.5 + Math.sin(Date.now() / 1000 + i) * 0.3})`;
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dx2 = d.x - d2.x;
          const dy2 = d.y - d2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < CONN_DIST) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = `hsla(${(d.baseHue + d2.baseHue) / 2}, 60%, 50%, ${(1 - dist2 / CONN_DIST) * 0.2})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ═══════════════════════════════════════════════════════
   PREMIUM BUTTON — Spotlight + Magnetic hover
═══════════════════════════════════════════════════════ */
function PremiumButton({ children, loading, type = "button", onClick, disabled, variant = "primary" }) {
  const btnRef = useRef(null);
  const [mt, setMt] = useState({ x: 0, y: 0, active: false });

  const onMove = (e) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setMt({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  };
  const onLeave = () => setMt({ ...mt, active: false });

  const isPri = variant === "primary";

  return (
    <motion.button ref={btnRef} type={type} onClick={onClick} disabled={disabled || loading}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02, y: -2 }}
      style={{
        width: "100%", padding: "14px 24px", borderRadius: 12, position: "relative", overflow: "hidden",
        fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", cursor: disabled ? "not-allowed" : "pointer",
        background: isPri ? "rgba(255,255,255,0.06)" : "transparent",
        color: isPri ? "#fff" : "rgba(255,255,255,0.7)",
        border: `1px solid ${isPri ? "rgba(255,255,255,0.15)" : "transparent"}`,
        boxShadow: isPri ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        fontFamily: "'Inter', sans-serif", opacity: disabled ? 0.6 : 1, transition: "border 0.3s, color 0.3s",
      }}
    >
      {/* Spotlight Core */}
      {isPri && mt.active && (
        <div style={{
          position: "absolute", left: mt.x, top: mt.y, transform: "translate(-50%, -50%)", pointerEvents: "none",
          width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,210,255,0.4) 0%, transparent 70%)",
          filter: "blur(10px)", zIndex: 0
        }} />
      )}
      {/* Background sweep */}
      {isPri && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", transform: "skewX(-20deg) translateX(-150%)", animation: "shimmer 3s infinite linear", zIndex: 0 }} />
      )}
      
      <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        {loading && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />}
        {children}
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════
   PASSWORD RULE ITEM
═══════════════════════════════════════════════════════ */
function RuleItem({ met, label }) {
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500, color: met ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", transition: "color 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }}>
      <motion.div animate={{ scale: met ? 1.1 : 1, background: met ? "rgba(100,225,180,0.15)" : "rgba(255,255,255,0.03)", borderColor: met ? "rgba(100,225,180,0.4)" : "rgba(255,255,255,0.1)" }} transition={{ duration: 0.3 }}
        style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid", color: "#64e1b4" }}>
        {met && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
      </motion.div>
      {label}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
═══════════════════════════════════════════════════════ */
export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fField, setFField] = useState(null);

  // OTP
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  // 3D Tilt Card
  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-300, 300], [4, -4]);
  const rotateY = useTransform(mx, [-300, 300], [-4, 4]);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  function onCardMove(e) {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;
    mx.set(e.clientX - cx);
    my.set(e.clientY - cy);
  }
  function onCardLeave() { mx.set(0); my.set(0); }

  useEffect(() => {
    fetch("http://localhost:5000/api/user/me", { credentials: "include" })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (data.user) { localStorage.setItem("user", JSON.stringify(data.user)); navigate("/hub"); } })
      .catch(() => { });
  }, [navigate]);

  const rules = validatePw(password);
  const pwValid = Object.values(rules).every(Boolean);
  const pwBad = mode === "signup" && password.length > 0 && !pwValid;
  const cfBad = confirm.length > 0 && confirm !== password;

  function startCooldown() {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(cooldownRef.current); return 0; } return prev - 1; });
    }, 1000);
  }
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  function switchMode(m) {
    if (m === mode) return; setMode(m); setError(""); setEmail(""); setPw(""); setConfirm("");
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (mode === "signup") {
      if (!pwValid) { setError("Password does not meet requirements."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
    }
    setLoading(true);
    try {
      const res = await fetch(mode === "signup" ? `${API}/signup` : `${API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) setError(data.message || "Error occurred.");
      else if (data.requiresOTP) {
        setOtpEmail(data.email || email); setOtpPurpose(data.purpose || mode);
        setOtpDigits(["", "", "", "", "", ""]); setOtpStep(true); startCooldown();
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  function handleOtpChange(idx, val) {
    if (val.length > 1) val = val.slice(-1);
    if (val && !/^\d$/.test(val)) return;
    const next = [...otpDigits]; next[idx] = val; setOtpDigits(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (val && next.every(d => d)) verifyOTP(next.join(""));
  }
  function handleOtpKeyDown(idx, e) { if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }
  function handleOtpPaste(e) {
    e.preventDefault(); const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return; const next = [...otpDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setOtpDigits(next); const fI = Math.min(pasted.length, 5); otpRefs.current[fI]?.focus();
    if (next.every(d => d)) verifyOTP(next.join(""));
  }

  async function verifyOTP(code) {
    setError(""); setOtpLoading(true);
    try {
      const res = await fetch(`${API}/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email: otpEmail, otp: code, purpose: otpPurpose }) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid OTP"); setOtpDigits(["", "", "", "", "", ""]); setTimeout(() => otpRefs.current[0]?.focus(), 150); }
      else {
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        navigate(data.onboardingComplete ? "/hub" : "/onboarding");
      }
    } catch { setError("Network error."); }
    finally { setOtpLoading(false); }
  }

  async function handleResend() {
    if (resendCooldown > 0) return; setError(""); setOtpLoading(true);
    try {
      const res = await fetch(`${API}/resend-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email: otpEmail }) });
      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to resend");
      else { setOtpDigits(["", "", "", "", "", ""]); startCooldown(); setTimeout(() => otpRefs.current[0]?.focus(), 150); }
    } catch { setError("Network error."); }
    finally { setOtpLoading(false); }
  }

  function handleOtpBack() { setOtpStep(false); setError(""); setOtpDigits(["", "", "", "", "", ""]); if (cooldownRef.current) clearInterval(cooldownRef.current); setResendCooldown(0); }

  const inp = (f, bad) => ({
    width: "100%", padding: "16px 18px", borderRadius: 12, fontSize: 15, fontWeight: 500, outline: "none",
    background: fField === f ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
    color: "#fff", fontFamily: "'Inter', sans-serif",
    border: `1px solid ${bad ? "rgba(248,113,113,0.5)" : fField === f ? "rgba(200,210,255,0.5)" : "rgba(255,255,255,0.08)"}`,
    boxShadow: fField === f ? "0 0 0 3px rgba(200,210,255,0.1), 0 8px 20px rgba(0,0,0,0.2)" : "0 4px 10px rgba(0,0,0,0.1)",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;height:100%;overflow:hidden;background:#030305}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #08080c inset!important;-webkit-text-fill-color:#fff!important;transition:background-color 9999s}
        input::placeholder{color:rgba(255,255,255,.2);font-weight:400}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        ::selection{background:rgba(200,210,255,0.2);color:#fff}
      `}</style>

      <NeuralCanvas />

      {/* Floating particles around card */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", width: "80vmin", height: "80vmin", borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(167,139,250,0.08) 0%, transparent 20%, transparent 80%, rgba(52,211,153,0.08) 100%)", filter: "blur(40px)" }} />
        <motion.div animate={{ rotate: -360, scale: [1, 0.95, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", width: "60vmin", height: "60vmin", borderRadius: "50%", background: "conic-gradient(from 180deg, rgba(96,165,250,0.05) 0%, transparent 30%, transparent 70%, rgba(200,210,255,0.05) 100%)", filter: "blur(30px)" }} />
      </div>

      <div style={{ position: "fixed", inset: 0, zIndex: 10, overflowY: "auto", overflowX: "hidden", perspective: 1500 }}>
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: 24 }}>
          <motion.div ref={cardRef} onMouseMove={onCardMove} onMouseLeave={onCardLeave}
            initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              margin: "auto", width: "100%", maxWidth: 460, rotateX: springX, rotateY: springY,
            background: "rgba(12,12,16,0.65)", backdropFilter: "blur(40px) saturate(1.2)", WebkitBackdropFilter: "blur(40px) saturate(1.2)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: "48px 40px",
            boxShadow: "0 40px 100px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)",
            position: "relative", overflow: "hidden", transformStyle: "preserve-3d"
          }}>
          
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", opacity: 0.5 }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36, transform: "translateZ(30px)" }}>
            <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ width: 44, height: 44, margin: "0 auto 16px", borderRadius: 12, background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </motion.div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em", marginBottom: 8 }}>
              {otpStep ? "Verification Required" : mode === "signup" ? "Begin Your Journey" : "Welcome Back"}
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              {otpStep ? `Code sent to ${otpEmail}` : mode === "signup" ? "Sign up to start training." : "Log in to your dashboard."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!otpStep ? (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} style={{ transform: "translateZ(20px)" }}>
                {/* Mode Toggle Banner */}
                <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 5, marginBottom: 32, position: "relative" }}>
                  <motion.div layout style={{ position: "absolute", top: 5, bottom: 5, width: "calc(50% - 5px)", background: "rgba(255,255,255,0.1)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} animate={{ left: mode === "signup" ? 5 : "50%" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  {["signup", "login"].map(m => (
                    <button key={m} type="button" onClick={() => switchMode(m)} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: mode === m ? 700 : 500, fontFamily: "'Inter', sans-serif", letterSpacing: "0.02em", color: mode === m ? "#fff" : "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", position: "relative", zIndex: 1, textTransform: "capitalize", transition: "color 0.3s" }}>
                      {m === "signup" ? "Sign Up" : "Log In"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: fField === "email" ? "#fff" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, transition: "color 0.3s", fontFamily: "'Inter',sans-serif" }}>Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="athlete@gmail.com" onFocus={() => setFField("email")} onBlur={() => setFField(null)} style={inp("email", false)} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: fField === "password" ? "#fff" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, transition: "color 0.3s", fontFamily: "'Inter',sans-serif" }}>Password</label>
                    <input type="password" required value={password} onChange={e => setPw(e.target.value)} placeholder="••••••••••" onFocus={() => setFField("password")} onBlur={() => setFField(null)} style={inp("password", pwBad)} />
                  </div>

                  <AnimatePresence>
                    {mode === "signup" && password.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0, scaleY: 0.9 }} animate={{ opacity: 1, height: "auto", scaleY: 1 }} exit={{ opacity: 0, height: 0, scaleY: 0.9 }} style={{ overflow: "hidden", marginBottom: 18, transformOrigin: "top" }}>
                        <div style={{ padding: "14px 18px", background: "rgba(0,0,0,0.3)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", gap: 10, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.2)" }}>
                          <RuleItem met={rules.length} label="At least 10 characters" />
                          <RuleItem met={rules.uppercase} label="One uppercase letter" />
                          <RuleItem met={rules.number} label="One number" />
                          <RuleItem met={rules.special} label="One special character" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {mode === "signup" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: fField === "confirm" ? "#fff" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, transition: "color 0.3s", fontFamily: "'Inter',sans-serif" }}>Confirm Password</label>
                      <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••••" onFocus={() => setFField("confirm")} onBlur={() => setFField(null)} style={inp("confirm", cfBad)} />
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: 20, padding: 14, borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5", fontSize: 13, fontFamily: "'Inter',sans-serif", textAlign: "center", fontWeight: 500 }}>{error}</motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full text-[15px] font-bold tracking-wide shadow-xl text-white pt-2 pb-2 h-14 rounded-xl flex items-center justify-center" 
                    style={{ background: "#5865f2", border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
                    type="submit" disabled={loading}
                  >
                    {loading ? "Processing..." : (mode === "signup" ? "Create Account" : "Access Dashboard")}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              /* OTP VIEW */
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ transform: "translateZ(20px)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 32 }}>
                  {otpDigits.map((d, i) => (
                    <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} onPaste={i === 0 ? handleOtpPaste : undefined} disabled={otpLoading}
                      style={{
                        width: "100%", height: 56, textAlign: "center", fontSize: 24, fontWeight: 700, fontFamily: "'Inter', sans-serif",
                        borderRadius: 12, background: d ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.4)", color: "#fff",
                        border: `1px solid ${d ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`, outline: "none",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        boxShadow: d ? "0 4px 15px rgba(255,255,255,0.1)" : "inset 0 4px 10px rgba(0,0,0,0.3)"
                      }}
                      onFocus={e => { e.target.style.borderColor = "rgba(255,255,255,0.8)"; e.target.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.1)"; e.target.style.background = "rgba(255,255,255,0.1)" }}
                      onBlur={e => { e.target.style.borderColor = d ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = d ? "0 4px 15px rgba(255,255,255,0.1)" : "inset 0 4px 10px rgba(0,0,0,0.3)"; e.target.style.background = d ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.4)" }}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 20, padding: 14, borderRadius: 10, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#fca5a5", fontSize: 13, fontFamily: "'Inter',sans-serif", textAlign: "center" }}>{error}</motion.div>}
                </AnimatePresence>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <motion.button 
                    whileHover={otpDigits.some(d => !d) ? {} : { scale: 1.02 }} whileTap={otpDigits.some(d => !d) ? {} : { scale: 0.98 }}
                    className="w-full text-[15px] font-bold tracking-wide shadow-xl text-white pt-2 pb-2 h-14 rounded-xl flex items-center justify-center" 
                    style={{ background: otpDigits.some(d => !d) ? "rgba(255,255,255,0.1)" : "#5865f2", color: otpDigits.some(d => !d) ? "rgba(255,255,255,0.4)" : "#fff", border: "none", cursor: (otpLoading || otpDigits.some(d => !d)) ? "default" : "pointer" }}
                    onClick={() => verifyOTP(otpDigits.join(""))} type="button" disabled={otpLoading || otpDigits.some(d => !d)}
                  >
                    {otpLoading ? "Verifying..." : "Verify Code"}
                  </motion.button>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
                    <button type="button" onClick={handleOtpBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'Inter', sans-serif", cursor: "pointer", transition: "color 0.3s", fontWeight: 500 }} onMouseEnter={e => e.target.style.color="#fff"} onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.4)"}>
                      ← Back
                    </button>
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || otpLoading} style={{ background: "none", border: "none", color: resendCooldown > 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "'Inter', sans-serif", cursor: resendCooldown > 0 ? "default" : "pointer", transition: "color 0.3s", fontWeight: 500 }}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          </motion.div>

          <div style={{ marginTop: 16 }}>
            <NoodleXButton variant="inline" />
          </div>
        </div>
      </div>
    </>
  );
}