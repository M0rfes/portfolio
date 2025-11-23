"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, Calendar, Tag } from 'lucide-react';
import { BlogPostMetadata } from '@/lib/blog';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogListProps {
  initialPosts: BlogPostMetadata[];
}

export function BlogList({ initialPosts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return initialPosts;
    }

    const searchTerm = searchQuery.toLowerCase().trim();
    
    return initialPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(searchTerm);
      const slugMatch = post.slug.toLowerCase().includes(searchTerm);
      const keywordsMatch = post.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm)
      );
      const excerptMatch = post.excerpt?.toLowerCase().includes(searchTerm);

      return titleMatch || slugMatch || keywordsMatch || excerptMatch;
    });
  }, [searchQuery, initialPosts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Search Section */}
      <div className="mb-12">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search blogs by title, keyword, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-[var(--portfolio-primary)] focus:border-transparent bg-card shadow-sm text-foreground placeholder-muted-foreground"
          />
        </div>
        {searchQuery && (
          <p className="text-center text-muted-foreground mt-4">
            Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        )}
      </div>

      {/* Blog Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No posts found matching your search.' : 'No blog posts available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/blogs/${post.slug}`}>
                <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] overflow-hidden">
                    {post.coverImage ? (
                      <ImageWithFallback
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {post.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Date */}
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(post.date)}</span>
                    </div>

                    {/* Keywords */}
                    {post.keywords && post.keywords.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-wrap gap-2">
                          {post.keywords.slice(0, 3).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 text-xs font-medium bg-[var(--portfolio-primary)]/10 text-[var(--portfolio-primary)] rounded-full dark:text-[var(--portfolio-secondary)] dark:bg-[var(--portfolio-secondary)]/10"
                            >
                              {keyword}
                            </span>
                          ))}
                          {post.keywords.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs font-medium text-muted-foreground">
                              +{post.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
