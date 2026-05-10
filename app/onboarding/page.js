"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router   = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firmName: "", address: "", city: "",
    state: "", phone: "", email: "",
    gst: "", pan: "", whatsapp: ""
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
  if (!form.firmName || !form.phone) {
    alert("Firm name and phone are required.");
    return;
  }
  setSaving(true);
  try {
    const { saveFirm } = await import("@/lib/firestore");
    await saveFirm(user.uid, form);

    // Send notification to admin with full firm details
    await fetch("https://sovary-compliance.vercel.app/api/notify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     user.displayName || user.email,
        email:    user.email,
        firmName: form.firmName,
        phone:    form.phone,
        city:     form.city,
        gst:      form.gst,
      }),
    });

  } catch (e) {
    console.log("Error:", e.message);
  }

  // Go to pending page NOT dashboard
  router.push("/pending");
  setSaving(false);
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

  return (
    <div style={{
      minHeight: "100vh", background: "#0c0f0a",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: 20,
    }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: 32, color: "#7eba5a"
          }}>SOVARY</div>
          <div style={{ fontSize: 14, color: "#6b7a63", marginTop: 8 }}>
            Set up your firm profile to get started
          </div>
        </div>

        <div style={{
          background: "#141a10",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: 28,
        }}>
          <div style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: 22, marginBottom: 24, color: "#e8ede4"
          }}>Firm Details</div>

          <label style={labelStyle}>FIRM NAME *</label>
          <input style={inputStyle} value={form.firmName}
            onChange={e => set("firmName", e.target.value)}
            placeholder="e.g. Sharma & Associates" />

          <label style={labelStyle}>ADDRESS</label>
          <input style={inputStyle} value={form.address}
            onChange={e => set("address", e.target.value)}
            placeholder="Street address" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>CITY</label>
              <input style={inputStyle} value={form.city}
                onChange={e => set("city", e.target.value)}
                placeholder="City" />
            </div>
            <div>
              <label style={labelStyle}>STATE</label>
              <input style={inputStyle} value={form.state}
                onChange={e => set("state", e.target.value)}
                placeholder="State" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>PHONE *</label>
              <input style={inputStyle} value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="10-digit number" />
            </div>
            <div>
              <label style={labelStyle}>WHATSAPP</label>
              <input style={inputStyle} value={form.whatsapp}
                onChange={e => set("whatsapp", e.target.value)}
                placeholder="WhatsApp number" />
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
                onChange={e => set("gst", e.target.value)}
                placeholder="GSTIN" />
            </div>
            <div>
              <label style={labelStyle}>PAN</label>
              <input style={inputStyle} value={form.pan}
                onChange={e => set("pan", e.target.value)}
                placeholder="PAN" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={saving} style={{
            width: "100%", marginTop: 8,
            background: saving ? "rgba(126,186,90,0.5)" : "#7eba5a",
            color: "#0c0f0a", border: "none", borderRadius: 8,
            padding: "12px 20px", fontSize: 13, fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif",
          }}>
            {saving ? "Saving…" : "Complete Setup →"}
          </button>
        </div>
      </div>
    </div>
  );
}