import { Metadata } from "next";
import { AboutContent } from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "About | Fahim Khan - Software Consultant",
  description:
    "Learn about Fahim Khan's journey from Mumbai slums to global tech leadership. Senior Software Consultant specializing in React, Node.js, and cloud solutions.",
  keywords:
    "about, Fahim Khan, software consultant, journey, background, career",
  openGraph: {
    title: "About | Fahim Khan",
    description:
      "Learn about Fahim Khan's journey from Mumbai slums to global tech leadership.",
    type: "website",
    url: "https://fahim.shonif.com/about",
    siteName: "Fahim Khan - Software Consultant",
    locale: "en_US",
    images: [
      {
        url: "https://fahim.shonif.com/me.avif",
        alt: "Fahim Khan - Software Consultant",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@M0rfes",
    creator: "@M0rfes",
    title: "About | Fahim Khan",
    description:
      "Learn about Fahim Khan's journey from Mumbai slums to global tech leadership.",
    images: ["https://fahim.shonif.com/me.avif"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <AboutContent />
    </div>
  );
}
