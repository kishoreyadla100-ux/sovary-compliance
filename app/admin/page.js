"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getAllUsers, updateUser } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { PageHeader, Badge, Spinner } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { userData }  = useAuth();
  const router        = useRouter();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    if (userData && userData.role !== "admin") { router.push("/dashboard"); return; }
    if (userData?.role === "admin") {
      getAllUsers().then(u => { setUsers(u); setLoading(false); });
    }
  }, [userData]);

  const load = () => getAllUsers().then(u => setUsers(u));

  const approve = async uid => {
    setUpdating(uid);
    await updateUser(uid, {
      status:     "trial",
      trialStart: new Date(),
      trialEnd:   new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
    });
    await load();
    setUpdating(null);
    const u   = users.find(x => x.id === uid);
    const msg = encodeURIComponent(`✅ Hello ${u?.name},\n\nYour SOVARY Compliance account has been approved!\n\nYou have 3 weeks free trial.\nLogin: https://sovary-compliance.vercel.app\n\nRegards,\nSOVARY Team`);
    window.open(`https://wa.me/91${u?.phone || ""}?text=${msg}`, "_blank");
  };

  const setStatus = async (uid, status) => {
    setUpdating(uid);
    await updateUser(uid, { status });
    await load();
    setUpdating(null);
  };

  const pending  = users.filter(u => u.status === "pending");
  const active   = users.filter(u => u.status === "active" || u.status === "trial");
  const expired  = users.filter(u => u.status === "expired");
  const total    = users.filter(u => u.role !== "admin");

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    active:  "var(--accent)",
    trial:   "var(--blue)",
    pending: "var(--gold)",
    expired: "var(--red)",
    admin:   "#a78bfa",
  };

  const UserRow = ({ u }) => {
    const trialEnd = u.trialEnd?.seconds
      ? new Date(u.trialEnd.seconds * 1000)
      : u.trialEnd ? new Date(u.trialEnd) : null;
    const daysLeft = trialEnd
      ? Math.max(0, Math.round((trialEnd - new Date()) / (1000*60*60*24)))
      : null;

    return (
      <tr key={u.id}>
        <td>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {u.photo
              ? <img src={u.photo} style={{ width:28, height:28, borderRadius:"50%" }} alt="" />
              : <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--surface2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>👤</div>
            }
            <div>
              <div style={{ fontWeight:500, fontSize:13 }}>{u.name}</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{u.email}</div>
            </div>
          </div>
        </td>
        <td>
          <Badge label={u.status} color={statusColor[u.status] || "var(--muted)"} />
        </td>
        <td style={{ fontSize:11, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace" }}>
          {trialEnd ? trialEnd.toLocaleDateString("en-IN") : "—"}
          {daysLeft !== null && u.status === "trial" && (
            <div style={{ fontSize:10, color: daysLeft <= 3 ? "var(--red)" : "var(--muted)" }}>
              {daysLeft} days left
            </div>
          )}
        </td>
        <td style={{ fontSize:11, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace" }}>
          {u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
        </td>
        <td>
          {u.role !== "admin" && (
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {u.status === "pending" && (
                <button onClick={() => approve(u.id)} disabled={updating === u.id}
                  style={{ padding:"4px 10px", background:"rgba(126,186,90,0.1)", color:"var(--accent)", border:"1px solid rgba(126,186,90,0.3)", borderRadius:6, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  {updating === u.id ? <Spinner size={10} /> : "✓ Approve"}
                </button>
              )}
              {u.status === "trial" && (
                <button onClick={() => setStatus(u.id, "active")} disabled={updating === u.id}
                  style={{ padding:"4px 10px", background:"rgba(126,186,90,0.1)", color:"var(--accent)", border:"1px solid rgba(126,186,90,0.3)", borderRadius:6, fontSize:11, cursor:"pointer" }}>
                  Activate
                </button>
              )}
              {u.status === "active" && (
                <button onClick={() => setStatus(u.id, "expired")} disabled={updating === u.id}
                  style={{ padding:"4px 10px", background:"rgba(224,92,92,0.08)", color:"var(--red)", border:"1px solid rgba(224,92,92,0.25)", borderRadius:6, fontSize:11, cursor:"pointer" }}>
                  Expire
                </button>
              )}
              {u.status === "expired" && (
                <button onClick={() => setStatus(u.id, "active")} disabled={updating === u.id}
                  style={{ padding:"4px 10px", background:"rgba(126,186,90,0.1)", color:"var(--accent)", border:"1px solid rgba(126,186,90,0.3)", borderRadius:6, fontSize:11, cursor:"pointer" }}>
                  Reactivate
                </button>
              )}
              {/* WhatsApp */}
              {u.email && (
                <a href={`mailto:${u.email}`} style={{ padding:"4px 10px", background:"rgba(90,184,224,0.1)", color:"var(--blue)", border:"1px solid rgba(90,184,224,0.3)", borderRadius:6, fontSize:11, textDecoration:"none" }}>
                  📧
                </a>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader title="Admin Panel" sub="Manage all CA accounts on SOVARY platform" />

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:14, marginBottom:24 }}>
          {[
            { label:"TOTAL CAs",  value:total.length,   color:"var(--blue)"   },
            { label:"PENDING",    value:pending.length,  color:"var(--gold)"   },
            { label:"ACTIVE",     value:active.length,   color:"var(--accent)" },
            { label:"EXPIRED",    value:expired.length,  color:"var(--red)"    },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize:10, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace", marginBottom:6, letterSpacing:".08em" }}>{s.label}</div>
              <div style={{ fontSize:28, fontFamily:"DM Serif Display,serif", color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Pending alert */}
        {pending.length > 0 && (
          <div style={{ background:"rgba(212,168,67,0.06)", border:"1px solid rgba(212,168,67,0.25)", borderRadius:10, padding:"14px 18px", marginBottom:20 }}>
            <div style={{ fontSize:13, color:"var(--gold)", fontWeight:600, marginBottom:4 }}>
              ⏳ {pending.length} account(s) waiting for approval
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>
              Review and approve below. CA will be notified via WhatsApp.
            </div>
          </div>
        )}

        {/* Revenue summary */}
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"DM Serif Display,serif", fontSize:18, marginBottom:14 }}>Revenue Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16 }}>
            {[
              { label:"Starter (₹1,999)", count:active.length, color:"var(--muted)" },
              { label:"Professional (₹3,999)", count:0, color:"var(--accent)" },
              { label:"Enterprise (₹7,999)", count:0, color:"var(--gold)" },
            ].map(p => (
              <div key={p.label} style={{ background:"var(--surface2)", borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:"var(--muted)", marginBottom:6 }}>{p.label}</div>
                <div style={{ fontSize:22, fontFamily:"DM Serif Display,serif", color:p.color }}>{p.count}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>
                  ₹{(p.count * parseInt(p.label.match(/₹([\d,]+)/)?.[1].replace(",","") || 0)).toLocaleString("en-IN")}/mo
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, color:"var(--muted)" }}>Estimated Monthly Revenue</span>
            <span style={{ fontSize:16, fontFamily:"DM Serif Display,serif", color:"var(--accent)" }}>
              ₹{(active.length * 1999).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom:16 }}>
          <input className="input-base" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…" style={{ maxWidth:360 }} />
        </div>

        {/* Users table */}
        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : (
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <table className="table-base">
              <thead>
                <tr><th>USER</th><th>STATUS</th><th>TRIAL ENDS</th><th>JOINED</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => <UserRow key={u.id} u={u} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}