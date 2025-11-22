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

  return {
    title: `${post.title} | Fahim Khan`,
    description: post.excerpt || `Read ${post.title} by Fahim Khan`,
    keywords: post.keywords.join(', '),
    authors: [{ name: 'Fahim Khan' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} by Fahim Khan`,
      type: 'article',
      publishedTime: post.date,
      images: post.coverImage ? [
        {
          url: post.coverImage,
          alt: post.title,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `Read ${post.title} by Fahim Khan`,
      images: post.coverImage ? [post.coverImage] : undefined,
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
