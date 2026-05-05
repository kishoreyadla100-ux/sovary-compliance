"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getDeadlines, addDeadline, updateDeadline, deleteDeadline } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { Badge, Modal, Input, Select, PageHeader, EmptyState, Spinner, getDaysLeft, getTypeColor } from "@/components/ui";

const TYPES = {
  GST: ["GSTR-1","GSTR-3B","GSTR-9","GSTR-9C","CMP-08","GSTR-4"],
  TDS: ["24Q","26Q","27Q","27EQ","Form 16","Form 16A"],
  ROC: ["AOC-4","MGT-7","MGT-7A","ADT-1","DIR-3 KYC","INC-20A"],
  MCA: ["DPT-3","MSME-1","BEN-2","PAS-6","FC-4"],
  IT:  ["ITR-1","ITR-2","ITR-3","ITR-4","ITR-5","ITR-6","ITR-7","Form 3CA-3CD","Form 3CB-3CD"],
};

const EMPTY = { clientId:"", type:"GST", subtype:"GSTR-3B", period:"", dueDate:"", status:"Pending", notes:"" };

export default function DeadlinesPage() {
  const { user } = useAuth();
  const [clients,    setClients]    = useState([]);
  const [deadlines,  setDeadlines]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    const [c, d] = await Promise.all([getClients(user.uid), getDeadlines(user.uid)]);
    setClients(c); setDeadlines(d); setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const getClientName = id => clients.find(c => c.id === id)?.name || "Unknown";

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = d  => { setEditing(d);    setForm(d);     setModal(true); };

  const handleSave = async () => {
    if (!form.clientId || !form.dueDate) { alert("Select a client and due date."); return; }
    setSaving(true);
    if (editing) await updateDeadline(user.uid, editing.id, form);
    else await addDeadline(user.uid, form);
    await load();
    setModal(false); setSaving(false);
  };

  const markFiled = async d => {
    await updateDeadline(user.uid, d.id, { status:"Filed", filedAt: new Date().toISOString().split("T")[0] });
    await load();
  };

  const handleDelete = async id => {
    if (!confirm("Delete this deadline?")) return;
    await deleteDeadline(user.uid, id);
    await load();
  };

  let filtered = deadlines;
  if (filter === "Overdue")    filtered = filtered.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) < 0);
  else if (filter === "This Week") filtered = filtered.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) >= 0 && getDaysLeft(d.dueDate) <= 7);
  else if (filter !== "All")   filtered = filtered.filter(d => d.status === filter);
  if (typeFilter !== "All")    filtered = filtered.filter(d => d.type === typeFilter);
  if (search) filtered = filtered.filter(d =>
    getClientName(d.clientId).toLowerCase().includes(search.toLowerCase()) ||
    d.subtype?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader
          title="Deadlines"
          sub={`${deadlines.length} total · ${deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) < 0).length} overdue`}
          action={<button className="btn-primary" onClick={openAdd}>+ Add Deadline</button>}
        />

        {/* Status filters */}
        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          {["All","Overdue","This Week","Pending","Filed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"6px 14px", borderRadius:7, fontSize:12, cursor:"pointer",
              fontFamily:"JetBrains Mono,monospace",
              border:`1px solid ${filter === f ? "rgba(126,186,90,0.4)" : "var(--border)"}`,
              background: filter === f ? "rgba(126,186,90,0.1)" : "var(--surface)",
              color: filter === f ? "var(--accent)" : "var(--muted)",
            }}>{f}</button>
          ))}
        </div>

        {/* Type filters */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {["All","GST","TDS","ROC","MCA","IT"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding:"6px 14px", borderRadius:7, fontSize:12, cursor:"pointer",
              fontFamily:"JetBrains Mono,monospace",
              border:`1px solid ${typeFilter === t ? getTypeColor(t) + "55" : "var(--border)"}`,
              background: typeFilter === t ? getTypeColor(t) + "18" : "var(--surface)",
              color: typeFilter === t ? getTypeColor(t) : "var(--muted)",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ marginBottom:16 }}>
          <input className="input-base" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search client or filing…" style={{ maxWidth:360 }} />
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="◷" title="No deadlines found" sub="Add deadlines to track compliance filings"
            action={<button className="btn-primary" onClick={openAdd}>+ Add Deadline</button>} />
        ) : (
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <table className="table-base">
              <thead>
                <tr><th>CLIENT</th><th>TYPE</th><th>FILING</th><th>PERIOD</th><th>DUE DATE</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const days = getDaysLeft(d.dueDate);
                  const isOverdue = d.status !== "Filed" && days < 0;
                  return (
                    <tr key={d.id} style={{ background: isOverdue ? "rgba(224,92,92,0.02)" : "transparent" }}>
                      <td style={{ fontWeight:500 }}>{getClientName(d.clientId)}</td>
                      <td><Badge label={d.type} color={getTypeColor(d.type)} /></td>
                      <td style={{ fontSize:12 }}>{d.subtype}</td>
                      <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"var(--muted)" }}>{d.period}</td>
                      <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>{d.dueDate}</td>
                      <td>
                        {d.status === "Filed"
                          ? <Badge label="Filed" color="var(--accent)" />
                          : <Badge
                              label={days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today!" : `${days}d left`}
                              color={days < 0 ? "var(--red)" : days <= 3 ? "var(--orange)" : "var(--gold)"}
                            />
                        }
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:5 }}>
                          {d.status !== "Filed" && (
                            <button onClick={() => markFiled(d)} style={{ padding:"4px 10px", background:"rgba(126,186,90,0.1)", color:"var(--accent)", border:"1px solid rgba(126,186,90,0.3)", borderRadius:6, fontSize:11, cursor:"pointer" }}>
                              ✓ Filed
                            </button>
                          )}
                          <button onClick={() => openEdit(d)} className="btn-secondary" style={{ padding:"4px 10px", fontSize:11 }}>Edit</button>
                          <button onClick={() => handleDelete(d.id)} className="btn-danger" style={{ padding:"4px 10px", fontSize:11 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Deadline" : "Add Deadline"}>
          <Select label="CLIENT *" value={form.clientId} onChange={e => set("clientId", e.target.value)}>
            <option value="">Select client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Select label="TYPE" value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.keys(TYPES).map(t => <option key={t}>{t}</option>)}
            </Select>
            <Select label="FILING" value={form.subtype} onChange={e => set("subtype", e.target.value)}>
              {(TYPES[form.type] || []).map(s => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="PERIOD" value={form.period} onChange={e => set("period", e.target.value)} placeholder="e.g. Apr 2025" />
            <Input label="DUE DATE *" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} type="date" />
          </div>
          <Select label="STATUS" value={form.status} onChange={e => set("status", e.target.value)}>
            <option>Pending</option>
            <option>Filed</option>
            <option>Overdue</option>
          </Select>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button className="btn-secondary" onClick={() => setModal(false)} style={{ flex:1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : editing ? "Update" : "Add Deadline"}
            </button>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}