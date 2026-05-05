const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

export async function geminiChat(messages, systemPrompt) {
  const contents = [
    { role: "user",  parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Understood. Ready to assist with SOVARY Compliance." }] },
    ...messages.map(m => ({
      role:  m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
  ];

  const res  = await fetch(GEMINI_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ contents }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

export async function geminiDraft(prompt) {
  const res  = await fetch(GEMINI_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}