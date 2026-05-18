import crypto from "crypto";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = await req.json();

    // Check all required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: "Missing payment details" }, { status: 400 });
    }

    if (!userId || !plan) {
      return Response.json({ error: "Missing user details" }, { status: 400 });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return Response.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update user in Firestore
    const { db } = await import("@/lib/firebase");
    const { doc, updateDoc } = await import("firebase/firestore");

    const planExpiry = new Date();
    planExpiry.setMonth(planExpiry.getMonth() + 1);

    await updateDoc(doc(db, "users", userId), {
      status:        "active",
      plan:          plan,
      planStart:     new Date(),
      planExpiry:    planExpiry,
      lastPaymentId: razorpay_payment_id,
      lastOrderId:   razorpay_order_id,
      paidAt:        new Date(),
      updatedAt:     new Date(),
    });

    console.log(`✅ Payment verified for ${userId}, plan: ${plan}`);

    return Response.json({
      success: true,
      message: "Payment verified successfully!",
      plan,
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}