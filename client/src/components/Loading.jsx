// place this file at: ./components/Loading.jsx
import React from "react";

export default function Loading() {
  // Brand tokens (kept as variables to make tweaks easy)
  const COLORS = {
    primary: "#0ea45f",
    primaryDarker: "#0b8f4e",
    highlight: "#a6f4c5",
    bgDark: "#050f0a",
    pageGradientTop: "#06130b",
    pageGradientMid: "#081710",
    pageGradientBottom: "#031007",
    cardSurface: "rgba(255,255,255,0.03)",
    border: "#0b3b21",
    text: "#f1f5f2",
    textGray: "#d1d5d2",
    textLow: "#8b918d",
  };

  const pageBackground = `linear-gradient(to bottom, ${COLORS.pageGradientTop}, ${COLORS.pageGradientMid}, ${COLORS.pageGradientBottom}), radial-gradient(circle at 70% 0%, rgba(8,52,31,0.6), transparent 70%)`;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
        background: pageBackground,
        backgroundColor: COLORS.bgDark,
        fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif",
      }}
    >
      <div
        aria-hidden="false"
        style={{
          width: 360,
          maxWidth: "92%",
          padding: 28,
          boxSizing: "border-box",
          background: COLORS.cardSurface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        {/* Decorative header / subtle glowing dot */}
        <div
          style={{
            height: 8,
            width: 64,
            margin: "0 auto 18px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${COLORS.primaryDarker}, ${COLORS.highlight})`,
            opacity: 0.95,
            boxShadow: `0 6px 18px ${COLORS.primaryDarker}33`,
          }}
        />

        {/* Spinner */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <svg
            width="72"
            height="72"
            viewBox="0 0 50 50"
            aria-hidden="true"
            style={{ display: "block" }}
          >
            <defs>
              <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={COLORS.primary} />
                <stop offset="100%" stopColor={COLORS.primaryDarker} />
              </linearGradient>
            </defs>

            {/* faint track */}
            <circle
              cx="25"
              cy="25"
              r="18"
              fill="none"
              stroke={COLORS.textLow}
              strokeWidth="4"
              strokeOpacity="0.08"
            />

            {/* animated arc */}
            <path
              id="arc"
              d="M25 7a18 18 0 1 1-0.01 0"
              fill="none"
              stroke="url(#lg)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="85"
              strokeDashoffset="60"
              style={{
                transformOrigin: "25px 25px",
                animation: "spin 1s linear infinite",
                filter: "drop-shadow(0 6px 8px rgba(14,164,95,0.18))",
              }}
            />

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.text,
            marginBottom: 8,
          }}
        >
          Loading…
        </div>

        {/* Subtitle / helper text */}
        <div
          style={{
            fontSize: 13,
            color: COLORS.textGray,
            lineHeight: "1.4",
            marginBottom: 14,
          }}
        >
          Preparing your session — this usually takes a few seconds.
        </div>

        {/* Progress hint row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: COLORS.primary,
              boxShadow: `0 4px 12px ${COLORS.primary}44`,
            }}
          />
          <div style={{ fontSize: 12, color: COLORS.textLow }}>Connecting to services</div>
        </div>
      </div>
    </div>
  );
}
