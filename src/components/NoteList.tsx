"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Link2, Network, Search, Tag } from "lucide-react";
import { NoteMeta } from "@/lib/notes";

interface NoteListProps {
  initialNotes: NoteMeta[];
}

export function NoteList({ initialNotes }: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return initialNotes;
    const searchTerm = searchQuery.toLowerCase().trim();
    return initialNotes.filter((note) => {
      return (
        note.title.toLowerCase().includes(searchTerm) ||
        note.folder.toLowerCase().includes(searchTerm) ||
        note.slug.join("/").includes(searchTerm) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        note.summary?.toLowerCase().includes(searchTerm)
      );
    });
  }, [searchQuery, initialNotes]);

  const grouped = useMemo(() => {
    const groups = new Map<string, NoteMeta[]>();
    for (const note of filteredNotes) {
      const bucket = groups.get(note.folder) ?? [];
      bucket.push(note);
      groups.set(note.folder, bucket);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredNotes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-2xl flex-1 mx-auto sm:mx-0 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search notes by title, folder, or tag..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="block w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:ring-2 focus:ring-[var(--portfolio-primary)] focus:border-transparent bg-card shadow-sm text-foreground placeholder-muted-foreground"
          />
        </div>
        <Link
          href="/notes/graph/"
          className="inline-flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Network className="w-5 h-5" />
          Graph
        </Link>
      </div>

      {searchQuery && (
        <p className="text-center text-muted-foreground mb-8">
          Found {filteredNotes.length}{" "}
          {filteredNotes.length === 1 ? "note" : "notes"}
        </p>
      )}

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery
              ? "No notes found matching your search."
              : "No notes available yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(([folder, notes]) => (
            <section key={folder}>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {folder}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map((note, index) => (
                  <motion.div
                    key={note.href}
                    className="min-w-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col min-w-0">
                      <div className="p-6 flex flex-col flex-grow min-w-0">
                        <Link href={note.href} className="min-w-0">
                          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 break-words">
                            {note.title}
                          </h3>
                          {note.summary && (
                            <p className="text-muted-foreground mb-4 line-clamp-3 break-words">
                              {note.summary}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <Calendar className="w-4 h-4 mr-2 shrink-0" />
                            <span>{formatDate(note.updatedAt)}</span>
                          </div>
                        </Link>
                        {note.tags.length > 0 && (
                          <div className="flex items-start gap-2 min-w-0">
                            <Tag className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-wrap gap-2 min-w-0">
                              {note.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block max-w-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full break-words"
                                >
                                  {tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="inline-block px-2 py-1 text-xs font-medium text-muted-foreground">
                                  +{note.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {note.linkedFrom.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-border min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Link2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Linked from</span>
                            </div>
                            <div className="flex flex-wrap gap-2 min-w-0">
                              {note.linkedFrom.slice(0, 3).map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className="text-xs text-primary hover:text-secondary break-words max-w-full"
                                >
                                  {item.title}
                                </Link>
                              ))}
                              {note.linkedFrom.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{note.linkedFrom.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
