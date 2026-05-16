export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: "100vh",
          background: "#0c0f0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "Inter, sans-serif",
        }}>
          <div style={{
            fontFamily: "Georgia, serif",
            fontSize: 32,
            color: "#c4956a",
          }}>
            SOVARY
          </div>
          <div style={{ fontSize: 64, color: "#7eba5a" }}>404</div>
          <div style={{ fontSize: 18, color: "#f5f0e8" }}>Page Not Found</div>
          <div style={{ fontSize: 14, color: "#8b9bb4" }}>
            The page you're looking for doesn't exist.
          </div>
          <a href="/login" style={{
            marginTop: 16,
            background: "#7eba5a",
            color: "#0c0f0a",
            padding: "12px 24px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
          }}>
            Go to Login
          </a>
        </div>
      </body>
    </html>
  );
}