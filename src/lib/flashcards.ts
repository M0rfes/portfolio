import fs from "node:fs";
import path from "node:path";

export type FlashcardSourceType = "blog" | "note";

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  sourceType: FlashcardSourceType;
  sourceId: string;
  sourceTitle: string;
  sourceHref: string;
  tags: string[];
};

type FlashcardsIndex = {
  cards: Flashcard[];
  tags?: string[];
};

const INDEX_PATH = path.join(process.cwd(), "src/content/flashcards/index.json");

function readIndex(): FlashcardsIndex {
  if (!fs.existsSync(INDEX_PATH)) {
    return { cards: [], tags: [] };
  }
  const parsed = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as FlashcardsIndex;
  return { cards: parsed.cards ?? [], tags: parsed.tags ?? [] };
}

export function getAllFlashcards(): Flashcard[] {
  return readIndex().cards;
}

export function getFlashcardTags(cards = getAllFlashcards()): string[] {
  const catalog = readIndex().tags ?? [];
  if (catalog.length) return catalog;
  const tags = new Set<string>();
  for (const card of cards) {
    for (const tag of card.tags) {
      if (tag) tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
