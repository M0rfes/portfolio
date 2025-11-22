import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPostBySlug } from '@/lib/blog';
import { BlogContent } from '@/components/BlogContent';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const url = `https://fahim.shonif.com/blogs/${slug}`;
  const imageUrl = post.coverImage || 'https://fahim.shonif.com/me.avif';
  
  return {
    title: `${post.title} | Fahim Khan`,
    description: post.excerpt || `Read ${post.title} by Fahim Khan`,
    keywords: post.keywords.join(', '),
    authors: [{ name: 'Fahim Khan' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} by Fahim Khan`,
      type: 'article',
      url: url,
      siteName: 'Fahim Khan - Software Consultant',
      locale: 'en_US',
      publishedTime: post.date,
      authors: ['Fahim Khan'],
      tags: post.keywords,
      images: [
        {
          url: imageUrl,
          alt: post.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@M0rfes',
      creator: '@M0rfes',
      title: post.title,
      description: post.excerpt || `Read ${post.title} by Fahim Khan`,
      images: [imageUrl],
    },
    other: {
      // Additional metadata for various platforms
      'article:author': 'Fahim Khan',
      'article:published_time': post.date,
      'article:tag': post.keywords.join(', '),
      // Schema.org for structured data
      'schema:type': 'Article',
      'schema:author': 'Fahim Khan',
      'schema:datePublished': post.date,
      // Bluesky and Mastodon use Open Graph, but these help with indexing
      'fediverse:creator': '@morfes',
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogContent post={post} />;
}
