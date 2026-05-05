export async function POST(req) {
  try {
    const { name, email } = await req.json();
    const RESEND_KEY = process.env.RESEND_API_KEY;

    console.log("=== NOTIFY ADMIN CALLED ===");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Resend Key exists:", !!RESEND_KEY);

    if (!RESEND_KEY) {
      console.log("ERROR: No Resend API key!");
      return Response.json({
        success: false,
        error: "No Resend API key in .env.local"
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    "onboarding@resend.dev",
        to:      ["kishoreyadla100@gmail.com"],
        subject: `🔔 New CA Signup: ${name} needs approval`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">

  <div style="background:#0b0e09;padding:20px;border-radius:12px 12px 0 0;">
    <div style="font-family:Georgia,serif;font-size:22px;color:#7eba5a;">
      SOVARY Compliance
    </div>
    <div style="font-size:11px;color:#606b56;letter-spacing:2px;margin-top:4px;">
      ADMIN NOTIFICATION
    </div>
  </div>

  <div style="background:#ffffff;padding:28px;border:1px solid #e0e0e0;">
    <h2 style="color:#1a1a1a;margin:0 0 8px;">🔔 New CA Signup!</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">
      A new CA has registered and is waiting for your approval.
    </p>

    <div style="background:#f8f8f8;border-radius:10px;padding:18px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            <span style="font-size:11px;color:#888;display:block;">NAME</span>
            <strong style="font-size:15px;color:#1a1a1a;">${name}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="font-size:11px;color:#888;display:block;">EMAIL</span>
            <strong style="font-size:15px;color:#1a1a1a;">${email}</strong>
          </td>
        </tr>
      </table>
    </div>

    <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px;margin-bottom:20px;">
      <p style="font-size:13px;color:#f57f17;margin:0;">
        ⚠️ To approve this CA, open your admin panel on your computer at:<br/>
        <strong>http://localhost:3000/admin</strong><br/><br/>
        After deploying to Vercel:<br/>
        <strong>https://sovary-compliance.vercel.app/admin</strong>
      </p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
      <p style="font-size:13px;color:#166534;margin:0 0 8px;">
        <strong>How to approve:</strong>
      </p>
      <ol style="font-size:13px;color:#166534;margin:0;padding-left:16px;line-height:2;">
        <li>Open admin panel on your computer</li>
        <li>Find <strong>${name}</strong> in the list</li>
        <li>Click <strong>✓ Approve</strong> button</li>
        <li>CA gets 3 week free trial automatically</li>
      </ol>
    </div>
  </div>

  <div style="background:#f4f4f4;padding:16px;text-align:center;border-radius:0 0 12px 12px;">
    <p style="font-size:11px;color:#999;margin:0;">
      SOVARY Compliance · Admin Alert<br/>
      This is an automated notification.
    </p>
  </div>

</div>`,
      }),
    });

    const data = await res.json();
    console.log("Resend API response:", JSON.stringify(data));

    if (!res.ok) {
      return Response.json({ success: false, error: data.message });
    }

    return Response.json({ success: true, id: data.id });

  } catch (e) {
    console.log("ERROR:", e.message);
    return Response.json({ success: false, error: e.message });
  }
}