import { Metadata } from "next";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { getAllFlashcards, getFlashcardTags } from "@/lib/flashcards";

export const metadata: Metadata = {
  title: "Flashcards | Fahim Khan - Senior Software Engineer",
  description:
    "Study cards generated from published notes and blog posts on software engineering, distributed systems, and concurrency.",
  openGraph: {
    title: "Flashcards | Fahim Khan",
    description:
      "Study cards generated from published notes and blog posts.",
    type: "website",
    url: "https://fahim.shonif.com/flashcards",
    siteName: "Fahim Khan - Senior Software Engineer",
    locale: "en_US",
  },
};

export default function FlashcardsPage() {
  const cards = getAllFlashcards();
  const tags = getFlashcardTags(cards);

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--portfolio-primary)] mb-2">
            Cards
          </h1>
          <p className="text-sm text-muted-foreground">
            Tap to flip. Swipe to move. From notes and blogs.
          </p>
        </div>
        <FlashcardDeck cards={cards} tags={tags} />
      </div>
    </div>
  );
}
