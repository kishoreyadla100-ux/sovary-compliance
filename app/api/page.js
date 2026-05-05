export async function POST(req) {
  try {
    const {
      clientName, clientEmail, filingType,
      filingSubtype, period, dueDate,
      daysLeft, firmName, firmEmail, firmPhone,
    } = await req.json();

    if (!clientEmail) return Response.json({ success:false, error:"No client email" }, { status:400 });

    const RESEND_KEY  = process.env.RESEND_API_KEY;
    const urgColor    = daysLeft < 0 ? "#e05c5c" : daysLeft <= 3 ? "#e08c5c" : "#c9a227";
    const urgText     = daysLeft < 0
      ? `⚠️ OVERDUE by ${Math.abs(daysLeft)} days`
      : daysLeft === 0 ? "⏰ Due TODAY" : `📅 Due in ${daysLeft} days`;
    const subject     = daysLeft < 0
      ? `URGENT: Overdue ${filingType} ${filingSubtype} (${period})`
      : `Reminder: ${filingType} ${filingSubtype} due on ${dueDate}`;

    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#0b0e09;padding:24px;border-radius:12px 12px 0 0;">
    <div style="font-family:Georgia,serif;font-size:22px;color:#7eba5a;">${firmName || "SOVARY Compliance"}</div>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #e0e0e0;">
    <p style="color:#333;font-size:15px;">Dear <strong>${clientName}</strong>,</p>
    <div style="background:${urgColor}15;border-left:3px solid ${urgColor};padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;">
      <strong style="color:${urgColor};">${urgText}</strong>
    </div>
    <p style="color:#444;font-size:14px;line-height:1.6;">
      This is a reminder from <strong>${firmName || "your CA firm"}</strong> regarding your compliance filing.
      Please ensure this is filed at the earliest to avoid penalties.
    </p>
    <table style="width:100%;background:#f8f8f8;border-radius:8px;margin:20px 0;border-collapse:collapse;">
      <tr><td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:12px;color:#888;">Filing</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:13px;font-weight:700;">${filingType} — ${filingSubtype}</td></tr>
      <tr><td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:12px;color:#888;">Period</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:13px;">${period}</td></tr>
      <tr><td style="padding:10px 16px;font-size:12px;color:#888;">Due Date</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:700;color:${urgColor};">${dueDate}</td></tr>
    </table>
    ${firmPhone ? `<p style="color:#888;font-size:12px;">📱 ${firmPhone}</p>` : ""}
    ${firmEmail ? `<p style="color:#888;font-size:12px;">📧 ${firmEmail}</p>` : ""}
    <p style="color:#444;font-size:14px;margin-top:20px;">
      Regards,<br/><strong>${firmName || "Your CA Firm"}</strong>
    </p>
  </div>
  <div style="background:#f4f4f4;padding:14px;text-align:center;border-radius:0 0 12px 12px;">
    <p style="font-size:11px;color:#999;margin:0;">Automated reminder via SOVARY Compliance</p>
  </div>
</div>`;

    const res  = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    `${firmName || "SOVARY Compliance"} <onboarding@resend.dev>`,
        to:      [clientEmail],
        subject, html,
      }),
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ success:false, error:data.message }, { status:400 });
    return Response.json({ success:true, id:data.id });

  } catch (e) {
    return Response.json({ success:false, error:e.message }, { status:500 });
  }
}