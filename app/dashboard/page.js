"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getDeadlines } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { StatCard, Badge, getDaysLeft, getTypeColor } from "@/components/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getClients(user.uid), getDeadlines(user.uid)]).then(([c, d]) => {
      setClients(c); setDeadlines(d); setLoading(false);
    });
  }, [user]);

  const overdue = deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) < 0);
  const dueSoon = deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) >= 0 && getDaysLeft(d.dueDate) <= 7);
  const filed = deadlines.filter(d => d.status === "Filed");
  const getClientName = id => clients.find(c => c.id === id)?.name || "Unknown";
  const urgent = [...overdue, ...dueSoon].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 10);

  const typeBreakdown = ["GST","TDS","ROC","MCA","IT"].map(type => ({
    type,
    total: deadlines.filter(d => d.type === type).length,
    filed: deadlines.filter(d => d.type === type && d.status === "Filed").length,
    overdue: deadlines.filter(d => d.type === type && d.status !== "Filed" && getDaysLeft(d.dueDate) < 0).length,
  })).filter(t => t.total > 0);

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "DM Serif Display, serif", fontSize: 30, fontWeight: 400 }}>
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
          <StatCard label="TOTAL CLIENTS" value={clients.length} icon="◉" color="var(--blue)" sub="registered clients" />
          <StatCard label="OVERDUE" value={overdue.length} icon="⚠" color="var(--red)" sub="need immediate action" />
          <StatCard label="DUE THIS WEEK" value={dueSoon.length} icon="◷" color="var(--gold)" sub="upcoming deadlines" />
          <StatCard label="FILED" value={filed.length} icon="✓" color="var(--accent)" sub={`of ${deadlines.length} total`} />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20 }}>
          {/* Urgent table */}
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontFamily:"DM Serif Display,serif", fontSize:18 }}>Urgent Filings</div>
              <Badge label={`${urgent.length} items`} color="var(--red)" />
            </div>
            {urgent.length === 0 ? (
              <div style={{ padding:40, textAlign:"center", color:"var(--muted)", fontSize:13 }}>🎉 No urgent filings!</div>
            ) : (
              <table className="table-base">
                <thead><tr><th>CLIENT</th><th>TYPE</th><th>PERIOD</th><th>DUE DATE</th><th>STATUS</th></tr></thead>
                <tbody>
                  {urgent.map(d => {
                    const days = getDaysLeft(d.dueDate);
                    return (
                      <tr key={d.id}>
                        <td style={{ fontWeight:500 }}>{getClientName(d.clientId)}</td>
                        <td><Badge label={d.type} color={getTypeColor(d.type)} /></td>
                        <td style={{ fontSize:12, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace" }}>{d.period}</td>
                        <td style={{ fontSize:12, fontFamily:"JetBrains Mono,monospace" }}>{d.dueDate}</td>
                        <td>
                          <Badge
                            label={days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
                            color={days < 0 ? "var(--red)" : days <= 3 ? "var(--orange)" : "var(--gold)"}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right column */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="card">
              <div style={{ fontFamily:"DM Serif Display,serif", fontSize:16, marginBottom:16 }}>Filing Types</div>
              {typeBreakdown.length === 0 ? (
                <div style={{ fontSize:13, color:"var(--muted)" }}>No data yet</div>
              ) : typeBreakdown.map(t => (
                <div key={t.type} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <Badge label={t.type} color={getTypeColor(t.type)} />
                    <span style={{ fontSize:11, color:"var(--muted)" }}>{t.filed}/{t.total}</span>
                  </div>
                  <div style={{ height:4, background:"var(--surface2)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${t.total > 0 ? (t.filed/t.total)*100 : 0}%`, background:getTypeColor(t.type), borderRadius:2 }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontFamily:"DM Serif Display,serif", fontSize:16, marginBottom:14 }}>Recent Clients</div>
              {clients.slice(0,5).map(c => (
                <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500 }}>{c.name}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>{c.city} · {c.type}</div>
                  </div>
                  <Badge label={c.type} color="var(--blue)" />
                </div>
              ))}
              {clients.length === 0 && <div style={{ fontSize:13, color:"var(--muted)" }}>No clients yet</div>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}