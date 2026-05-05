export async function POST(req) {
  try {
    const { name, email } = await req.json();
    const RESEND_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_KEY) {
      return Response.json({ success: false, error: "No Resend key" });
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
    <div style="font-family:Georgia,serif;font-size:22px;color:#7eba5a;">SOVARY Compliance</div>
    <div style="font-size:11px;color:#606b56;margin-top:4px;letter-spacing:2px;">ADMIN NOTIFICATION</div>
  </div>
  <div style="background:#ffffff;padding:28px;border:1px solid #e0e0e0;">
    <h2 style="color:#1a1a1a;margin:0 0 8px;">🔔 New CA Signup!</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px;">
      A new CA has registered and is waiting for your approval.
    </p>
    <div style="background:#f8f8f8;border-radius:10px;padding:18px;margin-bottom:20px;">
      <div style="margin-bottom:12px;">
        <span style="font-size:11px;color:#888;display:block;margin-bottom:4px;">NAME</span>
        <strong style="font-size:16px;color:#1a1a1a;">${name}</strong>
      </div>
      <div>
        <span style="font-size:11px;color:#888;display:block;margin-bottom:4px;">EMAIL</span>
        <strong style="font-size:16px;color:#1a1a1a;">${email}</strong>
      </div>
    </div>
    <a href="https://sovary-compliance.vercel.app/admin"
      style="display:inline-block;background:#7eba5a;color:#0c0f0a;
      border-radius:8px;padding:14px 28px;font-size:14px;
      font-weight:600;text-decoration:none;margin-bottom:16px;">
      ✓ Go to Admin Panel
    </a>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;margin-top:8px;">
      <p style="font-size:13px;color:#166534;margin:0 0 8px;"><strong>How to approve:</strong></p>
      <ol style="font-size:13px;color:#166534;margin:0;padding-left:16px;line-height:2;">
        <li>Click button above to open Admin Panel</li>
        <li>Find <strong>${name}</strong> in the list</li>
        <li>Click <strong>✓ Approve</strong> button</li>
        <li>CA gets 3 week free trial automatically</li>
      </ol>
    </div>
  </div>
  <div style="background:#f4f4f4;padding:14px;text-align:center;border-radius:0 0 12px 12px;">
    <p style="font-size:11px;color:#999;margin:0;">SOVARY Compliance · Admin Alert</p>
  </div>
</div>`,
      }),
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ success: false, error: data.message });
    return Response.json({ success: true, id: data.id });

  } catch (e) {
    return Response.json({ success: false, error: e.message });
  }
}