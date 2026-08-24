import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  CACHE_VERSION,
  cacheKey,
  collectSources,
  diffSources,
  hashContent,
  noteIdFromPagePath,
  parseBlogMeta,
  parseNotePage,
  registeredBlogSlugs,
  sourceOutputRel,
} from "./sources";

describe("hashContent", () => {
  test("is stable for the same input", () => {
    assert.equal(hashContent("hello"), hashContent("hello"));
    assert.notEqual(hashContent("hello"), hashContent("hello!"));
  });
});

describe("registeredBlogSlugs", () => {
  test("reads registry keys from blogs/index.ts", () => {
    const indexTs = `
export const blogRegistry: Record<string, BlogEntry> = {
  "deferred-commit-pattern": {
    slug: "deferred-commit-pattern",
  },
  "streaming-json-multipart-mixed": {
    slug: "streaming-json-multipart-mixed",
  },
};
`;
    assert.deepEqual(registeredBlogSlugs(indexTs), [
      "deferred-commit-pattern",
      "streaming-json-multipart-mixed",
    ]);
  });
});

describe("parseBlogMeta", () => {
  test("reads title and keywords", () => {
    const raw = `
export const meta = {
  title: "The Deferred Commit Pattern",
  keywords: [
    "nodejs",
    "redis",
  ],
};
`;
    assert.deepEqual(parseBlogMeta(raw), {
      title: "The Deferred Commit Pattern",
      tags: ["nodejs", "redis"],
    });
  });

  test("parses flashcard boolean and string values", () => {
    assert.equal(
      parseBlogMeta(`export const meta = { title: "A", flashcard: false };`)
        .flashcard,
      false,
    );
    assert.equal(
      parseBlogMeta(`export const meta = { title: "A", flashcard: true };`)
        .flashcard,
      true,
    );
    assert.equal(
      parseBlogMeta(`export const meta = { title: "A", flashcard: "false" };`)
        .flashcard,
      false,
    );
  });
});

describe("parseNotePage", () => {
  test("reads published note metadata", () => {
    const page = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        href: "/notes/coding/concurrency/mutex/",
        title: "Mutex",
        tags: ["concurrency", "locks"],
      }),
    );
    assert.deepEqual(page, {
      id: "coding/concurrency/mutex",
      href: "/notes/coding/concurrency/mutex/",
      title: "Mutex",
      tags: ["concurrency", "locks"],
    });
  });

  test("reads flashcard property when boolean or string or aliases", () => {
    const disabled = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        title: "Mutex",
        flashcard: false,
      }),
    );
    assert.equal(disabled.flashcard, false);

    const stringDisabled = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        title: "Mutex",
        flashcard: "false",
      }),
    );
    assert.equal(stringDisabled.flashcard, false);

    const aliasDisabled = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        title: "Mutex",
        flashcards: false,
      }),
    );
    assert.equal(aliasDisabled.flashcard, false);

    const enabled = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        title: "Mutex",
        flashcard: true,
      }),
    );
    assert.equal(enabled.flashcard, true);

    const stringEnabled = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        title: "Mutex",
        flashcard: "true",
      }),
    );
    assert.equal(stringEnabled.flashcard, true);

    const omitted = parseNotePage(
      JSON.stringify({
        slug: ["coding", "concurrency", "mutex"],
        title: "Mutex",
      }),
    );
    assert.equal(omitted.flashcard, undefined);
  });
});

describe("noteIdFromPagePath", () => {
  test("strips the pages dir and .json suffix", () => {
    assert.equal(
      noteIdFromPagePath(
        "/repo/src/content/notes/pages",
        "/repo/src/content/notes/pages/coding/concurrency/mutex.json",
      ),
      "coding/concurrency/mutex",
    );
  });
});

describe("sourceOutputRel", () => {
  test("nests note slugs under sources/note", () => {
    assert.equal(
      sourceOutputRel("note", "coding/concurrency/mutex"),
      "src/content/flashcards/sources/note/coding/concurrency/mutex.json",
    );
  });

  test("writes blog slugs under sources/blog", () => {
    assert.equal(
      sourceOutputRel("blog", "deferred-commit-pattern"),
      "src/content/flashcards/sources/blog/deferred-commit-pattern.json",
    );
  });
});

describe("diffSources", () => {
  test("marks missing cache entries as changed and stale cache keys as removed", () => {
    const current = [
      { type: "note" as const, id: "mutex", hash: "aaa" },
      { type: "blog" as const, id: "rollup", hash: "bbb" },
    ];
    const diff = diffSources(current, {
      version: CACHE_VERSION,
      sources: {
        "note:mutex": { hash: "aaa" },
        "note:gone": { hash: "old" },
      },
    });
    assert.deepEqual(
      diff.changed.map((item) => cacheKey(item)),
      ["blog:rollup"],
    );
    assert.deepEqual(
      diff.removed.map((item) => cacheKey(item)),
      ["note:gone"],
    );
    assert.deepEqual(
      diff.unchanged.map((item) => cacheKey(item)),
      ["note:mutex"],
    );
  });

  test("marks all sources as changed when all option is true", () => {
    const current = [
      { type: "note" as const, id: "mutex", hash: "aaa" },
      { type: "blog" as const, id: "rollup", hash: "bbb" },
    ];
    const diff = diffSources(
      current,
      {
        version: CACHE_VERSION,
        sources: {
          "note:mutex": { hash: "aaa" },
          "blog:rollup": { hash: "bbb" },
          "note:gone": { hash: "old" },
        },
      },
      { all: true },
    );
    assert.deepEqual(
      diff.changed.map((item) => cacheKey(item)),
      ["note:mutex", "blog:rollup"],
    );
    assert.deepEqual(diff.unchanged, []);
    assert.deepEqual(
      diff.removed.map((item) => cacheKey(item)),
      ["note:gone"],
    );
  });
});

describe("collectSources", () => {
  test("ignores notes with flashcard: false, and includes notes with flashcard: true or without flashcard property", () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "collect-sources-test-"),
    );
    try {
      const notesDir = path.join(tempDir, "src/content/notes/pages/topic");
      fs.mkdirSync(notesDir, { recursive: true });

      // Note 1: flashcard: false (boolean) -> should be ignored
      fs.writeFileSync(
        path.join(notesDir, "note1.json"),
        JSON.stringify({
          slug: ["topic", "note1"],
          title: "Note 1",
          flashcard: false,
        }),
      );

      // Note 2: flashcard: "false" (string) -> should be ignored
      fs.writeFileSync(
        path.join(notesDir, "note2.json"),
        JSON.stringify({
          slug: ["topic", "note2"],
          title: "Note 2",
          flashcard: "false",
        }),
      );

      // Note 3: flashcards: false (alias) -> should be ignored
      fs.writeFileSync(
        path.join(notesDir, "note3.json"),
        JSON.stringify({
          slug: ["topic", "note3"],
          title: "Note 3",
          flashcards: false,
        }),
      );

      // Note 4: flashcard: true -> should be included
      fs.writeFileSync(
        path.join(notesDir, "note4.json"),
        JSON.stringify({
          slug: ["topic", "note4"],
          title: "Note 4",
          flashcard: true,
        }),
      );

      // Note 5: no flashcard property -> should be included
      fs.writeFileSync(
        path.join(notesDir, "note5.json"),
        JSON.stringify({
          slug: ["topic", "note5"],
          title: "Note 5",
        }),
      );

      const sources = collectSources(tempDir);
      const noteIds = sources.filter((s) => s.type === "note").map((s) => s.id);

      assert.deepEqual(noteIds, ["topic/note4", "topic/note5"]);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
