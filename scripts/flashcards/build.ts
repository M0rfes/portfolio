import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uniqueSortedTags } from "../notes/tags";
import { collectSources, type SourceType } from "./sources";

export type SourceCard = {
  id: string;
  question: string;
  answer: string;
};

export type SourceCardsFile = {
  source: {
    type: SourceType;
    id: string;
    title: string;
    href: string;
    tags: string[];
  };
  cards: SourceCard[];
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  sourceType: SourceType;
  sourceId: string;
  sourceTitle: string;
  sourceHref: string;
  tags: string[];
};

const ROOT = process.cwd();
const SOURCES_DIR = path.join(ROOT, "src/content/flashcards/sources");

function walkJsonFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkJsonFiles(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function parseSourceFile(raw: string, file: string): SourceCardsFile {
  const parsed = JSON.parse(raw) as {
    source?: {
      type?: string;
      id?: unknown;
      title?: unknown;
      href?: unknown;
      tags?: unknown;
    };
    cards?: unknown;
  };
  const type = parsed.source?.type;
  if (type !== "blog" && type !== "note") {
    throw new Error(`${file}: source.type must be blog or note`);
  }
  const id = asString(parsed.source?.id);
  const title = asString(parsed.source?.title);
  const href = asString(parsed.source?.href);
  if (!id || !title || !href) {
    throw new Error(`${file}: source.id, source.title, and source.href are required`);
  }

  const cardsIn = Array.isArray(parsed.cards) ? parsed.cards : [];
  const cards = cardsIn.map((card, index) => {
    const row = (card ?? {}) as {
      id?: unknown;
      question?: unknown;
      answer?: unknown;
    };
    return {
      id: asString(row.id) || `${type}:${id}:${index}`,
      question: asString(row.question),
      answer: asString(row.answer),
    };
  });

  return {
    source: {
      type,
      id,
      title,
      href,
      tags: asStringArray(parsed.source?.tags),
    },
    cards,
  };
}

export function mergeSourceFiles(files: SourceCardsFile[]): Flashcard[] {
  const seen = new Set<string>();
  const cards: Flashcard[] = [];

  for (const file of files) {
    for (const card of file.cards) {
      if (!card.question || !card.answer) continue;
      let id = card.id;
      if (seen.has(id)) {
        let suffix = 1;
        while (seen.has(`${id}:${suffix}`)) suffix += 1;
        id = `${id}:${suffix}`;
      }
      seen.add(id);
      cards.push({
        id,
        question: card.question,
        answer: card.answer,
        sourceType: file.source.type,
        sourceId: file.source.id,
        sourceTitle: file.source.title,
        sourceHref: file.source.href,
        tags: file.source.tags,
      });
    }
  }

  return cards.sort(
    (a, b) =>
      a.sourceType.localeCompare(b.sourceType) ||
      a.sourceId.localeCompare(b.sourceId) ||
      a.id.localeCompare(b.id),
  );
}

export function associateCardTags(
  cards: Flashcard[],
  sourceTags: Map<string, string[]>,
): Flashcard[] {
  return cards.map((card) => {
    const live = sourceTags.get(`${card.sourceType}:${card.sourceId}`);
    if (!live) return card;
    return { ...card, tags: live };
  });
}

function readTagCatalog(root: string): string[] {
  const tagsPath = path.join(root, "src/content/flashcards/tags.json");
  if (!fs.existsSync(tagsPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(tagsPath, "utf8")) as {
      tags?: unknown;
    };
    return asStringArray(parsed.tags);
  } catch {
    return [];
  }
}

export function buildFlashcards(
  root = ROOT,
  _options: { all?: boolean } = {},
): Flashcard[] {
  const sourcesDir = path.join(root, "src/content/flashcards/sources");
  const indexPath = path.join(root, "src/content/flashcards/index.json");
  const files = walkJsonFiles(sourcesDir).map((file) =>
    parseSourceFile(fs.readFileSync(file, "utf8"), file),
  );
  const sources = collectSources(root);
  const sourceTags = new Map(
    sources.map((source) => [`${source.type}:${source.id}`, source.tags] as const),
  );
  const cards = associateCardTags(mergeSourceFiles(files), sourceTags);
  const tags = uniqueSortedTags([
    readTagCatalog(root),
    ...sources.map((source) => source.tags),
    ...cards.map((card) => card.tags),
  ]);
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify({ cards, tags }, null, 2));
  return cards;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  const cards = buildFlashcards(ROOT, {
    all: process.argv.includes("--all"),
  });
  console.log(`Flashcards: ${cards.length} cards from ${SOURCES_DIR}`);
}
