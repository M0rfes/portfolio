---
name: ingest-flashcards
description: >-
  Generates Q&A flashcards from new or updated blog MDX and published note JSON.
  Use when running flashcards:ingest, ingesting flashcards, or writing
  src/content/flashcards/sources JSON.
---

# Ingest Flashcards

Read `src/content/flashcards/changed.json`. For each entry in `changed`, read that source file and write one flashcard JSON file at its corresponding `outFile`. Do not process sources that are not listed. Do not invent facts that are not in the source.

---

## Output Schema

Each source generates a JSON file at `outFile` (e.g. `src/content/flashcards/sources/note/teach/c17/lessons/0002-binary-file-io-and-rom-loading.json` or `src/content/flashcards/sources/blog/deferred-commit-pattern.json`):

```json
{
  "source": {
    "type": "note",
    "id": "teach/c17/lessons/0002-binary-file-io-and-rom-loading",
    "title": "Lesson 0002: Safe Binary File I/O & ROM Loading into Memory at 0x200",
    "href": "/notes/teach/c17/lessons/0002-binary-file-io-and-rom-loading/",
    "tags": ["teach/c17", "lesson", "file-io", "memory", "chip-8"]
  },
  "cards": [
    {
      "id": "note:teach/c17/lessons/0002-binary-file-io-and-rom-loading:0",
      "question": "Why must binary files be opened with mode \"rb\" instead of \"r\" in C?",
      "answer": "Opening in text mode (\"r\") can perform platform-specific newline translations, silently corrupting raw binary executable bytecode."
    }
  ]
}
```

- **Source Metadata**: Copy `type`, `id`, `title`, `href`, and `tags` directly from the `changed` entry.
- **Card IDs**: Format each card id as `{type}:{id}:{index}` starting at index `0`.
- **Target File**: Overwrite the existing `outFile` for that source. Do not edit other source files. Do not write `index.json` (`flashcards:build` handles aggregation).

## Core Mission: Retention Bridge Between Lessons & Grills

Flashcards serve as the **retention engine** bridging active hands-on building ([`teach`](file:///Users/morfes/projects/portfolio/vault/.agents/skills/teach/SKILL.md) lessons) and adversarial stress-testing ([`grill-me`](file:///Users/morfes/projects/portfolio/vault/.agents/skills/grill-me/SKILL.md) interviews).

The primary goal of every ingested card is to **dramatically increase retention on the learner's knowledge frontier**:
- **Target Unknowns & Misconceptions**: Focus squarely on facts, invariants, failure modes, and distinctions that learners struggle with, easily conflate, or miss during grilling sessions.
- **Zero Trivia**: Never generate cards for superficial syntax, trivial definitions, or boilerplate code that can be derived on the fly.
- **Durable Storage Strength**: Construct questions that force active retrieval of *causal mechanisms* and *system guarantees* so they become second nature in subsequent challenge lessons and grill evaluations.

---

## Card Philosophy & Quality Standards

Target **storage strength** over mere **fluency strength**.

1. **Atomicity**: Exactly one concept, mechanism, or distinction per card.
2. **Sharp Questions**: Concise, direct question prompting active recall of the underlying concept.
3. **Clear Answers**: 1–3 clear sentences explaining the underlying reason, mechanism, or invariant.
4. **Mechanisms & Invariants over Trivia**: Test why an invariant holds, what triggers undefined behavior, memory layout rules, or how a protocol operates—not arbitrary line numbers or code formatting trivia.
5. **Target the Friction Points**: Prioritize cards for corrected misconceptions, compiler constraint violations, subtle edge cases, and architectural trade-offs.
6. **Volume**: 3–8 high-leverage cards per substantive source.

---

## Source-Specific Ingestion Rules

Vault notes and blog posts follow distinct structural patterns. Tailor card extraction according to the source type and note category:

### 1. Teach Notes (`Teach/<Topic>/...` / `teach/...`)

Teach workspaces are structured around deliberate practice and coding challenges:

- **Glossary (`GLOSSARY.md` / `teach/.../glossary`)**:
  - Extract definitions, term vs. term distinctions, and canonical boundaries.
  - _Example_: Difference between storage classes, or definition of an interior mutability wrapper.
- **Lessons (`Lessons/NNNN-<slug>.md` / `teach/.../lessons/...`)**:
  - Lessons follow a **Zero-Code Policy** (challenges & test specifications, no solution code).
  - Extract cards testing core invariants, memory layouts, hardware/protocol constraints, reasons behind test requirements, and why specific library modes/flags are used (e.g. why `rb` vs `r` in `fopen`, why seek/rewind is required before `fread`, memory base offsets like `0x200`).
  - Do _not_ test implementation boilerplate that the learner is meant to construct.
- **Reference Sheets (`Reference/*.md` / `teach/.../reference/...`)**:
  - Extract cheat-sheet rules, syntax semantics, algorithmic workflows, return codes, and error conditions.
- **Learning Records (`Learning Records/NNNN-<slug>.md` / `teach/.../learning-records/...`)**:
  - Extract cards testing **corrected misconceptions**, subtle bugs, edge case traps, and hard-won architectural insights recorded during practice.
- **Mission (`MISSION.md`) / Notes (`NOTES.md`) / Topic MOC (`<Topic>.md`)**:
  - Skip or write empty cards (`"cards": []`) unless the note contains standalone testable technical domain models.

### 2. Grill-Me Notes (`Grill/<Topic>.md` / `grill/...`)

Grill notes capture relentless stress-testing interviews exploring design trees:

- **Round Evaluations (`📊`)**:
  - Extract cards from the evaluation points and depth assessments following user answers.
  - Focus on compiler constraint violations (e.g. taking the address of `register` variables), pointer arithmetic nuances (`arr + 1` vs `&arr + 1`), struct tail padding, memory segment rules (`.rodata`), and branch prediction impacts.
- **Settled Decisions & Rationale**:
  - Extract cards on architectural trade-offs: why choice A was chosen over choice B, performance characteristics, and concurrency/failure guarantees.
- **Knowledge Gaps & Traps**:
  - Formulate cards specifically addressing subtle misconceptions and edge cases uncovered during the grilling session.

### 3. Zettelkasten Concept & Implementation Notes

- **Concept Notes (Layer 1 - `Coding/`, `Architecture/`, `LLMs/`)**:
  - Test fundamental language-agnostic concepts, theoretical models, distributed systems trade-offs (e.g. CAP, Memory Ordering, RAG, Speculative Decoding).
- **Implementation Notes (Layer 2 - `Books/rust/...`, `Books/C/...`)**:
  - Test language-specific mechanics, safety traits (`Send`/`Sync`), memory management, lock poisoning, and API contracts.

### 4. Blog Posts (`src/content/blogs/*.mdx`)

- Test real-world architectural patterns (e.g. Deferred Commit, Streaming JSON Multipart), problem-solution trade-offs, and resilience mechanisms.

---

## Skip & Empty Handling

- **Sources not in `changed.json`**: Do not read or modify.
- **Notes with `flashcard: false`**: These are excluded automatically by `collectSources`.
- **Empty / Stub / Pure MOC Notes**: If a note has no teachable factual or conceptual content, write:
  ```json
  {
    "source": {
      "type": "note",
      "id": "<id>",
      "title": "<title>",
      "href": "<href>",
      "tags": ["..."]
    },
    "cards": []
  }
  ```
