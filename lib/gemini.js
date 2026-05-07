export async function geminiChat(messages, systemPrompt) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.reply;
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
}

export async function geminiDraft(prompt) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        systemPrompt: "You are a professional Indian tax compliance expert. Draft concise, precise documents.",
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.reply;
  } catch (error) {
    console.error("Gemini Draft error:", error);
    throw error;
  }
}