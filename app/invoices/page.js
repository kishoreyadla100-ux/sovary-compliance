"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getInvoices, addInvoice, updateInvoice } from "@/lib/firestore";
import { getFirm } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { Badge, Modal, Input, Select, PageHeader, EmptyState, Spinner } from "@/components/ui";
import jsPDF from "jspdf";

const SERVICES = ["GST Filing","TDS Return","ITR Filing","ROC Filing","MCA Compliance","Accounting","Audit","Tax Planning","GST Registration","Company Incorporation","Other"];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [clients,  setClients]  = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [firm,     setFirm]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    clientId:"", items:[{ service:"GST Filing", qty:1, rate:"" }], gst:true, notes:""
  });

  const load = async () => {
    const [c, inv, f] = await Promise.all([getClients(user.uid), getInvoices(user.uid), getFirm(user.uid)]);
    setClients(c); setInvoices(inv); setFirm(f); setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const getClientName = id => clients.find(c => c.id === id)?.name || "Unknown";
  const getClientObj  = id => clients.find(c => c.id === id);

  const subtotal = form.items.reduce((s, it) => s + (Number(it.rate) * Number(it.qty) || 0), 0);
  const gstAmt   = form.gst ? subtotal * 0.18 : 0;
  const total    = subtotal + gstAmt;

  const addItem    = ()      => setForm(p => ({ ...p, items:[...p.items,{ service:"GST Filing", qty:1, rate:"" }] }));
  const removeItem = i       => setForm(p => ({ ...p, items:p.items.filter((_,idx) => idx !== i) }));
  const setItem    = (i,k,v) => setForm(p => ({ ...p, items:p.items.map((it,idx) => idx===i ? {...it,[k]:v} : it) }));

  const handleSave = async () => {
    if (!form.clientId) { alert("Select a client."); return; }
    setSaving(true);
    const client    = getClientObj(form.clientId);
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    await addInvoice(user.uid, {
      ...form, invoiceNo,
      clientName: client?.name,
      subtotal, gstAmt, total,
      status: "Unpaid",
      date: new Date().toISOString().split("T")[0],
    });
    await load();
    setModal(false); setSaving(false);
    setForm({ clientId:"", items:[{ service:"GST Filing", qty:1, rate:"" }], gst:true, notes:"" });
  };

  const markPaid = async inv => {
    await updateInvoice(user.uid, inv.id, { status:"Paid", paidAt:new Date().toISOString().split("T")[0] });
    await load();
  };

  const downloadPDF = inv => {
    const doc    = new jsPDF();
    const client = getClientObj(inv.clientId);

    // Header
    doc.setFontSize(22); doc.setTextColor(126,186,90);
    doc.text(firm?.firmName || "SOVARY Compliance", 20, 25);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(firm?.address || "", 20, 33);
    doc.text(`GST: ${firm?.gst || ""}  |  ${firm?.phone || ""}`, 20, 39);

    // Invoice title
    doc.setFontSize(18); doc.setTextColor(30);
    doc.text("INVOICE", 150, 25);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Invoice No: ${inv.invoiceNo}`, 150, 33);
    doc.text(`Date: ${inv.date}`, 150, 39);

    doc.setDrawColor(200); doc.line(20, 46, 190, 46);

    // Bill to
    doc.setFontSize(10); doc.setTextColor(100); doc.text("Bill To:", 20, 54);
    doc.setFontSize(13); doc.setTextColor(30); doc.text(inv.clientName || "", 20, 62);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(client?.city || "", 20, 69);
    doc.text(`GSTIN: ${client?.gstin || "—"}`, 20, 76);

    // Table header
    doc.setFillColor(240,240,240);
    doc.rect(20, 86, 170, 8, "F");
    doc.setFontSize(9); doc.setTextColor(30);
    doc.text("SERVICE", 22, 92);
    doc.text("QTY",     112, 92);
    doc.text("RATE (₹)", 132, 92);
    doc.text("AMOUNT (₹)", 160, 92);

    // Items
    let y = 104;
    (inv.items || []).forEach(it => {
      doc.setFontSize(9); doc.setTextColor(30);
      doc.text(it.service, 22, y);
      doc.text(String(it.qty), 113, y);
      doc.text(Number(it.rate).toLocaleString("en-IN"), 133, y);
      doc.text((Number(it.rate)*Number(it.qty)).toLocaleString("en-IN"), 161, y);
      y += 8;
    });

    doc.line(20, y, 190, y); y += 8;
    doc.text(`Subtotal: ₹${inv.subtotal?.toLocaleString("en-IN")}`, 130, y); y += 7;
    if (inv.gst) { doc.text(`GST 18%: ₹${inv.gstAmt?.toLocaleString("en-IN")}`, 130, y); y += 7; }
    doc.setFontSize(12); doc.setTextColor(126,186,90);
    doc.text(`Total: ₹${inv.total?.toLocaleString("en-IN")}`, 130, y); y += 14;
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text("Thank you for your business!", 20, y);
    doc.save(`${inv.invoiceNo}.pdf`);
  };

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader
          title="Invoices"
          sub={`${invoices.length} invoices · ₹${invoices.filter(i=>i.status==="Unpaid").reduce((s,i)=>s+(i.total||0),0).toLocaleString("en-IN")} pending`}
          action={
            <button className="btn-primary" onClick={() => {
              setForm({ clientId:"", items:[{ service:"GST Filing", qty:1, rate:"" }], gst:true, notes:"" });
              setModal(true);
            }}>+ New Invoice</button>
          }
        />

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : invoices.length === 0 ? (
          <EmptyState icon="◫" title="No invoices yet" sub="Create your first invoice"
            action={<button className="btn-primary" onClick={() => setModal(true)}>+ New Invoice</button>} />
        ) : (
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <table className="table-base">
              <thead>
                <tr><th>INV NO</th><th>CLIENT</th><th>DATE</th><th>SUBTOTAL</th><th>GST</th><th>TOTAL</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:11 }}>{inv.invoiceNo}</td>
                    <td style={{ fontWeight:500 }}>{inv.clientName}</td>
                    <td style={{ fontSize:12, color:"var(--muted)" }}>{inv.date}</td>
                    <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:12 }}>₹{inv.subtotal?.toLocaleString("en-IN")}</td>
                    <td style={{ fontSize:12, color:"var(--muted)" }}>{inv.gst ? `₹${inv.gstAmt?.toLocaleString("en-IN")}` : "—"}</td>
                    <td style={{ fontFamily:"JetBrains Mono,monospace", fontSize:13, fontWeight:600, color:"var(--accent)" }}>₹{inv.total?.toLocaleString("en-IN")}</td>
                    <td><Badge label={inv.status} color={inv.status==="Paid" ? "var(--accent)" : "var(--gold)"} /></td>
                    <td>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={() => downloadPDF(inv)} className="btn-secondary" style={{ padding:"4px 10px", fontSize:11 }}>⬇ PDF</button>
                        {inv.status === "Unpaid" && (
                          <button onClick={() => markPaid(inv)} style={{ padding:"4px 10px", background:"rgba(126,186,90,0.1)", color:"var(--accent)", border:"1px solid rgba(126,186,90,0.3)", borderRadius:6, fontSize:11, cursor:"pointer" }}>
                            ✓ Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={modal} onClose={() => setModal(false)} title="New Invoice">
          <Select label="CLIENT *" value={form.clientId} onChange={e => setForm(p=>({...p,clientId:e.target.value}))}>
            <option value="">Select client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace", marginBottom:8, letterSpacing:".08em" }}>SERVICES</div>
            {form.items.map((it, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 60px 90px 28px", gap:6, marginBottom:6 }}>
                <select value={it.service} onChange={e => setItem(i,"service",e.target.value)} className="input-base" style={{ padding:"8px 10px" }}>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
                <input type="number" value={it.qty} onChange={e => setItem(i,"qty",e.target.value)}
                  className="input-base" style={{ padding:"8px 10px", textAlign:"center" }} placeholder="Qty" />
                <input type="number" value={it.rate} onChange={e => setItem(i,"rate",e.target.value)}
                  className="input-base" style={{ padding:"8px 10px" }} placeholder="₹ Rate" />
                <button onClick={() => removeItem(i)} style={{ background:"none", border:"none", color:"var(--red)", cursor:"pointer", fontSize:18 }}>×</button>
              </div>
            ))}
            <button onClick={addItem} className="btn-secondary" style={{ padding:"6px 14px", fontSize:12, marginTop:4 }}>+ Add Item</button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <input type="checkbox" id="gst" checked={form.gst} onChange={e => setForm(p=>({...p,gst:e.target.checked}))} />
            <label htmlFor="gst" style={{ fontSize:13, cursor:"pointer" }}>Add GST 18%</label>
          </div>

          <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 14px", marginBottom:16, fontSize:13 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:"var(--muted)" }}>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {form.gst && (
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ color:"var(--muted)" }}>GST 18%</span>
                <span>₹{gstAmt.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, color:"var(--accent)", paddingTop:6, borderTop:"1px solid var(--border)" }}>
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-secondary" onClick={() => setModal(false)} style={{ flex:1 }}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : "Create Invoice"}
            </button>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}