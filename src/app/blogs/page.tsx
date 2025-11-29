import { Metadata } from "next";
import { BlogList } from "@/components/BlogList";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Fahim Khan - Software Consultant",
  description:
    "Read articles and insights about software development, React, Node.js, and cloud solutions by Fahim Khan.",
  keywords:
    "blog, articles, software development, React, Node.js, TypeScript, tutorials, insights",
  openGraph: {
    title: "Blog | Fahim Khan",
    description:
      "Read articles and insights about software development, React, Node.js, and cloud solutions.",
    type: "website",
    url: "https://fahim.shonif.com/blogs",
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
    title: "Blog | Fahim Khan",
    description:
      "Read articles and insights about software development, React, Node.js, and cloud solutions.",
    images: ["https://fahim.shonif.com/me.avif"],
  },
  other: {
    // Additional metadata for various platforms
    "fediverse:creator": "@morfes",
  },
};

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--portfolio-primary)] mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore articles, tutorials, and insights about software development
            and technology
          </p>
        </div>
        <BlogList initialPosts={posts} />
      </div>
    </div>
  );
}
