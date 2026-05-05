export async function POST(req) {
  try {
    const { name, email } = await req.json();
    const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!SCRIPT_URL) {
      return Response.json({ success: false, error: "No Google Script URL" });
    }

    const res = await fetch(SCRIPT_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email }),
    });

    const text = await res.text();
    console.log("Script response:", text);

    return Response.json({ success: true });

  } catch (e) {
    console.log("Error:", e.message);
    return Response.json({ success: false, error: e.message });
  }
}