"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { signInWithGoogle, user, userData, loading } = useAuth();
  const router = useRouter();
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.status === "pending") router.push("/pending");
      else router.push("/dashboard");
    }
  }, [user, userData, loading]);

  const handleLogin = async () => {
    setBusy(true); setError("");
    const result = await signInWithGoogle();
    if (!result.success) {
      setError("Sign in failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0b0e09;
          --surface: #111408;
          --surface2: #181c0f;
          --border: rgba(255,255,255,0.06);
          --border2: rgba(255,255,255,0.10);
          --text: #e8ede2;
          --muted: #606b56;
          --accent: #7eba5a;
          --red: #d95f5f;
        }
        html, body { height: 100%; }
        .root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Instrument Sans', sans-serif;
          padding: 24px;
          overflow: hidden;
          position: relative;
        }
        .root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(126,186,90,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(126,186,90,0.04) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
        }
        .orb {
          position: fixed;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(126,186,90,0.07) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:.7; transform:translate(-50%,-50%) scale(1.1); }
        }
        .card {
          width: 100%; max-width: 420px;
          position: relative; z-index: 1;
          animation: up .6s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes up {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .logo { text-align: center; margin-bottom: 36px; }
        .logo-icon {
          width: 60px; height: 60px;
          border-radius: 16px;
          margin: 0 auto 14px;
          background: rgba(126,186,90,0.08);
          border: 1px solid rgba(126,186,90,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; color: var(--accent);
        }
        .logo-name {
          font-family: 'DM Serif Display', serif;
          font-size: 34px; color: var(--accent); margin-bottom: 4px;
        }
        .logo-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: var(--muted);
          letter-spacing: .2em; text-transform: uppercase;
        }
        .box {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 16px; padding: 32px;
          position: relative; overflow: hidden;
        }
        .box::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(126,186,90,0.4), transparent);
        }
        .box-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: var(--text); margin-bottom: 6px;
        }
        .box-sub {
          font-size: 13px; color: var(--muted);
          line-height: 1.6; margin-bottom: 24px;
        }
        .features { margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
        .feat { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); }
        .feat-icon {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          background: rgba(126,186,90,0.08); border: 1px solid rgba(126,186,90,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: var(--accent);
          font-family: 'JetBrains Mono', monospace;
        }
        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text {
          font-size: 10px; color: var(--muted);
          font-family: 'JetBrains Mono', monospace; letter-spacing: .1em;
        }
        .error {
          background: rgba(217,95,95,0.08);
          border: 1px solid rgba(217,95,95,0.25);
          border-radius: 8px; padding: 11px 14px; margin-bottom: 14px;
          font-size: 13px; color: var(--red);
          display: flex; align-items: center; gap: 8px;
        }
        .google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          background: #fff; color: #1a1a1a;
          border: none; border-radius: 10px;
          padding: 14px 20px; font-size: 14px; font-weight: 600;
          font-family: 'Instrument Sans', sans-serif;
          cursor: pointer;
          transition: all .2s cubic-bezier(.16,1,.3,1);
          position: relative; overflow: hidden;
        }
        .google-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,.3);
        }
        .google-btn:active:not(:disabled) { transform: translateY(0); }
        .google-btn:disabled { opacity:.7; cursor:not-allowed; }
        .shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          transform: translateX(-100%);
          animation: shim 1.5s infinite;
        }
        @keyframes shim { to { transform: translateX(100%); } }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(0,0,0,.15);
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin .6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
        .pill {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 6px;
          background: var(--surface2); border: 1px solid var(--border);
          font-size: 11px; color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
        }
        .pill-dot {
          width: 5px; height: 5px;
          border-radius: 50%; background: var(--accent); flex-shrink: 0;
        }
        .notice {
          margin-top: 16px; font-size: 11px;
          color: var(--muted); text-align: center; line-height: 1.6;
        }
        .notice a { color: var(--accent); text-decoration: none; }
        .footer {
          text-align: center; margin-top: 24px;
          font-size: 11px; color: var(--muted);
        }
      `}</style>

      <div className="root">
        <div className="orb" />
        <div className="card">

          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">◈</div>
            <div className="logo-name">SOVARY</div>
            <div className="logo-tag">Compliance Platform</div>
          </div>

          {/* Box */}
          <div className="box">
            <div className="box-title">Welcome back</div>
            <div className="box-sub">
              Sign in to manage your firm's compliance deadlines, clients and filings.
            </div>

            {/* Features */}
            <div className="features">
              {[
                ["◉", "Manage unlimited clients & deadlines"],
                ["◷", "GST · TDS · ROC · MCA · IT tracking"],
                ["✦", "Gemini AI compliance assistant"],
                ["🔔", "WhatsApp & Email notifications"],
              ].map(([icon, text]) => (
                <div className="feat" key={text}>
                  <div className="feat-icon">{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text">SIGN IN WITH</div>
              <div className="divider-line" />
            </div>

            {error && <div className="error">⚠ {error}</div>}

            {/* Google Button */}
            <button className="google-btn" onClick={handleLogin} disabled={busy}>
              {busy && <div className="shimmer" />}
              {busy ? (
                <><div className="spinner" /> Signing in…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Pills */}
            <div className="pills">
              <div className="pill"><div className="pill-dot" />3 weeks free trial</div>
              <div className="pill"><div className="pill-dot" />₹1,999/month after</div>
              <div className="pill"><div className="pill-dot" />Admin approval</div>
            </div>

            <div className="notice">
              New accounts require admin approval before access.<br />
              Contact <a href="mailto:kishoreyadla100@gmail.com">kishoreyadla100@gmail.com</a>
            </div>
          </div>

          <div className="footer">© 2025 SOVARY Compliance · All rights reserved</div>
        </div>
      </div>
    </>
  );
}