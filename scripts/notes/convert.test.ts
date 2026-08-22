import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildIndex,
  convertNote,
  notesNeedingRebuild,
  parseNote,
  relativeHref,
  slugSegments,
  stripTitleFormatting,
} from "./convert";

describe("stripTitleFormatting", () => {
  test("strips markdown emphasis, highlights, wikilinks, and heading markers", () => {
    assert.equal(stripTitleFormatting("**RAG**"), "RAG");
    assert.equal(stripTitleFormatting("# Retrieval"), "Retrieval");
    assert.equal(stripTitleFormatting("==KV Cache=="), "KV Cache");
    assert.equal(stripTitleFormatting("[[LLM|LLMs]]"), "LLMs");
    assert.equal(stripTitleFormatting("`Mutex` notes"), "Mutex notes");
    assert.equal(stripTitleFormatting("~~old~~ title"), "old title");
    assert.equal(stripTitleFormatting("*italic* _word_"), "italic word");
  });
});

describe("slugSegments", () => {
  test("lowercases and hyphenates the vault path without extension", () => {
    assert.deepEqual(slugSegments("LLMs/RAG.md"), ["llms", "rag"]);
    assert.deepEqual(slugSegments("Coding/Concurrency/Threads.md"), [
      "coding",
      "concurrency",
      "threads",
    ]);
    assert.deepEqual(slugSegments("Books/rust/Rust Atomics and Locks/Rust Threads.md"), [
      "books",
      "rust",
      "rust-atomics-and-locks",
      "rust-threads",
    ]);
  });
});

describe("relativeHref", () => {
  test("builds a trailing-slash relative path between note slugs", () => {
    assert.equal(
      relativeHref(["llms", "rag"], ["llms", "agentic-rag"]),
      "../agentic-rag/",
    );
    assert.equal(
      relativeHref(["llms", "rag"], ["agents", "agents"]),
      "../../agents/agents/",
    );
    assert.equal(
      relativeHref(["llms", "rag"], ["llms", "rag"], "Modalities of RAG"),
      "#modalities-of-rag",
    );
    assert.equal(
      relativeHref(["llms", "rag"], ["llms", "llm"], "Decoder"),
      "../llm/#decoder",
    );
  });
});

describe("parseNote", () => {
  test("reads frontmatter and prefers updated over created", () => {
    const note = parseNote(
      "LLMs/RAG.md",
      `---
title: "**Retrieval-Augmented Generation (RAG)**"
tags:
  - rag
created: 2026-03-29
updated: 2026-03-30
summary: Overview of RAG
---

# Retrieval-Augmented Generation (RAG)

Body
`,
      "2026-01-01",
    );

    assert.equal(note.title, "Retrieval-Augmented Generation (RAG)");
    assert.equal(note.updatedAt, "2026-03-30");
    assert.equal(note.summary, "Overview of RAG");
    assert.deepEqual(note.tags, ["rag"]);
    assert.equal(note.body.startsWith("# Retrieval-Augmented Generation"), true);
  });

  test("falls back to created then file mtime when updated is missing", () => {
    const withCreated = parseNote(
      "Agents/Agents.md",
      `---
title: Agents
created: 2026-04-01
---

Hello
`,
      "2026-08-01",
    );
    assert.equal(withCreated.updatedAt, "2026-04-01");

    const withMtime = parseNote("x.md", "no frontmatter", "2026-08-22");
    assert.equal(withMtime.updatedAt, "2026-08-22");
    assert.equal(withMtime.title, "x");
  });
});

function indexFrom(files: Record<string, string>) {
  return buildIndex(
    Object.entries(files).map(([vaultPath, raw]) => ({
      vaultPath,
      raw,
      mtimeIso: "2026-01-01",
    })),
  );
}

describe("convertNote", () => {
  test("turns wikilinks into relative markdown links and uses aliases", () => {
    const index = indexFrom({
      "LLMs/RAG.md": `---
title: RAG
updated: 2026-03-30
---

See [[Agentic RAG]] and [[LLM|LLMs]].
`,
      "LLMs/Agentic RAG.md": `---
title: Agentic RAG
updated: 2026-03-30
---

Agent
`,
      "LLMs/LLM.md": `---
title: LLM
updated: 2026-03-30
---

Model
`,
    });

    const converted = convertNote(index.byPath.get("LLMs/RAG.md")!, index);
    assert.match(converted.markdown, /\[Agentic RAG\]\(\.\.\/agentic-rag\/\)/);
    assert.match(converted.markdown, /\[LLMs\]\(\.\.\/llm\/\)/);
  });

  test("leaves unresolved wikilinks as plain text", () => {
    const index = indexFrom({
      "LLMs/RAG.md": `---
title: RAG
updated: 2026-03-30
---

Uses [[Vector Database]].
`,
    });

    const converted = convertNote(index.byPath.get("LLMs/RAG.md")!, index);
    assert.equal(converted.markdown.includes("[[Vector Database]]"), false);
    assert.match(converted.markdown, /Uses Vector Database\./);
    assert.deepEqual(converted.links, []);
  });

  test("does not rewrite wikilinks inside fenced or inline code", () => {
    const index = indexFrom({
      "LLMs/RAG.md": `---
title: RAG
updated: 2026-03-30
---

\`[[LLM]]\`

\`\`\`
[[LLM]]
\`\`\`
`,
      "LLMs/LLM.md": `---
title: LLM
updated: 2026-03-30
---

x
`,
    });

    const converted = convertNote(index.byPath.get("LLMs/RAG.md")!, index);
    assert.match(converted.markdown, /`\[\[LLM\]\]`/);
    assert.match(converted.markdown, /```\n\[\[LLM\]\]\n```/);
  });

  test("inlines nested note embeds into a single page and strips the embedded H1", () => {
    const index = indexFrom({
      "Books/Basics.md": `---
title: Basics
updated: 2026-08-15
---

# Basics

## Threads
![[Rust Threads]]
`,
      "Books/Rust Threads.md": `---
title: Rust Threads
updated: 2026-08-18
---

# Threads in Rust

![[Threads]]

Rust can spawn threads.
`,
      "Coding/Threads.md": `---
title: Threads
updated: 2026-08-18
---

# Threads

Every program starts with one OS thread.
`,
    });

    const converted = convertNote(index.byPath.get("Books/Basics.md")!, index);
    assert.equal(converted.markdown.includes("![[Rust Threads]]"), false);
    assert.equal(converted.markdown.includes("![[Threads]]"), false);
    assert.match(converted.markdown, /Every program starts with one OS thread/);
    assert.match(converted.markdown, /Rust can spawn threads/);
    assert.equal(converted.markdown.includes("# Threads in Rust"), false);
  });

  test("breaks embed cycles", () => {
    const index = indexFrom({
      "A.md": `---
title: A
updated: 2026-01-01
---

![[B]]
`,
      "B.md": `---
title: B
updated: 2026-01-01
---

![[A]]
`,
    });

    const converted = convertNote(index.byPath.get("A.md")!, index);
    assert.equal(converted.markdown.includes("![[A]]"), false);
    assert.equal(converted.markdown.includes("![[B]]"), false);
  });

  test("inlines a heading section embed", () => {
    const index = indexFrom({
      "Host.md": `---
title: Host
updated: 2026-01-01
---

![[Source#Joining Threads]]
`,
      "Source.md": `---
title: Source
updated: 2026-01-01
---

# Source

Intro

## Joining Threads

Join the handle.

## Closures

Move semantics.
`,
    });

    const converted = convertNote(index.byPath.get("Host.md")!, index);
    assert.match(converted.markdown, /Join the handle/);
    assert.equal(converted.markdown.includes("Move semantics"), false);
    assert.equal(converted.markdown.includes("Intro"), false);
  });

  test("turns image embeds into relative markdown images", () => {
    const index = indexFrom({
      "Architecture/Coupling.md": `---
title: Coupling
updated: 2026-04-15
---

![[Pasted image 20260414192702.png]]
`,
    });

    const converted = convertNote(index.byPath.get("Architecture/Coupling.md")!, index);
    assert.match(
      converted.markdown,
      /!\[Pasted image 20260414192702\]\(\.\/pasted-image-20260414192702\.png\)/,
    );
  });

  test("converts wikilinks inside inlined embeds relative to the host page", () => {
    const index = indexFrom({
      "Books/Rust Threads.md": `---
title: Rust Threads
updated: 2026-08-18
---

See [[Threads|threads]].
`,
      "Coding/Concurrency/Threads.md": `---
title: Threads
updated: 2026-08-18
---

OS threads
`,
      "Books/Basics.md": `---
title: Basics
updated: 2026-08-15
---

![[Rust Threads]]
`,
    });

    const converted = convertNote(index.byPath.get("Books/Basics.md")!, index);
    assert.match(
      converted.markdown,
      /\[threads\]\(\.\.\/\.\.\/coding\/concurrency\/threads\/\)/,
    );
  });
});

describe("notesNeedingRebuild", () => {
  test("rebuilds new notes, notes whose updated at changed, and notes that embed them", () => {
    const index = indexFrom({
      "Host.md": `---
title: Host
updated: 2026-01-01
---

![[Child]]
`,
      "Child.md": `---
title: Child
updated: 2026-02-01
---

Child body
`,
      "Other.md": `---
title: Other
updated: 2026-01-01
---

No embeds
`,
    });

    const rebuild = notesNeedingRebuild(index, {
      "Host.md": { updatedAt: "2026-01-01" },
      "Child.md": { updatedAt: "2026-01-01" },
      "Other.md": { updatedAt: "2026-01-01" },
    });

    assert.equal(rebuild.has("Child.md"), true);
    assert.equal(rebuild.has("Host.md"), true);
    assert.equal(rebuild.has("Other.md"), false);
  });

  test("rebuilds notes missing from the cache", () => {
    const index = indexFrom({
      "New.md": `---
title: New
updated: 2026-03-01
---

Hello
`,
    });

    const rebuild = notesNeedingRebuild(index, {});
    assert.equal(rebuild.has("New.md"), true);
  });
});
