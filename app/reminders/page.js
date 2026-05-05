"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getDeadlines } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { Badge, PageHeader, Spinner, getDaysLeft, getTypeColor } from "@/components/ui";

export default function RemindersPage() {
  const { user } = useAuth();
  const [clients,   setClients]   = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getClients(user.uid), getDeadlines(user.uid)]).then(([c, d]) => {
      setClients(c); setDeadlines(d); setLoading(false);
    });
  }, [user]);

  const getClientName = id => clients.find(c => c.id === id)?.name || "Unknown";
  const getClient     = id => clients.find(c => c.id === id);

  const pending = deadlines
    .filter(d => d.status !== "Filed")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdue = pending.filter(d => getDaysLeft(d.dueDate) < 0);
  const today   = pending.filter(d => getDaysLeft(d.dueDate) === 0);
  const week    = pending.filter(d => getDaysLeft(d.dueDate) > 0 && getDaysLeft(d.dueDate) <= 7);
  const month   = pending.filter(d => getDaysLeft(d.dueDate) > 7 && getDaysLeft(d.dueDate) <= 30);
  const future  = pending.filter(d => getDaysLeft(d.dueDate) > 30);

  const openWhatsApp = d => {
    const client = getClient(d.clientId);
    const days   = getDaysLeft(d.dueDate);
    const msg    = encodeURIComponent(
      `Dear ${client?.name},\n\nThis is a reminder regarding your compliance filing:\n\n📋 Filing: ${d.type} - ${d.subtype}\n📅 Period: ${d.period}\n⏰ Due Date: ${d.dueDate}\n${days < 0 ? `⚠️ OVERDUE by ${Math.abs(days)} days` : `✅ ${days} days remaining`}\n\nPlease ensure timely filing to avoid penalties.\n\nRegards,\nCompliance Team`
    );
    const phone = client?.whatsapp || client?.phone;
    window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
  };

  const Section = ({ title, items, color, icon }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <span style={{ fontFamily:"DM Serif Display,serif", fontSize:18 }}>{title}</span>
          <Badge label={items.length} color={color} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {items.map(d => {
            const days   = getDaysLeft(d.dueDate);
            const client = getClient(d.clientId);
            return (
              <div key={d.id} style={{
                background:"var(--surface)",
                border:`1px solid var(--border)`,
                borderLeft:`3px solid ${color}`,
                borderRadius:10, padding:"14px 16px",
                display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"
              }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{getClientName(d.clientId)}</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
                    <Badge label={d.type} color={getTypeColor(d.type)} />
                    <span style={{ marginLeft:8 }}>{d.subtype} · {d.period}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12, color:"var(--muted)" }}>{d.dueDate}</div>
                  <div style={{ fontSize:11, color, fontWeight:600, marginTop:2 }}>
                    {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Due Today!" : `${days} days left`}
                  </div>
                </div>
                {(client?.phone || client?.whatsapp) && (
                  <button onClick={() => openWhatsApp(d)} style={{
                    background:"rgba(37,211,102,0.1)", color:"#25d366",
                    border:"1px solid rgba(37,211,102,0.3)",
                    borderRadius:7, padding:"7px 14px", fontSize:12,
                    cursor:"pointer", whiteSpace:"nowrap"
                  }}>💬 WhatsApp</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader title="Reminders" sub="Timeline of all pending filings" />
        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign:"center", padding:60, color:"var(--muted)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
            <div style={{ fontFamily:"DM Serif Display,serif", fontSize:22 }}>All caught up!</div>
            <div style={{ fontSize:13, marginTop:8 }}>No pending filings.</div>
          </div>
        ) : (
          <>
            <Section title="Overdue"    items={overdue} color="var(--red)"    icon="🚨" />
            <Section title="Due Today"  items={today}   color="var(--orange)" icon="⏰" />
            <Section title="This Week"  items={week}    color="var(--gold)"   icon="📅" />
            <Section title="This Month" items={month}   color="var(--blue)"   icon="📋" />
            <Section title="Upcoming"   items={future}  color="var(--muted)"  icon="🗓" />
          </>
        )}
      </div>
    </AppShell>
  );
}