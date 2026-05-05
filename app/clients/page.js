"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, addClient, updateClient, deleteClient } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { Badge, Modal, Input, Select, PageHeader, EmptyState, Spinner, getTypeColor } from "@/components/ui";

const EMPTY = { name:"", phone:"", email:"", gstin:"", pan:"", type:"Individual", city:"", state:"", whatsapp:"" };
const TYPES = ["Individual","Proprietorship","Partnership","LLP","Pvt Ltd","Ltd","Trust","HUF"];

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    const data = await getClients(user.uid);
    setClients(data); setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = c  => { setEditing(c);    setForm(c);     setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.phone) { alert("Name and phone are required."); return; }
    setSaving(true);
    if (editing) await updateClient(user.uid, editing.id, form);
    else await addClient(user.uid, form);
    await load();
    setModal(false); setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm("Delete this client?")) return;
    setDeleting(id);
    await deleteClient(user.uid, id);
    await load();
    setDeleting(null);
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.gstin?.toLowerCase().includes(search.toLowerCase()) ||
    c.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader
          title="Clients"
          sub={`${clients.length} total clients`}
          action={<button className="btn-primary" onClick={openAdd}>+ Add Client</button>}
        />

        <div style={{ marginBottom:20 }}>
          <input className="input-base" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city, GSTIN, type…" style={{ maxWidth:400 }} />
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="◉" title="No clients yet" sub="Add your first client to get started"
            action={<button className="btn-primary" onClick={openAdd}>+ Add Client</button>} />
        ) : (
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <table className="table-base">
              <thead>
                <tr><th>#</th><th>NAME</th><th>TYPE</th><th>PHONE</th><th>GSTIN</th><th>CITY</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color:"var(--muted)", fontFamily:"JetBrains Mono,monospace", fontSize:11 }}>{i+1}</td>
                    <td style={{ fontWeight:500 }}>{c.name}</td>
                    <td><Badge label={c.type} color="var(--blue)" /></td>
                    <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>{c.phone}</td>
                    <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11, color:"var(--muted)" }}>{c.gstin || "—"}</td>
                    <td style={{ fontSize:12, color:"var(--muted)" }}>{c.city || "—"}</td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openEdit(c)} className="btn-secondary" style={{ padding:"5px 12px", fontSize:11 }}>Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="btn-danger" style={{ padding:"5px 12px", fontSize:11 }}>
                          {deleting === c.id ? <Spinner size={12} /> : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Client" : "Add New Client"}>
          <Input label="CLIENT NAME *" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name or firm name" />
          <Select label="CLIENT TYPE" value={form.type} onChange={e => set("type", e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </Select>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="PHONE *" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit" />
            <Input label="WHATSAPP" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="WhatsApp number" />
          </div>
          <Input label="EMAIL" value={form.email} onChange={e => set("email", e.target.value)} placeholder="client@email.com" type="email" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="GSTIN" value={form.gstin} onChange={e => set("gstin", e.target.value)} placeholder="GSTIN" />
            <Input label="PAN" value={form.pan} onChange={e => set("pan", e.target.value)} placeholder="PAN" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="CITY" value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" />
            <Input label="STATE" value={form.state} onChange={e => set("state", e.target.value)} placeholder="State" />
          </div>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button className="btn-secondary" onClick={() => setModal(false)} style={{ flex:1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : editing ? "Update Client" : "Add Client"}
            </button>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}