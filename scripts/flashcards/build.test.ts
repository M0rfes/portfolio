import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { associateCardTags, mergeSourceFiles, parseSourceFile } from "./build";

describe("parseSourceFile", () => {
  test("accepts a valid source file", () => {
    const parsed = parseSourceFile(
      JSON.stringify({
        source: {
          type: "note",
          id: "coding/concurrency/mutex",
          title: "Mutex",
          href: "/notes/coding/concurrency/mutex/",
          tags: ["concurrency"],
        },
        cards: [
          {
            id: "note:coding/concurrency/mutex:0",
            question: "What does a mutex guarantee?",
            answer: "Only one thread can hold the lock at a time.",
          },
        ],
      }),
      "mutex.json",
    );
    assert.equal(parsed.source.id, "coding/concurrency/mutex");
    assert.equal(parsed.cards.length, 1);
  });

  test("fills missing card ids", () => {
    const parsed = parseSourceFile(
      JSON.stringify({
        source: {
          type: "blog",
          id: "deferred-commit-pattern",
          title: "Deferred Commit",
          href: "/blogs/deferred-commit-pattern",
          tags: [],
        },
        cards: [{ question: "Q", answer: "A" }],
      }),
      "blog.json",
    );
    assert.equal(parsed.cards[0].id, "blog:deferred-commit-pattern:0");
  });
});

describe("mergeSourceFiles", () => {
  test("flattens cards and drops empty questions", () => {
    const cards = mergeSourceFiles([
      parseSourceFile(
        JSON.stringify({
          source: {
            type: "note",
            id: "mutex",
            title: "Mutex",
            href: "/notes/mutex/",
            tags: ["locks"],
          },
          cards: [
            { question: "Q1", answer: "A1" },
            { question: "  ", answer: "A2" },
          ],
        }),
        "mutex.json",
      ),
    ]);
    assert.equal(cards.length, 1);
    assert.equal(cards[0].sourceType, "note");
    assert.equal(cards[0].sourceTitle, "Mutex");
    assert.deepEqual(cards[0].tags, ["locks"]);
  });
});

describe("associateCardTags", () => {
  test("replaces card tags from the live source map", () => {
    const cards = associateCardTags(
      [
        {
          id: "note:mutex:0",
          question: "Q",
          answer: "A",
          sourceType: "note",
          sourceId: "mutex",
          sourceTitle: "Mutex",
          sourceHref: "/notes/mutex/",
          tags: ["stale"],
        },
      ],
      new Map([["note:mutex", ["concurrency", "locks"]]]),
    );
    assert.deepEqual(cards[0].tags, ["concurrency", "locks"]);
  });

  test("keeps existing tags when the source is missing", () => {
    const cards = associateCardTags(
      [
        {
          id: "note:mutex:0",
          question: "Q",
          answer: "A",
          sourceType: "note",
          sourceId: "mutex",
          sourceTitle: "Mutex",
          sourceHref: "/notes/mutex/",
          tags: ["locks"],
        },
      ],
      new Map(),
    );
    assert.deepEqual(cards[0].tags, ["locks"]);
  });
});
