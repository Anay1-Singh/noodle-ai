import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Check, ChevronRight } from "lucide-react";
const API = "http://localhost:5000/api/user";

const avatars = Array.from(
    { length: 50 },
    (_, i) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${i + 1}`
);

export default function Onboarding() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Detect if this is an existing user just changing their avatar
    const [isAvatarChangeOnly, setIsAvatarChangeOnly] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData.onboardingComplete) {
                    // Existing user — avatar change mode only
                    setIsAvatarChangeOnly(true);
                    setName(userData.name || "");
                    // Pre-select their current avatar if it matches one in the grid
                    const idx = avatars.findIndex((url) => url === userData.avatar);
                    if (idx >= 0) setSelectedAvatar(idx);
                } else if (userData.name) {
                    setName(userData.name);
                }
            } catch { }
        }
    }, []);

    const canContinue = isAvatarChangeOnly
        ? selectedAvatar !== null
        : name.trim().length > 0 && selectedAvatar !== null;

    async function handleContinue() {
        if (!canContinue || loading) return;
        setError("");
        setLoading(true);

        try {
            if (isAvatarChangeOnly) {
                // Avatar-only change — PUT /avatar
                const res = await fetch(`${API}/avatar`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ avatar: avatars[selectedAvatar] }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || "Something went wrong.");
                } else {
                    // Update only avatar in stored user
                    const storedUser = localStorage.getItem("user");
                    let userData = {};
                    if (storedUser) try { userData = JSON.parse(storedUser); } catch { }
                    userData.avatar = data.avatar;
                    localStorage.setItem("user", JSON.stringify(userData));
                    navigate("/hub");
                }
            } else {
                // Full onboarding — POST /onboarding
                const res = await fetch(`${API}/onboarding`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ name: name.trim(), avatar: avatars[selectedAvatar] }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || "Something went wrong.");
                } else {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    navigate("/hub");
                }
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;height:100%;overflow:hidden}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 30px rgba(120,80,255,0.08)}50%{box-shadow:0 0 50px rgba(120,80,255,0.15)}}
        @keyframes float-slow{0%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,-15px) scale(1.05)}100%{transform:translate(0,0) scale(1)}}
        @keyframes float-slow2{0%{transform:translate(0,0) scale(1)}50%{transform:translate(-15px,20px) scale(1.08)}100%{transform:translate(0,0) scale(1)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.12)}
        input::placeholder{color:rgba(255,255,255,.15)}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{
          -webkit-box-shadow:0 0 0 1000px rgba(10,5,20,.98) inset!important;
          -webkit-text-fill-color:rgba(255,255,255,.9)!important;transition:background-color 9999s}
      `}</style>

            {/* Background */}
            <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(30,15,60,1) 0%, rgba(8,4,20,1) 50%, rgba(2,1,8,1) 100%)", zIndex: 0 }} />
            <div style={{ position: "fixed", top: "5%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,80,200,0.07) 0%, transparent 70%)", filter: "blur(90px)", zIndex: 0, animation: "float-slow 14s ease-in-out infinite" }} />
            <div style={{ position: "fixed", bottom: "0%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,130,220,0.05) 0%, transparent 70%)", filter: "blur(90px)", zIndex: 0, animation: "float-slow2 18s ease-in-out infinite" }} />

            {/* Main content */}
            <div style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        width: "100%", maxWidth: 920,
                        display: "grid", gridTemplateColumns: "340px 1fr", gap: 28,
                        alignItems: "start",
                    }}
                >
                    {/* ═══════ LEFT: Profile Preview Card ═══════ */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{
                            background: "rgba(0,0,0,0.45)",
                            backdropFilter: "blur(60px) saturate(1.3)",
                            WebkitBackdropFilter: "blur(60px) saturate(1.3)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 22,
                            padding: "36px 28px",
                            position: "relative",
                            overflow: "hidden",
                            animation: "pulse-glow 6s ease-in-out infinite",
                        }}
                    >
                        {/* Top glow */}
                        <div style={{
                            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                            width: "60%", height: "1px",
                            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)",
                        }} />

                        {/* Logo */}
                        <div style={{ textAlign: "center", marginBottom: 28 }}>
                            <div style={{
                                width: 40, height: 40, margin: "0 auto 10px", borderRadius: 12,
                                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}><Zap size={18} color="rgba(255,255,255,0.5)" strokeWidth={1.5} /></div>
                            <div style={{
                                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                                color: "rgba(255,255,255,.2)", fontWeight: 500, fontFamily: "'Inter',sans-serif",
                            }}>Profile Preview</div>
                        </div>

                        {/* Avatar Preview */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                            <motion.div
                                key={selectedAvatar}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                style={{
                                    width: 112, height: 112, borderRadius: "50%",
                                    background: selectedAvatar !== null
                                        ? "rgba(120,100,255,0.08)"
                                        : "rgba(255,255,255,0.03)",
                                    border: selectedAvatar !== null
                                        ? "3px solid rgba(120,100,255,0.3)"
                                        : "3px dashed rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    overflow: "hidden",
                                    boxShadow: selectedAvatar !== null
                                        ? "0 0 40px rgba(120,100,255,0.12)"
                                        : "none",
                                    transition: "all 0.4s ease",
                                }}
                            >
                                {selectedAvatar !== null ? (
                                    <img src={avatars[selectedAvatar]} alt="Selected avatar"
                                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                                ) : (
                                    <div style={{
                                        fontSize: 32, color: "rgba(255,255,255,.08)",
                                    }}>?</div>
                                )}
                            </motion.div>
                        </div>

                        {/* Name Preview */}
                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={name || "placeholder"}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        fontSize: 20, fontWeight: 700,
                                        color: name.trim() ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.12)",
                                        fontFamily: "'Inter',sans-serif",
                                        letterSpacing: "0.01em",
                                    }}
                                >
                                    {name.trim() || "Your Name"}
                                </motion.div>
                            </AnimatePresence>
                            <div style={{
                                fontSize: 11, fontWeight: 400,
                                color: "rgba(255,255,255,.18)",
                                fontFamily: "'Inter',sans-serif",
                                marginTop: 6,
                            }}>Noodle Fitness Member</div>
                        </div>

                        {/* Status badges */}
                        <div style={{
                            display: "flex", justifyContent: "center", gap: 8, marginTop: 20,
                        }}>
                            {[
                                { icon: <Shield size={10} strokeWidth={1.5} />, label: "Ready" },
                                { icon: <Zap size={10} strokeWidth={1.5} />, label: "Active" },
                            ].map((b) => (
                                <div key={b.label} style={{
                                    padding: "5px 12px", borderRadius: 99,
                                    background: "rgba(255,255,255,.03)",
                                    border: "1px solid rgba(255,255,255,.05)",
                                    fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,.2)",
                                    fontFamily: "'Inter',sans-serif",
                                    display: "flex", alignItems: "center", gap: 5,
                                }}>{b.icon} {b.label}</div>
                            ))}
                        </div>

                        {/* Noodle X upgrade */}
                        <div style={{ marginTop: 24 }}>
                            <NoodleXButton variant="inline" />
                        </div>
                    </motion.div>

                    {/* ═══════ RIGHT: Name + Avatar Grid ═══════ */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        style={{
                            background: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(60px) saturate(1.3)",
                            WebkitBackdropFilter: "blur(60px) saturate(1.3)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 22,
                            padding: "32px 28px",
                            position: "relative",
                            overflow: "hidden",
                            maxHeight: "85vh",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Top glow */}
                        <div style={{
                            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                            width: "40%", height: "1px",
                            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)",
                        }} />

                        {/* Title */}
                        <div style={{ marginBottom: 24, flexShrink: 0 }}>
                            <div style={{
                                fontSize: 22, fontWeight: 800, letterSpacing: "0.03em",
                                background: "linear-gradient(135deg,rgba(255,255,255,.95),rgba(200,200,255,.65),rgba(255,255,255,.9))",
                                backgroundSize: "200% auto", animation: "shimmer 5s linear infinite",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                backgroundClip: "text", fontFamily: "'Inter',sans-serif",
                            }}>
                                Create Your Profile
                            </div>
                            <div style={{
                                fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,.22)",
                                fontFamily: "'Inter',sans-serif", marginTop: 5,
                            }}>
                                {isAvatarChangeOnly ? "Pick a new avatar for your profile" : "Choose a name and avatar to get started"}
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div style={{ overflowY: "auto", flex: 1, minHeight: 0, paddingRight: 4 }}>
                            {/* Name Input — hidden in avatar-change mode */}
                            {!isAvatarChangeOnly && (
                                <div style={{ marginBottom: 22 }}>
                                    <label style={{
                                        display: "block", marginBottom: 7,
                                        fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                                        color: "rgba(255,255,255,.22)", fontWeight: 500, fontFamily: "'Inter',sans-serif",
                                    }}>Display Name</label>
                                    <input
                                        type="text" placeholder="What should we call you?"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                        maxLength={30}
                                        style={{
                                            width: "100%", padding: "13px 16px", borderRadius: 12,
                                            fontSize: 14, fontWeight: 400, outline: "none",
                                            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.9)",
                                            fontFamily: "'Inter',sans-serif",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            transition: "all 0.3s ease",
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.18)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                                    />
                                </div>
                            )}

                            {/* Avatar Selection Label */}
                            <label style={{
                                display: "block", marginBottom: 12,
                                fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                                color: "rgba(255,255,255,.22)", fontWeight: 500, fontFamily: "'Inter',sans-serif",
                            }}>Choose Your Avatar</label>

                            {/* Avatar Grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(5, 1fr)",
                                gap: 16,
                                padding: "12px",
                                background: "rgba(255,255,255,0.015)",
                                borderRadius: 16,
                                border: "1px solid rgba(255,255,255,0.04)",
                            }}>
                                {avatars.map((url, i) => (
                                    <motion.button
                                        key={i} type="button"
                                        onClick={() => setSelectedAvatar(i)}
                                        whileHover={{ scale: 1.1, y: -3 }}
                                        whileTap={{ scale: 0.92 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        style={{
                                            width: 64, height: 64,
                                            borderRadius: "50%",
                                            border: selectedAvatar === i
                                                ? "3px solid rgba(74,222,128,0.7)"
                                                : "2px solid rgba(255,255,255,0.06)",
                                            background: selectedAvatar === i
                                                ? "rgba(74,222,128,0.08)"
                                                : "rgba(255,255,255,0.02)",
                                            cursor: "pointer",
                                            padding: 2,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            margin: "0 auto",
                                            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                                            boxShadow: selectedAvatar === i
                                                ? "0 0 0 4px rgba(74,222,128,0.15), 0 0 20px rgba(74,222,128,0.1)"
                                                : "none",
                                            position: "relative", overflow: "hidden",
                                        }}
                                    >
                                        <img
                                            src={url} alt={`Avatar ${i + 1}`}
                                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                                        />
                                        <AnimatePresence>
                                            {selectedAvatar === i && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    style={{
                                                        position: "absolute", bottom: -1, right: -1,
                                                        width: 18, height: 18, borderRadius: "50%",
                                                        background: "linear-gradient(135deg, rgba(74,222,128,0.95), rgba(34,197,94,0.95))",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 9, color: "#fff", fontWeight: 800,
                                                        border: "2px solid rgba(0,0,0,0.6)",
                                                    }}
                                                ><Check size={9} color="#fff" strokeWidth={3} /></motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        marginTop: 14, padding: "9px 13px", borderRadius: 10,
                                        background: "rgba(248,113,113,.06)", border: "1px solid rgba(248,113,113,.12)",
                                        color: "rgba(248,160,160,.9)", fontSize: 13, textAlign: "center",
                                        fontFamily: "'Inter',sans-serif", flexShrink: 0,
                                    }}
                                >{error}</motion.div>
                            )}
                        </AnimatePresence>

                        {/* Continue Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{ marginTop: 18, flexShrink: 0 }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                disabled={!canContinue || loading}
                                onClick={handleContinue}
                                className="w-full h-[52px] rounded-xl text-[13px] font-bold tracking-[0.08em] uppercase flex items-center justify-center transition-all bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (isAvatarChangeOnly ? "Saving…" : "Setting up…") : (isAvatarChangeOnly ? "Save Avatar →" : "Continue to Hub →")}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
