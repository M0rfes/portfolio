"use client";

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PrismThemeSync } from './PrismThemeSync';
import { ReactNode } from 'react';

interface BlogContentProps {
  post: {
    slug: string;
    title: string;
    coverImage: string;
    excerpt?: string;
    date: string;
    keywords: string[];
  };
  children: ReactNode;
}

export function BlogContent({ post, children }: BlogContentProps) {
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
            className="inline-flex items-center gap-2 text-primary hover:text-secondary mb-8 transition-colors cursor-pointer"
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
            className="relative h-96 rounded-2xl overflow-hidden mb-8 bg-primary"
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
          className="blog-article"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Title */}
          <h1 className="blog-title">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="blog-meta">
            {/* Date */}
            <div className="blog-meta-item">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(post.date)}</span>
            </div>

            {/* Keywords */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="blog-keyword"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MDX Content */}
          <div className="prose prose-lg max-w-none">
            {children}
          </div>
        </motion.article>
      </div>
      <PrismThemeSync />
    </div>
  );
}
