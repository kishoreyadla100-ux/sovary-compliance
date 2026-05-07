import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return Response.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update user status in Firestore
    const planExpiry = new Date();
    planExpiry.setMonth(planExpiry.getMonth() + 1); // 1 month subscription

    await updateDoc(doc(db, "users", userId), {
      status:           "active",
      plan:             plan,
      planStart:        new Date(),
      planExpiry:       planExpiry,
      lastPaymentId:    razorpay_payment_id,
      lastOrderId:      razorpay_order_id,
      updatedAt:        new Date(),
    });

    console.log(`Payment verified for user ${userId}, plan: ${plan}`);
    return Response.json({ success: true, message: "Payment verified!" });

  } catch (error) {
    console.error("Payment verification error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}