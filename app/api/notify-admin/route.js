import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, firmName = "", phone = "" } = await req.json();

    if (!name || !email) {
      return Response.json({ success: false, error: "Name and email required" }, { status: 400 });
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "kishoreyadla100@gmail.com",
      subject: `New CA Signup: ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;">
          <h2 style="color:#7eba5a;">🆕 New CA Signup</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Firm:</b> ${firmName || "Not provided"}</p>
          <p><b>Phone:</b> ${phone || "Not provided"}</p>
          <a href="https://sovary-compliance.vercel.app/admin" 
             style="display:block;background:#7eba5a;color:white;padding:16px;text-decoration:none;border-radius:10px;font-size:18px;font-weight:bold;text-align:center;margin:20px 0;">
            ✅ APPROVE CA NOW
          </a>
        </div>
      `
    });

    console.log(`Email sent for ${name} (${email})`);
    return Response.json({ success: true, message: "Notification sent" });

  } catch (error) {
    console.error("Resend error:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}