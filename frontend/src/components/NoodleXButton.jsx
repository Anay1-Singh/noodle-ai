import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

/**
 * Reusable "Upgrade to Noodle X" button.
 *
 * Variants:
 *   - "floating"  → fixed top-right, for Easy/Medium/Hard dashboards
 *   - "inline"    → in-flow banner style, for Auth/Onboarding/ProfileEdit
 *   - "nav"       → compact nav-bar item, for Landing nav / Hub header
 */
export default function NoodleXButton({ variant = 'floating' }) {
  const navigate = useNavigate();

  const go = (e) => {
    e.stopPropagation();
    navigate('/noodle-x');
  };

  /* ── NAV variant ─ compact, fits inside navbars/headers ── */
  if (variant === 'nav') {
    return (
      <motion.button onClick={go} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 10,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(124,58,237,0.1))',
          border: '1px solid rgba(251,191,36,0.2)',
          color: '#fbbf24', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.45)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(251,191,36,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <Crown style={{ width: 12, height: 12 }} />
        Noodle X
      </motion.button>
    );
  }

  /* ── INLINE variant ─ banner-style card, fits inside sections ── */
  if (variant === 'inline') {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        onClick={go}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', borderRadius: 12, cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.04), rgba(124,58,237,0.04))',
          border: '1px solid rgba(251,191,36,0.12)',
          transition: 'border-color 0.3s, background 0.3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.07), rgba(124,58,237,0.07))'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.12)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.04), rgba(124,58,237,0.04))'; }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(124,58,237,0.12))',
          border: '1px solid rgba(251,191,36,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Crown style={{ width: 13, height: 13, color: '#fbbf24' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter',sans-serif" }}>
            Upgrade to <span style={{ color: '#fbbf24' }}>Noodle X</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: "'Inter',sans-serif", marginTop: 1 }}>
            Smarter AI · Animated effects · Priority support
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(251,191,36,0.4)' }}>→</div>
      </motion.div>
    );
  }

  /* ── FLOATING variant (default) ─ fixed badge for dashboards ── */
  return (
    <motion.button onClick={go}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'fixed', top: 14, right: 14, zIndex: 70,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 10,
        fontSize: 11, fontWeight: 700,
        background: 'rgba(10,10,15,0.7)',
        border: '1px solid rgba(251,191,36,0.2)',
        color: '#fbbf24', cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.45)'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(251,191,36,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'; }}
    >
      <Crown style={{ width: 12, height: 12 }} />
      <span>Noodle X</span>
    </motion.button>
  );
}
