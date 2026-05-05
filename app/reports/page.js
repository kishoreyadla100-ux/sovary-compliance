"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getDeadlines, getInvoices } from "@/lib/firestore";
import { useEffect, useState } from "react";
import { PageHeader, Spinner, Badge, getDaysLeft, getTypeColor } from "@/components/ui";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export default function ReportsPage() {
  const { user } = useAuth();
  const [clients,   setClients]   = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [invoices,  setInvoices]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getClients(user.uid), getDeadlines(user.uid), getInvoices(user.uid)]).then(([c,d,i]) => {
      setClients(c); setDeadlines(d); setInvoices(i); setLoading(false);
    });
  }, [user]);

  const getClientName = id => clients.find(c => c.id === id)?.name || "Unknown";

  // ── Export functions ──────────────────────────────────────────────────────
  const exportClientsExcel = () => {
    const data = clients.map(c => ({
      Name: c.name, Type: c.type, Phone: c.phone,
      Email: c.email, GSTIN: c.gstin, PAN: c.pan,
      City: c.city, State: c.state,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "SOVARY_Clients.xlsx");
  };

  const exportDeadlinesExcel = () => {
    const data = deadlines.map(d => ({
      Client:    getClientName(d.clientId),
      Type:      d.type,
      Filing:    d.subtype,
      Period:    d.period,
      "Due Date": d.dueDate,
      Status:    d.status,
      "Days Left": getDaysLeft(d.dueDate),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deadlines");
    XLSX.writeFile(wb, "SOVARY_Deadlines.xlsx");
  };

  const exportInvoicesExcel = () => {
    const data = invoices.map(i => ({
      "Invoice No": i.invoiceNo,
      Client:       i.clientName,
      Date:         i.date,
      Subtotal:     i.subtotal,
      "GST Amount": i.gstAmt || 0,
      Total:        i.total,
      Status:       i.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "SOVARY_Invoices.xlsx");
  };

  const exportOverduePDF = () => {
    const overdue = deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) < 0);
    const doc     = new jsPDF();

    doc.setFontSize(20); doc.setTextColor(126,186,90);
    doc.text("SOVARY Compliance", 20, 20);
    doc.setFontSize(14); doc.setTextColor(30);
    doc.text("Overdue Filings Report", 20, 30);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}  |  Total Overdue: ${overdue.length}`, 20, 38);
    doc.line(20, 42, 190, 42);

    let y = 52;
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text("CLIENT", 20, y); doc.text("FILING", 75, y);
    doc.text("PERIOD", 120, y); doc.text("DUE DATE", 155, y); doc.text("OVERDUE BY", 178, y);
    y += 5; doc.line(20, y, 190, y); y += 6;

    doc.setTextColor(30);
    overdue.forEach(d => {
      doc.text(getClientName(d.clientId).slice(0,22), 20, y);
      doc.text(`${d.type}-${d.subtype}`.slice(0,20), 75, y);
      doc.text(d.period || "", 120, y);
      doc.text(d.dueDate || "", 155, y);
      doc.setTextColor(200,60,60);
      doc.text(`${Math.abs(getDaysLeft(d.dueDate))}d`, 178, y);
      doc.setTextColor(30);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("SOVARY_Overdue_Report.pdf");
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const overdue        = deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) < 0);
  const filed          = deadlines.filter(d => d.status === "Filed");
  const totalRevenue   = invoices.filter(i => i.status === "Paid").reduce((s,i) => s+(i.total||0), 0);
  const pendingRevenue = invoices.filter(i => i.status === "Unpaid").reduce((s,i) => s+(i.total||0), 0);

  const ReportCard = ({ title, icon, sub, onExport, exportLabel, color="var(--accent)", stats }) => (
    <div className="card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:20 }}>{icon}</span>
            <span style={{ fontFamily:"DM Serif Display,serif", fontSize:18 }}>{title}</span>
          </div>
          <div style={{ fontSize:12, color:"var(--muted)" }}>{sub}</div>
        </div>
        <button onClick={onExport} style={{
          background:`${color}18`, color, border:`1px solid ${color}33`,
          borderRadius:8, padding:"8px 16px", fontSize:12,
          cursor:"pointer", fontFamily:"JetBrains Mono,monospace",
        }}>⬇ {exportLabel}</button>
      </div>
      {stats && (
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {stats.map(s => (
            <div key={s.label} style={{ flex:1, minWidth:80 }}>
              <div style={{ fontSize:22, fontFamily:"DM Serif Display,serif", color:s.color||color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader title="Reports" sub="Export your compliance and financial data" />

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16, marginBottom:20 }}>
              <ReportCard
                title="Client List" icon="◉" color="var(--blue)"
                sub={`All ${clients.length} registered clients`}
                onExport={exportClientsExcel} exportLabel="Excel"
                stats={[
                  { label:"Total Clients",  value:clients.length },
                  { label:"Pvt Ltd",        value:clients.filter(c=>c.type==="Pvt Ltd").length,    color:"var(--blue)" },
                  { label:"Individual",     value:clients.filter(c=>c.type==="Individual").length,  color:"var(--muted)" },
                ]}
              />
              <ReportCard
                title="All Deadlines" icon="◷" color="var(--gold)"
                sub="Complete filing tracker"
                onExport={exportDeadlinesExcel} exportLabel="Excel"
                stats={[
                  { label:"Total",   value:deadlines.length },
                  { label:"Filed",   value:filed.length,   color:"var(--accent)" },
                  { label:"Overdue", value:overdue.length, color:"var(--red)" },
                ]}
              />
              <ReportCard
                title="Overdue Report" icon="🚨" color="var(--red)"
                sub="Immediate action required"
                onExport={exportOverduePDF} exportLabel="PDF"
                stats={[
                  { label:"Overdue Filings",  value:overdue.length, color:"var(--red)" },
                  { label:"Clients Affected", value:[...new Set(overdue.map(d=>d.clientId))].length, color:"var(--orange)" },
                ]}
              />
              <ReportCard
                title="Invoice Summary" icon="◫" color="var(--accent)"
                sub="Billing and payment tracking"
                onExport={exportInvoicesExcel} exportLabel="Excel"
                stats={[
                  { label:"Total Invoices",     value:invoices.length },
                  { label:"Revenue Collected",  value:`₹${(totalRevenue/1000).toFixed(0)}k`,   color:"var(--accent)" },
                  { label:"Pending",            value:`₹${(pendingRevenue/1000).toFixed(0)}k`, color:"var(--gold)" },
                ]}
              />
            </div>

            {/* Type breakdown table */}
            {deadlines.length > 0 && (
              <div className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", fontFamily:"DM Serif Display,serif", fontSize:18 }}>
                  Filing Type Summary
                </div>
                <table className="table-base">
                  <thead><tr><th>TYPE</th><th>TOTAL</th><th>FILED</th><th>PENDING</th><th>OVERDUE</th><th>COMPLETION</th></tr></thead>
                  <tbody>
                    {["GST","TDS","ROC","MCA","IT"].map(type => {
                      const total   = deadlines.filter(d => d.type === type).length;
                      if (total === 0) return null;
                      const filed   = deadlines.filter(d => d.type === type && d.status === "Filed").length;
                      const ov      = deadlines.filter(d => d.type === type && d.status !== "Filed" && getDaysLeft(d.dueDate) < 0).length;
                      const pct     = Math.round((filed/total)*100);
                      return (
                        <tr key={type}>
                          <td><Badge label={type} color={getTypeColor(type)} /></td>
                          <td style={{ fontFamily:"JetBrains Mono,monospace" }}>{total}</td>
                          <td style={{ color:"var(--accent)", fontFamily:"JetBrains Mono,monospace" }}>{filed}</td>
                          <td style={{ color:"var(--gold)", fontFamily:"JetBrains Mono,monospace" }}>{total-filed}</td>
                          <td style={{ color:"var(--red)", fontFamily:"JetBrains Mono,monospace" }}>{ov}</td>
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ flex:1, height:6, background:"var(--surface2)", borderRadius:3, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:getTypeColor(type), borderRadius:3 }} />
                              </div>
                              <span style={{ fontSize:11, fontFamily:"JetBrains Mono,monospace", minWidth:30 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}