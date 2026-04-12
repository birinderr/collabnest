import React, { useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps extends ToastMessage {
  onDismiss: (id: string) => void;
  duration?: number;
}

const CONFIGS = {
  success: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5" fill="rgba(52,211,153,0.15)" stroke="rgba(52,211,153,0.4)" strokeWidth="1"/>
        <path d="M4.5 7.5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent:  '#34d399',
    bg:      'rgba(52,211,153,0.06)',
    border:  'rgba(52,211,153,0.18)',
    bar:     'rgba(52,211,153,0.5)',
    label:   'Success',
  },
  error: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5" fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.4)" strokeWidth="1"/>
        <path d="M7.5 4.5v3.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7.5" cy="10.5" r="0.75" fill="#f87171"/>
      </svg>
    ),
    accent:  '#f87171',
    bg:      'rgba(248,113,113,0.06)',
    border:  'rgba(248,113,113,0.18)',
    bar:     'rgba(248,113,113,0.5)',
    label:   'Error',
  },
  info: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6.5" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.4)" strokeWidth="1"/>
        <path d="M7.5 5v5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7.5" cy="4" r="0.75" fill="#60a5fa"/>
      </svg>
    ),
    accent:  '#60a5fa',
    bg:      'rgba(96,165,250,0.06)',
    border:  'rgba(96,165,250,0.18)',
    bar:     'rgba(96,165,250,0.5)',
    label:   'Info',
  },
} as const;

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss, duration = 4000 }) => {
  const cfg = CONFIGS[type];
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef  = useRef<number>(0);
  const rafRef    = useRef<number>(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Shrink progress bar and auto-dismiss
  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(id), 320);
    }, duration);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearDismissTimer();
    };
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    cancelAnimationFrame(rafRef.current);
    clearDismissTimer();
    setExiting(true);
    setTimeout(() => onDismiss(id), 320);
  };

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(24px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(24px) scale(0.96); }
        }
      `}</style>

      <div
        role="alert"
        aria-live="polite"
        style={{
          position: 'relative',
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--bg-elevated, #181b24)',
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
          animation: exiting
            ? 'toastOut 0.32s cubic-bezier(0.4,0,1,1) forwards'
            : 'toastIn  0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Left accent strip */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: cfg.accent,
          opacity: 0.8,
          borderRadius: '12px 0 0 12px',
        }} />

        {/* Body */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '11px',
          padding: '13px 14px 13px 18px',
        }}>
          {/* Icon */}
          <div style={{ flexShrink: 0, marginTop: '1px' }}>
            {cfg.icon}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: cfg.accent,
              marginBottom: '2px',
              lineHeight: 1,
            }}>
              {cfg.label}
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-primary, #eaecf2)',
              lineHeight: '1.45',
              fontWeight: 400,
            }}>
              {message}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: 'var(--text-muted, #4e5568)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              transition: 'color 0.15s ease, background 0.15s ease',
              marginTop: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary, #858ca6)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted, #4e5568)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: cfg.bar,
            borderRadius: '0 2px 2px 0',
            transition: 'width 0.1s linear',
          }} />
        </div>
      </div>
    </>
  );
};

export default Toast;