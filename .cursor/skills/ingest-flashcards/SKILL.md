---
name: ingest-flashcards
description: >-
  Generates Q&A flashcards from new or updated blog MDX and published note JSON.
  Use when running flashcards:ingest, ingesting flashcards, or writing
  src/content/flashcards/sources JSON.
---

# Ingest flashcards

Read `src/content/flashcards/changed.json`. For each entry in `changed`, read that source file and write one flashcard JSON file at `outFile`. Do not process sources that are not listed. Do not invent facts that are not in the source.

## Output schema

```json
{
  "source": {
    "type": "note",
    "id": "coding/concurrency/mutex",
    "title": "Mutex",
    "href": "/notes/coding/concurrency/mutex/",
    "tags": ["concurrency", "locks"]
  },
  "cards": [
    {
      "id": "note:coding/concurrency/mutex:0",
      "question": "What does a mutex guarantee?",
      "answer": "Only one thread can hold the lock at a time."
    }
  ]
}
```

Copy `type`, `id`, `title`, `href`, and `tags` from the changed entry. Card ids are `{type}:{id}:{index}` starting at `0`.

Overwrite the existing `outFile` for that source. Do not edit other source files. Do not write `index.json` — `flashcards:build` does that.

## Card style

- 3–8 cards per source.
- Short question. Answer is 1–3 sentences.
- Test a definition, distinction, or mechanism from the source.
- Skip boilerplate, frontmatter-only text, and trivia.

## Skip

- Sources not in `changed.json`.
- Empty or stub notes with no teachable content (write `{"source":{...},"cards":[]}` only if the changed entry exists and the body has nothing to test).
