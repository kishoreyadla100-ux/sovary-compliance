"use client";

export function Spinner({ size = 16 }) {
  return (
    <div style={{
      width: size, height: size,
      border: "2px solid rgba(255,255,255,0.1)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      display: "inline-block",
      flexShrink: 0,
    }} />
  );
}

export function Badge({ label, color = "var(--accent)" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 600,
      fontFamily: "JetBrains Mono, monospace",
      letterSpacing: "0.05em",
      color, background: color + "18",
      border: `1px solid ${color}33`,
    }}>{label}</span>
  );
}

export function Card({ children, style = {} }) {
  return <div className="card" style={style}>{children}</div>;
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "JetBrains Mono, monospace", marginBottom: 6, letterSpacing: "0.08em" }}>{label}</div>}
      <input className="input-base" {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "JetBrains Mono, monospace", marginBottom: 6, letterSpacing: "0.08em" }}>{label}</div>}
      <select className="input-base" style={{ cursor: "pointer" }} {...props}>{children}</select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "JetBrains Mono, monospace", marginBottom: 6, letterSpacing: "0.08em" }}>{label}</div>}
      <textarea className="input-base" style={{ resize: "vertical", minHeight: 80 }} {...props} />
    </div>
  );
}

export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        <h1 style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, fontWeight: 400 }}>{title}</h1>
        {sub && <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>{sub}</div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, color = "var(--accent)", icon }) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em" }}>{label}</div>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 32, fontFamily: "DM Serif Display, serif", color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function getDaysLeft(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(dueDate) - today) / (1000 * 60 * 60 * 24));
}

export function getTypeColor(type) {
  return {
    GST: "var(--blue)",
    TDS: "var(--gold)",
    ROC: "#a78bfa",
    MCA: "var(--orange)",
    IT:  "var(--accent)",
  }[type] || "var(--muted)";
}

export function getStatusColor(status) {
  return {
    Filed:   "var(--accent)",
    Overdue: "var(--red)",
    Pending: "var(--gold)",
  }[status] || "var(--muted)";
}

export function fmt(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}