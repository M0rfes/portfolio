import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBlogSlugs, getBlogBySlug } from "@/lib/blog";
import { BlogContent } from "@/components/BlogContent";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Post Not Found",
    };
  }

  const { meta } = blog;
  const url = `https://fahim.shonif.com/blogs/${slug}`;
  const imageUrl = meta.coverImage || "https://fahim.shonif.com/me.avif";

  return {
    title: `${meta.title} | Fahim Khan`,
    description: meta.excerpt || `Read ${meta.title} by Fahim Khan`,
    keywords: meta.keywords.join(", "),
    authors: [{ name: "Fahim Khan" }],
    openGraph: {
      title: meta.title,
      description: meta.excerpt || `Read ${meta.title} by Fahim Khan`,
      type: "article",
      url: url,
      siteName: "Fahim Khan - Software Consultant",
      locale: "en_US",
      publishedTime: meta.date,
      authors: ["Fahim Khan"],
      tags: meta.keywords,
      images: [
        {
          url: imageUrl,
          alt: meta.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@M0rfes",
      creator: "@M0rfes",
      title: meta.title,
      description: meta.excerpt || `Read ${meta.title} by Fahim Khan`,
      images: [imageUrl],
    },
    other: {
      "article:author": "Fahim Khan",
      "article:published_time": meta.date,
      ...Object.fromEntries(
        meta.keywords.map((tag, i) => [`article:tag:${i}`, tag]),
      ),
      "schema:type": "Article",
      "schema:author": "Fahim Khan",
      "schema:datePublished": meta.date,
      "fediverse:creator": "@morfes",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    notFound();
  }

  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const { meta, Content } = blog;

  return (
    <BlogContent post={{ slug, ...meta }}>
      <Content />
    </BlogContent>
  );
}
