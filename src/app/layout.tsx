import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title:
    "Fahim Khan | Senior Software Consultant | React & Node.js Expert | Dubai",
  description:
    "Senior Software Consultant specializing in React, Node.js, and cloud solutions. Currently at Presight AI, Dubai. Available for freelance projects and full-time opportunities globally.",
  keywords:
    "Fahim Khan, Software Consultant, Full-Stack Developer, React, Node.js, TypeScript, Dubai, UAE, Mumbai, Freelance, Remote Work",
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
      "Fahim Khan | Senior Software Consultant | React & Node.js Expert | Dubai",
    description:
      "Senior Software Consultant specializing in React, Node.js, and cloud solutions. Currently at Presight AI, Dubai. Available for freelance projects and full-time opportunities globally.",
    images: [
      {
        url: "/me.avif",
        alt: "Fahim Khan - Software Consultant Profile Picture",
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
      "Fahim Khan | Senior Software Consultant | React & Node.js Expert | Dubai",
    description:
      "Senior Software Consultant specializing in React, Node.js, and cloud solutions. Currently at Presight AI, Dubai. Available for freelance projects and full-time opportunities globally.",
    images: [
      {
        url: "/me.avif",
        alt: "Fahim Khan - Software Consultant Profile Picture",
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
    profession: "Software Consultant",
    experience: "Senior Level",
    location: "Dubai, UAE",
    availability: "Available for freelance and full-time opportunities",
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
    jobTitle: "Senior Software Consultant",
    description:
      "Senior Software Consultant specializing in React, Node.js, and cloud solutions",
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
      addressLocality: "Dubai",
      addressCountry: "UAE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+971-507-286-133",
      email: "fahimkhan20148@gmail.com",
      contactType: "professional",
    },
    knowsAbout: [
      "React",
      "Node.js",
      "TypeScript",
      "Full-Stack Development",
      "Cloud Solutions",
      "Software Architecture",
      "API Development",
      "Database Design",
    ],
  };

  return (
    <html lang="en">
      <head>
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
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
