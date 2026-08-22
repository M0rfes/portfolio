"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Layers, RotateCcw } from "lucide-react";
import { TagPicker } from "@/components/TagPicker";
import type { Flashcard, FlashcardSourceType } from "@/lib/flashcards";

const STORAGE_KEY = "flashcards-deck";
const SWIPE_THRESHOLD_PX = 50;

type SourceFilter = "all" | FlashcardSourceType;

type StoredDeck = {
  sourceType: SourceFilter;
  tags?: string[];
  tag?: string | null;
  dismissed?: string[];
  order?: string[];
};

type FlashcardDeckProps = {
  cards: Flashcard[];
  tags: string[];
};

function readStoredDeck(): StoredDeck | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDeck;
  } catch {
    return null;
  }
}

function writeStoredDeck(deck: StoredDeck): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
  } catch {
    return;
  }
}

function rotateToEnd(ids: string[], id: string): string[] {
  const next = ids.filter((item) => item !== id);
  next.push(id);
  return next;
}

function deckProgress(total: number, remaining: number, index: number) {
  if (total === 0 || remaining === 0) return { current: 0, total };
  const completed = total - remaining;
  return {
    current: Math.min(completed + index + 1, total),
    total,
  };
}

export function FlashcardDeck({ cards, tags }: FlashcardDeckProps) {
  const [sourceType, setSourceType] = useState<SourceFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const filterKey = `${sourceType}:${[...selectedTags].sort().join("\0")}`;
  const [activeFilterKey, setActiveFilterKey] = useState(filterKey);

  const scoped = useMemo(() => {
    if (sourceType === "all") return cards;
    return cards.filter((card) => card.sourceType === sourceType);
  }, [cards, sourceType]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const card of scoped) {
      for (const item of card.tags) {
        counts[item] = (counts[item] ?? 0) + 1;
      }
    }
    return counts;
  }, [scoped]);

  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return scoped;
    return scoped.filter((card) =>
      selectedTags.some((item) => card.tags.includes(item)),
    );
  }, [scoped, selectedTags]);

  const dismissedSet = useMemo(() => new Set(dismissed), [dismissed]);

  const queue = useMemo(() => {
    const remaining = filtered.filter((card) => !dismissedSet.has(card.id));
    if (order.length === 0) return remaining;
    const byId = new Map(remaining.map((card) => [card.id, card]));
    const ordered = order
      .map((id) => byId.get(id))
      .filter((card): card is Flashcard => Boolean(card));
    const seen = new Set(ordered.map((card) => card.id));
    return [...ordered, ...remaining.filter((card) => !seen.has(card.id))];
  }, [filtered, dismissedSet, order]);

  const card = queue[index] ?? null;
  const progress = deckProgress(filtered.length, queue.length, index);

  useEffect(() => {
    const stored = readStoredDeck();
    if (stored) {
      const nextTags = stored.tags ?? (stored.tag ? [stored.tag] : []);
      const nextSource = stored.sourceType ?? "all";
      setSourceType(nextSource);
      setSelectedTags(nextTags);
      setDismissed(stored.dismissed ?? []);
      setOrder(stored.order ?? []);
      setActiveFilterKey(`${nextSource}:${[...nextTags].sort().join("\0")}`);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (filterKey === activeFilterKey) return;
    setActiveFilterKey(filterKey);
    setDismissed([]);
    setOrder(filtered.map((item) => item.id));
    setIndex(0);
    setFlipped(false);
  }, [activeFilterKey, filterKey, filtered, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredDeck({
      sourceType,
      tags: selectedTags,
      dismissed,
      order,
    });
  }, [sourceType, selectedTags, dismissed, order, hydrated]);

  const goTo = useCallback((nextIndex: number) => {
    if (queue.length === 0) return;
    const wrapped = (nextIndex + queue.length) % queue.length;
    setIndex(wrapped);
    setFlipped(false);
  }, [queue.length]);

  const onAgain = () => {
    if (!card || queue.length < 2) {
      setFlipped(false);
      return;
    }
    setOrder(rotateToEnd(queue.map((item) => item.id), card.id));
    setIndex(0);
    setFlipped(false);
  };

  const onKnewIt = () => {
    if (!card) return;
    setDismissed((current) =>
      current.includes(card.id) ? current : [...current, card.id],
    );
    setOrder((current) => current.filter((id) => id !== card.id));
    setFlipped(false);
    if (index >= queue.length - 1) {
      setIndex(Math.max(0, queue.length - 2));
    }
  };

  const resetDeck = () => {
    setDismissed([]);
    setOrder(filtered.map((item) => item.id));
    setIndex(0);
    setFlipped(false);
  };

  const onTouchStart = (clientX: number) => setTouchStartX(clientX);

  const onTouchEnd = (clientX: number) => {
    if (touchStartX == null) return;
    const delta = clientX - touchStartX;
    setTouchStartX(null);
    if (delta <= -SWIPE_THRESHOLD_PX) goTo(index + 1);
    if (delta >= SWIPE_THRESHOLD_PX) goTo(index - 1);
  };

  if (cards.length === 0) {
    return (
      <p className="text-center text-muted-foreground px-2">
        No cards yet. Run <code className="text-foreground">npm run flashcards:ingest</code> then{" "}
        <code className="text-foreground">npm run flashcards:build</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(["all", "note", "blog"] as SourceFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSourceType(value)}
            className={`shrink-0 min-h-11 px-4 rounded-full border text-sm capitalize ${
              sourceType === value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground bg-card"
            }`}
          >
            {value === "all" ? "All" : value === "note" ? "Notes" : "Blogs"}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <TagPicker
          tags={tags}
          selected={selectedTags}
          counts={tagCounts}
          onChange={setSelectedTags}
        />
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {progress.total === 0 ? "0 / 0" : `${progress.current} / ${progress.total}`}
        </span>
        <button
          type="button"
          onClick={resetDeck}
          className="inline-flex items-center gap-1 min-h-11 px-2 text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {card ? (
        <>
        <div
          className="flashcard-scene h-[min(28rem,58dvh)]"
          onTouchStart={(event) => onTouchStart(event.touches[0].clientX)}
          onTouchEnd={(event) => onTouchEnd(event.changedTouches[0].clientX)}
        >
          <button
            type="button"
            aria-pressed={flipped}
            onClick={() => setFlipped((value) => !value)}
            className={`flashcard-rig rounded-2xl ${flipped ? "is-flipped" : ""}`}
          >
            <div className="flashcard-face flex flex-col justify-between rounded-2xl border border-border bg-card p-6 text-left shadow-lg">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Question</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug my-auto py-6">
                {card.question}
              </p>
              <p className="text-sm text-muted-foreground">{card.sourceTitle}</p>
            </div>
            <div className="flashcard-face flashcard-face-back flex flex-col justify-between rounded-2xl border border-border bg-card p-6 text-left shadow-lg">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Answer</p>
              <p className="text-base sm:text-lg text-foreground leading-relaxed my-auto py-6">
                {card.answer}
              </p>
              <p className="text-sm text-muted-foreground">{card.sourceTitle}</p>
            </div>
          </button>
        </div>
        <Link
          href={card.sourceHref}
          className="text-sm text-primary underline underline-offset-4 px-1"
        >
          {card.sourceTitle}
        </Link>
        </>
      ) : (
        <div className="h-[min(28rem,58dvh)] rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-4 px-6 text-center">
          <Layers className="w-10 h-10 text-primary" />
          <p className="text-lg text-foreground">Deck complete</p>
          <button
            type="button"
            onClick={resetDeck}
            className="min-h-14 px-6 rounded-full bg-primary text-primary-foreground"
          >
            Study again
          </button>
        </div>
      )}

      {card && (
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button
            type="button"
            onClick={onAgain}
            className="min-h-14 rounded-2xl border border-border bg-card text-foreground text-base font-medium"
          >
            Again
          </button>
          <button
            type="button"
            onClick={onKnewIt}
            className="min-h-14 rounded-2xl bg-primary text-primary-foreground text-base font-medium"
          >
            Knew it
          </button>
        </div>
      )}
    </div>
  );
}
