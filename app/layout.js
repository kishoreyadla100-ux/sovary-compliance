import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "SOVARY Compliance - AI-Powered Platform for CA Firms",
  description: "India's smartest compliance management platform for Chartered Accountants. Manage GST, TDS, ROC, MCA deadlines with AI assistance. 3 weeks free trial.",
  keywords: "GST compliance, TDS management, ROC filing, MCA compliance, CA software India, chartered accountant software",
  authors: [{ name: "Kishore Yadla" }],
  creator: "SOVARY Compliance",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "SOVARY Compliance - AI-Powered Platform for CA Firms",
    description: "Manage GST, TDS, ROC, MCA deadlines with AI assistance. Built for Indian CA firms.",
    url: "https://sovary-compliance.vercel.app",
    siteName: "SOVARY Compliance",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOVARY Compliance",
    description: "AI-powered compliance platform for Indian CA firms",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}