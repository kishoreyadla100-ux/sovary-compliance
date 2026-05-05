"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getDeadlines, addNotification, getNotifications } from "@/lib/firestore";
import { getFirm } from "@/lib/firestore";
import { geminiDraft } from "@/lib/gemini";
import { useEffect, useState } from "react";
import { Badge, PageHeader, Spinner, getDaysLeft, getTypeColor } from "@/components/ui";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [clients,     setClients]     = useState([]);
  const [deadlines,   setDeadlines]   = useState([]);
  const [firm,        setFirm]        = useState(null);
  const [log,         setLog]         = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("center");
  const [drafts,      setDrafts]      = useState({});
  const [generating,  setGenerating]  = useState(null);
  const [sending,     setSending]     = useState(null);
  const [success,     setSuccess]     = useState("");
  const [bulkSending, setBulkSending] = useState(false);

  const load = async () => {
    const [c, d, n, f] = await Promise.all([
      getClients(user.uid), getDeadlines(user.uid),
      getNotifications(user.uid), getFirm(user.uid),
    ]);
    setClients(c); setDeadlines(d); setLog(n); setFirm(f); setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const getClient  = id => clients.find(c => c.id === id);
  const urgent     = deadlines.filter(d => d.status !== "Filed").sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const showSuccess = msg => { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); };

  const generateDraft = async d => {
    setGenerating(d.id);
    const client = getClient(d.clientId);
    const days   = getDaysLeft(d.dueDate);
    const prompt = `Write a short professional WhatsApp message (under 100 words) for an Indian CA firm to send to their client as a compliance reminder.
Client: ${client?.name}
Filing: ${d.type} - ${d.subtype}
Period: ${d.period}
Due: ${d.dueDate} (${days < 0 ? `OVERDUE by ${Math.abs(days)} days` : days === 0 ? "Due TODAY" : `${days} days left`})
End with: "Regards, ${firm?.firmName || "Your CA Firm"}"
Return only the message text.`;
    try {
      const text = await geminiDraft(prompt);
      setDrafts(p => ({ ...p, [d.id]: text }));
    } catch (e) {
      setDrafts(p => ({ ...p, [d.id]: `Error: ${e.message}` }));
    }
    setGenerating(null);
  };

  const sendWhatsApp = async (d, message) => {
    const client = getClient(d.clientId);
    const phone  = client?.whatsapp || client?.phone;
    if (!phone) { alert("No phone number for this client."); return; }
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, "_blank");
    await addNotification(user.uid, {
      clientId: d.clientId, clientName: client?.name,
      filing: `${d.type} - ${d.subtype}`, period: d.period,
      channel: "whatsapp", message,
    });
    await load();
    showSuccess(`✓ WhatsApp opened for ${client?.name}`);
  };

  const sendEmail = async (d, message) => {
    setSending(d.id);
    const client = getClient(d.clientId);
    if (!client?.email) { alert("No email for this client. Add email in Clients page."); setSending(null); return; }
    const days = getDaysLeft(d.dueDate);
    try {
      const res  = await fetch("/api/send-reminder", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName:    client.name,
          clientEmail:   client.email,
          filingType:    d.type,
          filingSubtype: d.subtype,
          period:        d.period,
          dueDate:       d.dueDate,
          daysLeft:      days,
          firmName:      firm?.firmName,
          firmEmail:     firm?.email,
          firmPhone:     firm?.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await addNotification(user.uid, {
          clientId: d.clientId, clientName: client?.name,
          filing: `${d.type} - ${d.subtype}`, period: d.period,
          channel: "email", message: message || "Email sent",
        });
        await load();
        showSuccess(`✓ Email sent to ${client?.name}`);
      } else {
        alert("Email failed: " + data.error);
      }
    } catch (e) { alert("Error: " + e.message); }
    setSending(null);
  };

  const bulkSendEmails = async () => {
    if (!confirm(`Send email reminders to ALL ${urgent.length} pending clients?`)) return;
    setBulkSending(true);
    let count = 0;
    for (const d of urgent) {
      const client = getClient(d.clientId);
      if (!client?.email) continue;
      await sendEmail(d, drafts[d.id] || "");
      count++;
      await new Promise(r => setTimeout(r, 500));
    }
    showSuccess(`✓ Bulk email sent to ${count} clients!`);
    setBulkSending(false);
  };

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader
          title="Notifications"
          sub="AI-drafted reminders · WhatsApp · Auto Email"
          action={
            <button onClick={bulkSendEmails} disabled={bulkSending} style={{
              background:"rgba(126,186,90,0.1)", color:"var(--accent)",
              border:"1px solid rgba(126,186,90,0.3)", borderRadius:8,
              padding:"9px 16px", fontSize:12, cursor:"pointer",
              display:"flex", alignItems:"center", gap:6,
              fontFamily:"JetBrains Mono,monospace",
            }}>
              {bulkSending ? <><Spinner size={12} /> Sending…</> : "⚡ Bulk Email All"}
            </button>
          }
        />

        {success && (
          <div style={{ background:"rgba(126,186,90,0.08)", border:"1px solid rgba(126,186,90,0.3)", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:13, color:"var(--accent)" }}>
            {success}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, padding:4, width:"fit-content" }}>
          {[{ id:"center", label:"🔔 Notification Center" }, { id:"log", label:`📋 Sent Log (${log.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "rgba(126,186,90,0.13)" : "transparent",
              color:      tab === t.id ? "var(--accent)" : "var(--muted)",
              border:     tab === t.id ? "1px solid rgba(126,186,90,0.3)" : "1px solid transparent",
              borderRadius:6, padding:"7px 18px", fontSize:12,
              cursor:"pointer", fontFamily:"JetBrains Mono,monospace",
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div> : (
          <>
            {tab === "center" && (
              <div>
                {urgent.length === 0 ? (
                  <div style={{ textAlign:"center", padding:60, color:"var(--muted)" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
                    <div>No pending filings to notify!</div>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {urgent.map(d => {
                      const client   = getClient(d.clientId);
                      const days     = getDaysLeft(d.dueDate);
                      const urgColor = days < 0 ? "var(--red)" : days === 0 ? "var(--orange)" : days <= 3 ? "var(--orange)" : "var(--gold)";
                      const draft    = drafts[d.id];
                      const isSending = sending === d.id;
                      return (
                        <div key={d.id} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden" }}>
                          <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                            <div style={{ width:3, height:44, borderRadius:2, background:urgColor, flexShrink:0 }} />
                            <div style={{ flex:1, minWidth:160 }}>
                              <div style={{ fontWeight:600, fontSize:14 }}>{client?.name || "Unknown"}</div>
                              <div style={{ fontSize:11, color:"var(--muted)", marginTop:3 }}>
                                <Badge label={d.type} color={getTypeColor(d.type)} />
                                <span style={{ marginLeft:6 }}>{d.subtype} · {d.period}</span>
                              </div>
                              <div style={{ display:"flex", gap:6, marginTop:5 }}>
                                {(client?.phone || client?.whatsapp) && <span style={{ fontSize:10, color:"#25d366", background:"rgba(37,211,102,0.1)", padding:"2px 6px", borderRadius:4 }}>💬 WhatsApp</span>}
                                {client?.email && <span style={{ fontSize:10, color:"var(--blue)", background:"rgba(90,184,224,0.1)", padding:"2px 6px", borderRadius:4 }}>📧 Email</span>}
                                {!client?.phone && !client?.email && <span style={{ fontSize:10, color:"var(--red)", background:"rgba(224,92,92,0.1)", padding:"2px 6px", borderRadius:4 }}>⚠ No contact</span>}
                              </div>
                            </div>
                            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12, color:urgColor, fontWeight:600, textAlign:"right", minWidth:90 }}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
                            </div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              {client?.email && (
                                <button onClick={() => sendEmail(d, "")} disabled={isSending} style={{ background:"rgba(90,184,224,0.1)", color:"var(--blue)", border:"1px solid rgba(90,184,224,0.3)", borderRadius:7, padding:"6px 12px", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                                  {isSending ? <><Spinner size={10} /> Sending…</> : "📧 Email Now"}
                                </button>
                              )}
                              <button onClick={() => generateDraft(d)} disabled={generating === d.id} style={{ background: draft ? "rgba(126,186,90,0.1)" : "rgba(90,184,224,0.1)", color: draft ? "var(--accent)" : "var(--blue)", border:`1px solid ${draft ? "rgba(126,186,90,0.3)" : "rgba(90,184,224,0.3)"}`, borderRadius:7, padding:"6px 12px", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                                {generating === d.id ? <><Spinner size={10} /> Drafting…</> : draft ? "✓ Re-draft" : "✦ AI Draft"}
                              </button>
                            </div>
                          </div>

                          {draft && (
                            <div style={{ margin:"0 16px 16px", borderTop:"1px solid var(--border)", paddingTop:14 }}>
                              <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace", marginBottom:8, letterSpacing:".1em" }}>AI DRAFT — EDIT BEFORE SENDING</div>
                              <textarea value={draft} onChange={e => setDrafts(p => ({ ...p, [d.id]: e.target.value }))}
                                rows={4} className="input-base" style={{ resize:"vertical", fontSize:13, lineHeight:1.6, marginBottom:10 }} />
                              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                {(client?.phone || client?.whatsapp) && (
                                  <button onClick={() => sendWhatsApp(d, draft)} style={{ background:"rgba(37,211,102,0.1)", color:"#25d366", border:"1px solid rgba(37,211,102,0.3)", borderRadius:7, padding:"8px 16px", fontSize:12, cursor:"pointer" }}>
                                    💬 Send via WhatsApp
                                  </button>
                                )}
                                {client?.email && (
                                  <button onClick={() => sendEmail(d, draft)} disabled={isSending} style={{ background:"rgba(90,184,224,0.1)", color:"var(--blue)", border:"1px solid rgba(90,184,224,0.3)", borderRadius:7, padding:"8px 16px", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                                    {isSending ? <><Spinner size={12} /> Sending…</> : "📧 Send via Email"}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "log" && (
              <div className="card" style={{ padding:0, overflow:"hidden" }}>
                {log.length === 0 ? (
                  <div style={{ padding:48, textAlign:"center", color:"var(--muted)", fontSize:13 }}>No notifications sent yet.</div>
                ) : (
                  <table className="table-base">
                    <thead><tr><th>CLIENT</th><th>FILING</th><th>CHANNEL</th><th>SENT AT</th></tr></thead>
                    <tbody>
                      {log.map(n => (
                        <tr key={n.id}>
                          <td style={{ fontWeight:500 }}>{n.clientName}</td>
                          <td style={{ fontSize:12, color:"var(--muted)" }}>{n.filing} · {n.period}</td>
                          <td><span style={{ color: n.channel === "whatsapp" ? "#25d366" : "var(--blue)", fontSize:12 }}>{n.channel === "whatsapp" ? "💬 WhatsApp" : "📧 Email"}</span></td>
                          <td style={{ fontSize:11, fontFamily:"JetBrains Mono,monospace", color:"var(--muted)" }}>
                            {n.sentAt?.toDate ? n.sentAt.toDate().toLocaleString("en-IN") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}