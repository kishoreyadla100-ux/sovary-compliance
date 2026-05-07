"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";

const PLANS = [
  {
    id:       "starter",
    name:     "Starter",
    price:    1999,
    clients:  50,
    features: ["50 Clients", "All Compliance Deadlines", "AI Assistant", "Email Reminders", "Invoices & Reports"],
    color:    "#7eba5a",
  },
  {
    id:       "professional",
    name:     "Professional",
    price:    3999,
    clients:  200,
    features: ["200 Clients", "All Starter Features", "Priority Support", "Advanced Reports", "Bulk Reminders"],
    color:    "#5ab8e0",
    popular:  true,
  },
  {
    id:       "enterprise",
    name:     "Enterprise",
    price:    7999,
    clients:  "Unlimited",
    features: ["Unlimited Clients", "All Pro Features", "Dedicated Support", "Custom Integrations", "White Label"],
    color:    "#d4a843",
  },
];

export default function PricingPage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(null);
  const [error, setError]     = useState("");

  const handlePayment = async (plan) => {
    if (!user) return router.push("/login");
    setLoading(plan.id);
    setError("");

    try {
      // Create order
      const orderRes = await fetch("https://sovary-compliance.vercel.app/api/razorpay/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan:      plan.id,
          userId:    user.uid,
          userEmail: user.email,
          userName:  user.displayName,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Open Razorpay
      const options = {
        key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:   orderData.amount,
        currency: orderData.currency,
        name:     "SOVARY Compliance",
        description: `${plan.name} Plan - Monthly Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name:  user.displayName,
          email: user.email,
        },
        theme: { color: plan.color },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyRes = await fetch("https://sovary-compliance.vercel.app/api/razorpay/verify-payment", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                userId: user.uid,
                plan:   plan.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              await refreshUserData();
              alert("🎉 Payment successful! Welcome to SOVARY " + plan.name + "!");
              router.push("/dashboard");
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            setError("Payment verification failed: " + err.message);
          }
          setLoading(null);
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <AppShell>
      <div className="animate-fadeUp">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "DM Serif Display,serif", fontSize: 36, fontWeight: 400 }}>
            Choose Your Plan
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
            Simple, transparent pricing for Indian CA firms
          </p>
          {userData?.status === "expired" && (
            <div style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 10, padding: "12px 20px", marginTop: 16, display: "inline-block" }}>
              <span style={{ color: "var(--red)", fontSize: 13 }}>⚠️ Your trial has expired. Please choose a plan to continue.</span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 8, padding: 14, marginBottom: 20, textAlign: "center", color: "var(--red)", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
          {PLANS.map(plan => (
            <div key={plan.id} className="card" style={{
              border: plan.popular ? `2px solid ${plan.color}` : "1px solid var(--border)",
              position: "relative",
              transition: "transform 0.2s",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: plan.color, color: "white",
                  padding: "4px 16px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: plan.color, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.1em", marginBottom: 8 }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: "DM Serif Display,serif", fontSize: 40, color: plan.color }}>
                  ₹{plan.price.toLocaleString("en-IN")}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>per month</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  Up to {plan.clients} Clients
                </div>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--muted)" }}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePayment(plan)}
                disabled={loading === plan.id}
                style={{
                  width: "100%", padding: "12px",
                  background: plan.popular ? plan.color : "transparent",
                  color: plan.popular ? "white" : plan.color,
                  border: `2px solid ${plan.color}`,
                  borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "0.2s",
                }}
              >
                {loading === plan.id ? "Processing..." : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginTop: 30 }}>
          Secure payments powered by Razorpay · Cancel anytime · GST applicable
        </p>
      </div>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </AppShell>
  );
}