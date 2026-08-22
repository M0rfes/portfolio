import { Metadata } from "next";
import { NoteList } from "@/components/NoteList";
import { getAllNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Notes | Fahim Khan - Senior Software Engineer",
  description:
    "Published notes from Fahim Khan's Obsidian vault on software engineering, distributed systems, LLMs, and concurrency.",
  openGraph: {
    title: "Notes | Fahim Khan",
    description:
      "Published notes from Fahim Khan's Obsidian vault on software engineering, distributed systems, LLMs, and concurrency.",
    type: "website",
    url: "https://fahim.shonif.com/notes",
    siteName: "Fahim Khan - Senior Software Engineer",
    locale: "en_US",
  },
};

export default function NotesPage() {
  const notes = getAllNotes();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--portfolio-primary)] mb-4">
            Notes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Working notes from my Obsidian vault
          </p>
        </div>
        <NoteList initialNotes={notes} />
      </div>
    </div>
  );
}
