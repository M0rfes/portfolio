import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPostBySlug } from '@/lib/blog';
import { BlogContent } from '@/components/BlogContent';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import Image from 'next/image';

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
      ...Object.fromEntries(post.keywords.map((tag, i) => [`article:tag:${i}`, tag])),
      // Schema.org for structured data
      'schema:type': 'Article',
      'schema:author': 'Fahim Khan',
      'schema:datePublished': post.date,
      // Bluesky and Mastodon use Open Graph, but these help with indexing
      'fediverse:creator': '@morfes',
    },
  };
}

const mdxComponents = {
  // Custom component for images
  img: (props: { alt?: string; src?: string; width?: number | string; height?: number | string }) => {
    const { alt, src, width: w, height: h } = props;
    if (!src) return null;
    const width = typeof w === 'string' ? parseInt(w, 10) : w || 1200;
    const height = typeof h === 'string' ? parseInt(h, 10) : h || 630;
    const hasAlt = !!(alt && alt.trim());
    return (
      <span className="block my-8">
        <Image
          src={src}
          alt={hasAlt ? alt! : ''}
          role={hasAlt ? undefined : 'presentation'}
          width={width}
          height={height}
          loading="lazy"
          className="rounded-lg shadow-md w-full h-auto"
        />
      </span>
    );
  },
  // Custom component for videos
  video: ({ ...props }) => (
    <span className="block my-8">
      <video
        {...props}
        className="rounded-lg shadow-md w-full"
        controls
      />
    </span>
  ),
  // Custom component for links
  a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      {...props}
      className="blog-link"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    />
  ),
  // Custom component for code blocks
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className;
    return isInline ? (
      <code
        className="blog-inline-code"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  // Custom component for tables
  table: ({ ...props }) => (
    <div className="overflow-x-auto my-8">
      <table className="blog-table" {...props} />
    </div>
  ),
  thead: ({ ...props }) => (
    <thead className="blog-thead" {...props} />
  ),
  tbody: ({ ...props }) => (
    <tbody className="blog-tbody" {...props} />
  ),
  th: ({ ...props }) => (
    <th className="blog-th" {...props} />
  ),
  td: ({ ...props }) => (
    <td className="blog-td" {...props} />
  ),
  // Custom component for headings
  h1: ({ ...props }) => (
    <h1 className="blog-h1" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="blog-h2" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="blog-h3" {...props} />
  ),
  // Custom component for paragraphs
  p: ({ ...props }) => (
    <p className="blog-p" {...props} />
  ),
  // Custom component for blockquotes
  blockquote: ({ ...props }) => (
    <blockquote className="blog-blockquote" {...props} />
  ),
  // Custom component for lists
  ul: ({ ...props }) => (
    <ul className="blog-ul" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="blog-ol" {...props} />
  ),
  // Custom component for strong/bold text
  strong: ({ ...props }) => (
    <strong className="blog-strong" {...props} />
  ),
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  // Validate slug exists and is a string
  if (!slug || typeof slug !== 'string') {
    notFound();
  }
  
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { content, ...postData } = post;

  return (
    <BlogContent post={postData}>
      <MDXRemote 
        source={content} 
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypePrism],
          },
        }}
      />
    </BlogContent>
  );
}
