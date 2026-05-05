"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const [form, setForm] = useState({
    firmName: "", address: "", city: "", state: "",
    phone: "", email: "", gst: "", pan: "", whatsapp: ""
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    if (user) {
      import("@/lib/firestore").then(({ getFirm }) => {
        getFirm(user.uid).then(f => { if (f) setForm(f); }).catch(() => {});
      });
    }
  }, [user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { saveFirm } = await import("@/lib/firestore");
      await saveFirm(user.uid, form);
    } catch (e) {
      console.log("Save error:", e);
    }
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle = {
    width: "100%", background: "#1a2214",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8, padding: "10px 14px",
    color: "#e8ede4", fontSize: 13,
    fontFamily: "Inter, sans-serif", outline: "none",
    marginBottom: 14,
  };

  const labelStyle = {
    fontSize: 11, color: "#6b7a63",
    fontFamily: "JetBrains Mono, monospace",
    marginBottom: 6, letterSpacing: "0.08em",
    display: "block",
  };

  const planColor = userData?.status === "active" ? "#7eba5a" :
    userData?.status === "trial" ? "#d4a843" : "#e05c5c";

  return (
    <AppShell>
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, fontWeight: 400 }}>Settings</h1>
          <p style={{ color: "#6b7a63", fontSize: 12, marginTop: 4 }}>Manage your firm profile and account</p>
        </div>

        {/* Subscription */}
        <div style={{ background: "#141a10", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 18, marginBottom: 14, color: "#e8ede4" }}>
            Account & Subscription
          </div>
          <div style={{ fontSize: 13, color: "#e8ede4", marginBottom: 8 }}>
            Plan: <strong style={{ color: planColor }}>
              {userData?.status === "active" ? "Active" : userData?.status === "trial" ? "Free Trial" : "Expired"}
            </strong>
          </div>
          <div style={{ fontSize: 12, color: "#6b7a63", marginBottom: 16 }}>{user?.email}</div>

          {/* Plans */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
            {[
              { name: "Starter",      price: "₹1,999", clients: "50 clients",      color: "#6b7a63" },
              { name: "Professional", price: "₹3,999", clients: "200 clients",     color: "#7eba5a" },
              { name: "Enterprise",   price: "₹7,999", clients: "Unlimited",       color: "#d4a843" },
            ].map(plan => (
              <div key={plan.name} style={{
                background: "#1a2214",
                border: `1px solid ${plan.color}33`,
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 12, color: plan.color, fontWeight: 600, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#e8ede4" }}>{plan.price}</div>
                <div style={{ fontSize: 11, color: "#6b7a63" }}>/month</div>
                <div style={{ fontSize: 11, color: "#6b7a63", marginTop: 6 }}>{plan.clients}</div>
              </div>
            ))}
          </div>

          {userData?.status !== "active" && (
            <a href="mailto:kishoreyadla100@gmail.com?subject=SOVARY Upgrade Request"
              style={{
                display: "inline-block", marginTop: 16,
                background: "#7eba5a", color: "#0c0f0a",
                borderRadius: 8, padding: "9px 18px",
                fontSize: 13, fontWeight: 600, textDecoration: "none"
              }}>
              Upgrade Now
            </a>
          )}
        </div>

        {/* Firm Profile */}
        <div style={{ background: "#141a10", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 18, marginBottom: 20, color: "#e8ede4" }}>
            Firm Profile
          </div>

          <label style={labelStyle}>FIRM NAME</label>
          <input style={inputStyle} value={form.firmName}
            onChange={e => set("firmName", e.target.value)} placeholder="Your firm name" />

          <label style={labelStyle}>ADDRESS</label>
          <input style={inputStyle} value={form.address}
            onChange={e => set("address", e.target.value)} placeholder="Street address" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>CITY</label>
              <input style={inputStyle} value={form.city}
                onChange={e => set("city", e.target.value)} placeholder="City" />
            </div>
            <div>
              <label style={labelStyle}>STATE</label>
              <input style={inputStyle} value={form.state}
                onChange={e => set("state", e.target.value)} placeholder="State" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>PHONE</label>
              <input style={inputStyle} value={form.phone}
                onChange={e => set("phone", e.target.value)} placeholder="Phone" />
            </div>
            <div>
              <label style={labelStyle}>WHATSAPP</label>
              <input style={inputStyle} value={form.whatsapp}
                onChange={e => set("whatsapp", e.target.value)} placeholder="WhatsApp" />
            </div>
          </div>

          <label style={labelStyle}>EMAIL</label>
          <input style={inputStyle} value={form.email}
            onChange={e => set("email", e.target.value)}
            placeholder="firm@email.com" type="email" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>GST NUMBER</label>
              <input style={inputStyle} value={form.gst}
                onChange={e => set("gst", e.target.value)} placeholder="GSTIN" />
            </div>
            <div>
              <label style={labelStyle}>PAN</label>
              <input style={inputStyle} value={form.pan}
                onChange={e => set("pan", e.target.value)} placeholder="PAN" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", marginTop: 8,
            background: saved ? "rgba(126,186,90,0.13)" : "#7eba5a",
            color: saved ? "#7eba5a" : "#0c0f0a",
            border: saved ? "1px solid rgba(126,186,90,0.3)" : "none",
            borderRadius: 8, padding: "12px 20px",
            fontSize: 13, fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
          }}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}