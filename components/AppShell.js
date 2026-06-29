"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Spinner } from "./ui";
import Link from "next/link";

export default function AppShell({ children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [firm, setFirm] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const isAdmin = user.email === "kishoreyadla100@gmail.com" || userData?.role === "admin";

    if (isAdmin) {
      return;
    }

    if (!userData) return;

    if (userData.status === "pending") {
      router.push("/pending");
      return;
    }

    if (!userData.onboarded) {
      router.push("/onboarding");
      return;
    }

    if (userData.status === "expired") {
      router.push("/pricing");
      return;
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (user) {
      import("@/lib/firestore").then(({ getFirm }) => {
        getFirm(user.uid)
          .then(f => setFirm({ ...(f || {}), firmName: "SOVARY Compliance" }))
          .catch(() => setFirm({ firmName: "SOVARY Compliance" }));
      });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Spinner size={32} />
      </div>
    );
  }

  const isAdmin = user.email === "kishoreyadla100@gmail.com" || userData?.role === "admin";

  if (!isAdmin && userData?.status === "pending") {
    return null;
  }

  if (!isAdmin && !userData?.onboarded) {
    return null;
  }

  const isExpired = !isAdmin && (
    userData?.status === "expired" ||
    (userData?.status === "trial" && userData?.trialEnd &&
      new Date() > new Date(
        userData.trialEnd?.seconds
          ? userData.trialEnd.seconds * 1000
          : userData.trialEnd
      ))
  );

  if (isExpired) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar firm={firm} />
      <main style={{
        flex: 1,
        marginLeft: 220,
        minHeight: "100vh",
        padding: "32px 32px 80px",
        maxWidth: "calc(100vw - 220px)"
      }} className="main-content">

        {isExpired && (
          <div style={{
            background: "rgba(224,92,92,0.08)",
            border: "1px solid rgba(224,92,92,0.3)",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>
                ⚠ Trial Expired
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Your 3-week free trial has ended. Upgrade to continue.
              </div>
            </div>
            <Link
              href="/pricing"
              style={{
                background: "var(--accent)",
                color: "#0c0f0a",
                borderRadius: 7,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              Upgrade ₹1,999/mo
            </Link>
          </div>
        )}

        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding: 20px 16px 80px !important;
          }
        }
      `}</style>
    </div>
  );
}