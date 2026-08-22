"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { PrismThemeSync } from "./PrismThemeSync";
import { ReactNode } from "react";
import { NoteMeta } from "@/lib/notes";

interface NoteContentProps {
  note: NoteMeta;
  children: ReactNode;
}

export function NoteContent({ note, children }: NoteContentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/notes/">
          <motion.div
            className="inline-flex items-center gap-2 text-primary hover:text-secondary mb-8 transition-colors cursor-pointer"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Notes</span>
          </motion.div>
        </Link>

        <motion.article
          className="blog-article"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="blog-meta">
            <div className="blog-meta-item">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
            {note.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span key={tag} className="blog-keyword">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none">{children}</div>
        </motion.article>
      </div>
      <PrismThemeSync />
    </div>
  );
}
