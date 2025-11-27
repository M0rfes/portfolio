"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Rocket, Target, Award, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { BlogPostMetadata } from "@/lib/blog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

function StatsGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    { number: "7+", label: "Years Experience", icon: Award, color: "text-primary" },
    { number: "20+", label: "Projects Delivered", icon: Rocket, color: "text-secondary" },
    { number: "5", label: "Companies", icon: Target, color: "text-accent" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="text-center p-6 bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
          <div className={`text-3xl mb-2 font-bold ${stat.color}`}>{stat.number}</div>
          <div className="text-sm text-card-foreground font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function LatestBlogs({ posts }: { posts: BlogPostMetadata[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <motion.h3 
        variants={itemVariants}
        className="text-2xl mb-8 font-bold text-primary text-center"
      >
        Latest from My Blog
      </motion.h3>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div
            key={post.slug}
            variants={itemVariants}
          >
            <Link href={`/blogs/${post.slug}`}>
              <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-border hover:border-primary/50">
                {/* Cover Image */}
                <div className="relative h-40 bg-gradient-to-br from-[var(--portfolio-primary)] to-[var(--portfolio-secondary)] overflow-hidden">
                  {post.coverImage ? (
                    <ImageWithFallback
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                      {post.title.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                    {post.title}
                  </h4>

                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-grow">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Date */}
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(post.date)}</span>
                  </div>

                  {/* Keywords */}
                  {post.keywords && post.keywords.length > 0 && (
                    <div className="flex items-start gap-1">
                      <Tag className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {post.keywords.slice(0, 2).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <motion.div
        variants={itemVariants}
        className="text-center mt-8"
      >
        <Link href="/blogs">
          <span className="text-primary hover:text-secondary font-semibold transition-colors duration-300">
            View all blogs →
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function SectionTitle() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="text-center mb-16"
    >
      <h2 className="text-4xl md:text-5xl mb-6 font-bold text-primary">
        At a Glance
      </h2>
      <p className="text-xl text-foreground max-w-3xl mx-auto font-medium">
        Quick stats and latest updates from my professional journey
      </p>
    </motion.div>
  );
}

interface AboutProps {
  latestPosts?: BlogPostMetadata[];
}

export function About({ latestPosts = [] }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4 bg-background overflow-x-clip">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <SectionTitle />

        {/* Stats Grid */}
        <StatsGrid />

        {/* Latest Blogs */}
        <LatestBlogs posts={latestPosts} />
      </div>
    </section>
  );
}