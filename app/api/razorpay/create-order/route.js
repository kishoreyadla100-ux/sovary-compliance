import Razorpay from "razorpay";

const PLANS = {
  starter:      { amount: 199900, name: "Starter Plan"      },
  professional: { amount: 399900, name: "Professional Plan" },
  enterprise:   { amount: 799900, name: "Enterprise Plan"   },
};

export async function POST(req) {
  try {
    const { plan, userId, userEmail, userName } = await req.json();

    // Validate plan
    if (!PLANS[plan]) {
      return Response.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Check keys
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys missing");
      return Response.json({ error: "Payment service not configured" }, { status: 500 });
    }

    // Initialize Razorpay inside function (fixes edge runtime issue)
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order
    const order = await razorpay.orders.create({
      amount:   PLANS[plan].amount,
      currency: "INR",
      receipt:  `rcpt_${userId}_${Date.now()}`,
      notes: {
        userId,
        userEmail,
        userName,
        plan,
      },
    });

    console.log("✅ Order created:", order.id);

    return Response.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      plan,
      planName: PLANS[plan].name,
    });

  } catch (error) {
    console.error("❌ Razorpay order error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}