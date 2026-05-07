export async function POST(req) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { messages, systemPrompt } = await req.json();
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

    // Build contents array - correct Gemini format
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I will help with Indian CA compliance." }] },
      ...messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return Response.json({ error: "No response from Gemini" }, { status: 500 });
    }

    return Response.json({ reply: text });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}