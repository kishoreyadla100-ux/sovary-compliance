"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients } from "@/lib/firestore";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { Badge, PageHeader, EmptyState, Spinner, Modal, Select } from "@/components/ui";

const FILE_ICONS = { pdf:"📄", doc:"📝", docx:"📝", xls:"📊", xlsx:"📊", jpg:"🖼", jpeg:"🖼", png:"🖼", zip:"📦" };
const getIcon  = name => FILE_ICONS[name?.split(".").pop()?.toLowerCase()] || "📎";
const fmtSize  = bytes => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [clients,      setClients]      = useState([]);
  const [docs,         setDocs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [modal,        setModal]        = useState(false);
  const [selClient,    setSelClient]    = useState("");
  const [selFile,      setSelFile]      = useState(null);
  const [filterClient, setFilterClient] = useState("all");
  const [search,       setSearch]       = useState("");
  const [deleting,     setDeleting]     = useState(null);
  const fileRef = useRef();

  const loadDocs = async () => {
    const q    = query(collection(db, "documents", user.uid, "files"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!user) return;
    Promise.all([getClients(user.uid), loadDocs()]).then(([c]) => {
      setClients(c); setLoading(false);
    });
  }, [user]);

  const getClientName = id => clients.find(c => c.id === id)?.name || "Unknown";

  const handleUpload = async () => {
    if (!selFile || !selClient) { alert("Select a client and file."); return; }
    setUploading(true); setProgress(0);
    const path       = `documents/${user.uid}/${selClient}/${Date.now()}_${selFile.name}`;
    const storageRef = ref(storage, path);
    const task       = uploadBytesResumable(storageRef, selFile);
    task.on("state_changed",
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      err  => { alert("Upload failed: " + err.message); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, "documents", user.uid, "files"), {
          name: selFile.name, size: selFile.size, type: selFile.type,
          url, path, clientId: selClient,
          clientName: getClientName(selClient),
          createdAt: serverTimestamp(),
        });
        await loadDocs();
        setModal(false); setUploading(false); setSelFile(null); setSelClient("");
      }
    );
  };

  const handleDelete = async d => {
    if (!confirm(`Delete "${d.name}"?`)) return;
    setDeleting(d.id);
    try { await deleteObject(ref(storage, d.path)); } catch {}
    await deleteDoc(doc(db, "documents", user.uid, "files", d.id));
    await loadDocs();
    setDeleting(null);
  };

  const filtered = docs.filter(d => {
    const matchClient = filterClient === "all" || d.clientId === filterClient;
    const matchSearch = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.clientName?.toLowerCase().includes(search.toLowerCase());
    return matchClient && matchSearch;
  });

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <PageHeader
          title="Documents"
          sub={`${docs.length} files stored`}
          action={<button className="btn-primary" onClick={() => setModal(true)}>+ Upload File</button>}
        />

        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <input className="input-base" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search files…" style={{ maxWidth:260 }} />
          <select className="input-base" value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ maxWidth:220 }}>
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}><Spinner size={32} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📁" title="No documents yet" sub="Upload files for your clients"
            action={<button className="btn-primary" onClick={() => setModal(true)}>+ Upload File</button>} />
        ) : (
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <table className="table-base">
              <thead>
                <tr><th>FILE</th><th>CLIENT</th><th>SIZE</th><th>UPLOADED</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:20 }}>{getIcon(d.name)}</span>
                        <span style={{ fontSize:13, fontWeight:500, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</span>
                      </div>
                    </td>
                    <td><Badge label={d.clientName} color="var(--blue)" /></td>
                    <td style={{ fontSize:12, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace" }}>{fmtSize(d.size)}</td>
                    <td style={{ fontSize:11, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace" }}>
                      {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:6 }}>
                        <a href={d.url} target="_blank" rel="noreferrer" style={{ padding:"4px 10px", background:"rgba(90,184,224,0.1)", color:"var(--blue)", border:"1px solid rgba(90,184,224,0.3)", borderRadius:6, fontSize:11, textDecoration:"none" }}>
                          ⬇ Download
                        </a>
                        <button onClick={() => handleDelete(d)} disabled={deleting === d.id} className="btn-danger" style={{ padding:"4px 10px", fontSize:11 }}>
                          {deleting === d.id ? <Spinner size={10} /> : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={modal} onClose={() => { if (!uploading) { setModal(false); setSelFile(null); }}} title="Upload Document">
          <Select label="CLIENT *" value={selClient} onChange={e => setSelClient(e.target.value)}>
            <option value="">Select client…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"JetBrains Mono,monospace", marginBottom:8, letterSpacing:".08em" }}>FILE *</div>
            <div onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setSelFile(e.dataTransfer.files[0]); }}
              style={{ border:"2px dashed var(--border)", borderRadius:10, padding:"32px 20px", textAlign:"center", cursor:"pointer", background: selFile ? "rgba(126,186,90,0.04)" : "transparent" }}>
              {selFile ? (
                <div>
                  <div style={{ fontSize:28, marginBottom:8 }}>{getIcon(selFile.name)}</div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{selFile.name}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{fmtSize(selFile.size)}</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:28, marginBottom:8 }}>📁</div>
                  <div style={{ fontSize:13, color:"var(--muted)" }}>Click or drag & drop file here</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>PDF, Excel, Word, Images supported</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" style={{ display:"none" }} onChange={e => setSelFile(e.target.files[0])} />
          </div>

          {uploading && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--muted)", marginBottom:6 }}>
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div style={{ height:6, background:"var(--surface2)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:"var(--accent)", borderRadius:3, transition:"width .3s" }} />
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-secondary" onClick={() => setModal(false)} style={{ flex:1 }} disabled={uploading}>Cancel</button>
            <button className="btn-primary" onClick={handleUpload} disabled={uploading || !selFile || !selClient}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {uploading ? <><Spinner size={14} /> {progress}%</> : "Upload File"}
            </button>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}