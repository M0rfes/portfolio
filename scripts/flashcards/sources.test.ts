import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  CACHE_VERSION,
  cacheKey,
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
