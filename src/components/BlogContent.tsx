"use client";

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { BlogPost } from '@/lib/blog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Image from 'next/image';
import { ImgHTMLAttributes } from 'react';
import 'highlight.js/styles/github-dark.css';

interface BlogContentProps {
  post: BlogPost;
}

export function BlogContent({ post }: BlogContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/blogs">
          <motion.div
            className="inline-flex items-center gap-2 text-[var(--portfolio-primary)] hover:text-[var(--portfolio-secondary)] mb-8 transition-colors cursor-pointer"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Blogs</span>
          </motion.div>
        </Link>

        {/* Cover Image */}
        {post.coverImage && (
          <motion.div
            className="relative h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageWithFallback
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Article Header */}
        <motion.article
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            {/* Date */}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(post.date)}</span>
            </div>

            {/* Keywords */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 text-sm font-medium bg-[var(--portfolio-primary)]/10 text-[var(--portfolio-primary)] rounded-full dark:text-[var(--portfolio-secondary)] dark:bg-[var(--portfolio-secondary)]/10"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Markdown Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
              components={{
                // Custom component for images
                img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
                  const { alt, src, width: w, height: h } = props as {
                    alt?: string;
                    src?: string;
                    width?: number | string;
                    height?: number | string;
                  };
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
                a: ({ ...props }) => (
                  <a
                    {...props}
                    className="text-[var(--portfolio-primary)] hover:text-[var(--portfolio-secondary)] underline dark:text-[var(--portfolio-secondary)] dark:hover:text-[var(--portfolio-primary)] transition-colors"
                    target={props.href?.startsWith('http') ? '_blank' : undefined}
                    rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  />
                ),
                // Custom component for code blocks
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="bg-gray-100  text-[var(--portfolio-primary)] px-2 py-1 rounded text-sm font-mono"
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
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-gray-50 dark:bg-gray-700" {...props} />
                ),
                tbody: ({ ...props }) => (
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" {...props} />
                ),
                th: ({ ...props }) => (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />
                ),
                td: ({ ...props }) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" {...props} />
                ),
                // Custom component for headings
                h1: ({ ...props }) => (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3" {...props} />
                ),
                // Custom component for paragraphs
                p: ({ ...props }) => (
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4 font-medium" {...props} />
                ),
                // Custom component for blockquotes
                blockquote: ({ ...props }) => (
                  <blockquote className="border-l-4 border-[var(--portfolio-primary)] pl-4 py-2 my-6 italic text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-gray-700 rounded-r-lg" {...props} />
                ),
                // Custom component for lists
                ul: ({ ...props }) => (
                  <ul className="list-disc list-inside space-y-2 my-4 text-gray-900 dark:text-gray-100 font-medium marker:text-gray-900 dark:marker:text-gray-100" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 my-4 text-gray-900 dark:text-gray-100 font-medium marker:text-gray-900 dark:marker:text-gray-100" {...props} />
                ),
                // Custom component for strong/bold text
                strong: ({ ...props }) => (
                  <strong className="font-bold text-gray-950 dark:text-gray-50" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
