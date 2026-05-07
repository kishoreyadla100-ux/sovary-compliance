"use client";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getClients, getDeadlines } from "@/lib/firestore";
import { geminiChat } from "@/lib/gemini";
import { useEffect, useRef, useState } from "react";
import { Spinner, getDaysLeft } from "@/components/ui";

export default function AIPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I'm your SOVARY-powered compliance assistant. Ask me anything about GST, TDS, ROC, MCA, Income Tax, penalties, or your client deadlines. 🙏"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    if (user) {
      Promise.all([getClients(user.uid), getDeadlines(user.uid)]).then(([c, d]) => {
        setClients(c);
        setDeadlines(d);
      });
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSystemPrompt = () => {
    const overdue = deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) < 0);
    const upcoming = deadlines.filter(d => d.status !== "Filed" && getDaysLeft(d.dueDate) >= 0 && getDaysLeft(d.dueDate) <= 7);
    return `You are an expert Indian CA compliance assistant for a firm using SOVARY Compliance platform.
Current date: ${new Date().toLocaleDateString("en-IN")}
Total clients: ${clients.length}
Overdue filings: ${overdue.length}
${overdue.length > 0 ? `Overdue: ${overdue.map(d => `${clients.find(c => c.id === d.clientId)?.name || "?"} - ${d.subtype}`).join(", ")}` : ""}
Upcoming (7 days): ${upcoming.length}
Answer concisely and professionally. Focus on Indian tax laws — GST, TDS, Income Tax, ROC, MCA, FEMA. Use ₹ for currency. Cite relevant sections where possible.`;
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      console.log("Sending to Gemini...");
      const reply = await geminiChat(newMsgs, getSystemPrompt());
      console.log("Got response:", reply);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error("Gemini error:", e);
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTIONS = [
    "What are my overdue filings?",
    "GST late filing fee calculation",
    "TDS due dates Q1 FY 2025-26",
    "ROC annual filing checklist",
    "Penalty for late GSTR-3B",
    "Section 234A 234B 234C interest",
  ];

  const renderMsg = (content) =>
    content.split("\n").map((line, i) => (
      <div key={i} style={{ marginBottom: line === "" ? 8 : 2 }}>
        {line.startsWith("**") && line.endsWith("**")
          ? <strong>{line.slice(2, -2)}</strong>
          : line.startsWith("- ") || line.startsWith("• ")
            ? <span>• {line.slice(2)}</span>
            : line}
      </div>
    ));

  return (
    <AppShell>
      <div className="animate-fadeUp" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "DM Serif Display,serif", fontSize: 28, fontWeight: 400 }}>SOVARY AI Assistant</h1>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Powered by SOVARY AI· Indian tax & compliance expert</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: "rgba(126,186,90,0.08)", border: "1px solid rgba(126,186,90,0.25)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "JetBrains Mono,monospace" }}>SOVARY AI CONNECTED</span>
          </div>
        </div>

        {/* Chat box */}
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
                {m.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(90,184,224,0.12)", border: "1px solid rgba(90,184,224,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, marginRight: 10, flexShrink: 0, marginTop: 2 }}>✦</div>
                )}
                <div style={{
                  maxWidth: "75%", padding: "12px 16px", fontSize: 13, lineHeight: 1.7,
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "rgba(126,186,90,0.12)" : "var(--surface2)",
                  border: `1px solid ${m.role === "user" ? "rgba(126,186,90,0.25)" : "var(--border)"}`,
                }}>
                  {renderMsg(m.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(90,184,224,0.12)", border: "1px solid rgba(90,184,224,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>✦</div>
                <div style={{ padding: "12px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "14px 14px 14px 4px", display: "flex", gap: 8, alignItems: "center" }}>
                  <Spinner size={14} /><span style={{ fontSize: 12, color: "var(--muted)" }}>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  background: "var(--surface2)", color: "var(--muted)",
                  border: "1px solid var(--border)", borderRadius: 6,
                  padding: "6px 12px", fontSize: 12, cursor: "pointer",
                  fontFamily: "Inter,sans-serif",
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about GST, TDS, penalties, deadlines…"
              className="input-base"
              style={{ flex: 1 }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="btn-primary"
              style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 6 }}
            >
              {loading ? <Spinner size={14} /> : "Send"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}