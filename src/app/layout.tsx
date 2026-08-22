import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title:
    "Fahim Khan | Senior Software Engineer | Distributed Systems & AI | Abu Dhabi",
  description:
    "Senior Software Engineer building high-performance services, distributed systems, and AI/agent tooling. Rust, TypeScript, and cloud infrastructure. Currently at Presight AI, Abu Dhabi.",
  keywords:
    "Fahim Khan, Senior Software Engineer, Distributed Systems, Rust, TypeScript, LLMs, AI Agents, Kubernetes, Fintech, Abu Dhabi, UAE",
  authors: [{ name: "Fahim Khan" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1.0",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title:
      "Fahim Khan | Senior Software Engineer | Distributed Systems & AI | Abu Dhabi",
    description:
      "Senior Software Engineer building high-performance services, distributed systems, and AI/agent tooling. Rust, TypeScript, and cloud infrastructure.",
    images: [
      {
        url: "/me.avif",
        alt: "Fahim Khan - Senior Software Engineer",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
    siteName: "Fahim Khan Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@M0rfes",
    creator: "@M0rfes",
    title:
      "Fahim Khan | Senior Software Engineer | Distributed Systems & AI | Abu Dhabi",
    description:
      "Senior Software Engineer building high-performance services, distributed systems, and AI/agent tooling.",
    images: [
      {
        url: "/me.avif",
        alt: "Fahim Khan - Senior Software Engineer",
      },
    ],
  },
  other: {
    "linkedin:owner": "fahim-khan-232533346",
    "theme-color": "#0f4c75",
    "msapplication-TileColor": "#0f4c75",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Fahim Khan",
    profession: "Senior Software Engineer",
    experience: "Senior Level",
    location: "Abu Dhabi, UAE",
    availability: "Available for full-time opportunities",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Fahim Khan",
    jobTitle: "Senior Software Engineer",
    description:
      "Senior Software Engineer building high-performance services, distributed systems, and AI/agent tooling",
    url: "https://fahimkhan.dev",
    image: "/me.avif",
    sameAs: [
      "https://github.com/M0rfes",
      "https://www.linkedin.com/in/fahim-khan-232533346/",
      "https://x.com/M0rfes",
      "https://www.instagram.com/m0rfes/",
      "https://www.facebook.com/M0rfes",
      "https://bsky.app/profile/morfes.bsky.social",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Presight AI",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abu Dhabi",
      addressCountry: "UAE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+971-507-286-133",
      email: "fahimkhan20148@gmail.com",
      contactType: "professional",
    },
    knowsAbout: [
      "Distributed Systems",
      "Rust",
      "TypeScript",
      "Go",
      "LLMs",
      "AI Agents",
      "Kubernetes",
      "System Design",
      "Event-Driven Architecture",
      "Observability",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning is applied to <html> because the theme script
          (see <Script id="theme-script" ... />) may change the <html> class before React hydrates,
          causing a hydration mismatch only for the class attribute.
          This suppression is intentionally broad due to Next.js limitations. */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'theme-catppuccin-mocha';
                document.documentElement.className = theme;
              } catch (e) {}
            `,
          }}
        />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`antialiased min-h-screen bg-background overflow-x-clip`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Analytics />
          <SpeedInsights />
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
