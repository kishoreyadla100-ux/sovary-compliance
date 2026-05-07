import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  starter:      { amount: 199900, name: "Starter Plan"      }, // ₹1,999
  professional: { amount: 399900, name: "Professional Plan" }, // ₹3,999
  enterprise:   { amount: 799900, name: "Enterprise Plan"   }, // ₹7,999
};

export async function POST(req) {
  try {
    const { plan, userId, userEmail, userName } = await req.json();

    if (!PLANS[plan]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount:   PLANS[plan].amount,
      currency: "INR",
      receipt:  `receipt_${userId}_${Date.now()}`,
      notes: {
        userId,
        userEmail,
        userName,
        plan,
      },
    });

    return Response.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      plan,
      planName: PLANS[plan].name,
    });

  } catch (error) {
    console.error("Razorpay order error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}