"use client";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard",     icon: "◈", label: "Dashboard"     },
  { href: "/clients",       icon: "◉", label: "Clients"       },
  { href: "/deadlines",     icon: "◷", label: "Deadlines"     },
  { href: "/reminders",     icon: "◎", label: "Reminders"     },
  { href: "/notifications", icon: "🔔", label: "Notifications" },
  { href: "/documents",     icon: "📁", label: "Documents"     },
  { href: "/invoices",      icon: "◫", label: "Invoices"       },
  { href: "/reports",       icon: "◧", label: "Reports"        },
  { href: "/ai",            icon: "✦", label: "AI Assistant"   },
  { href: "/settings",      icon: "⚙", label: "Settings"       },
];

const MOBILE_NAV = [
  { href: "/dashboard",     icon: "◈", label: "Home"      },
  { href: "/clients",       icon: "◉", label: "Clients"   },
  { href: "/deadlines",     icon: "◷", label: "Deadlines" },
  { href: "/notifications", icon: "🔔", label: "Alerts"   },
  { href: "/ai",            icon: "✦", label: "AI"        },
  { href: "/admin",         icon: "⬡", label: "Admin"     },
];

export default function Sidebar({ firm }) {
  const { user, userData, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const isAdmin  = userData?.role === "admin";

  const NavBtn = ({ item, activeColor = "var(--accent)" }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <button onClick={() => router.push(item.href)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 8, marginBottom: 2,
        border: "none", cursor: "pointer",
        background:  active ? `${activeColor}18` : "transparent",
        color:       active ? activeColor : "var(--muted)",
        fontSize: 13, fontFamily: "Inter, sans-serif", textAlign: "left",
        transition: "all 0.15s",
        borderLeft: active ? `2px solid ${activeColor}` : "2px solid transparent",
      }}>
        <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
        {item.label}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 220, minHeight: "100vh",
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0,
        zIndex: 40, overflowY: "auto",
      }} className="hide-mobile">

        {/* Logo - Always SOVARY Compliance */}
        <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "var(--accent)" }}>
            SOVARY
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "JetBrains Mono, monospace", marginTop: 2, letterSpacing: "0.12em" }}>
            COMPLIANCE
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(item => <NavBtn key={item.href} item={item} />)}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "10px 4px" }} />
              <NavBtn item={{ href: "/admin", icon: "⬡", label: "Admin Panel" }} activeColor="var(--gold)" />
            </>
          )}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            {user?.photoURL
              ? <img src={user.photoURL} style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} alt="" />
              : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.displayName}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button onClick={logout} style={{
            width: "100%", padding: "7px", background: "transparent",
            border: "1px solid var(--border)", borderRadius: 7,
            color: "var(--muted)", fontSize: 12, cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}>Sign Out</button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--surface)", borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-around",
        padding: "8px 0 14px", zIndex: 40,
      }} className="show-mobile">
        {MOBILE_NAV.map(item => {
          const active = pathname === item.href;
          return (
            <button key={item.href} onClick={() => router.push(item.href)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              color: active ? "var(--accent)" : "var(--muted)", padding: "4px 10px",
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}>
                {item.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </nav>

      <style jsx global>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .main-content {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding: 20px 16px 80px !important;
          }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hide-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}