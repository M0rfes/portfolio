import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cacheKey,
  collectSources,
  diffSources,
  readCache,
  sourceOutputRel,
  toChangedEntry,
  writeChangedManifest,
  type CacheFile,
  type FlashcardSource,
} from "./sources";

const ROOT = process.cwd();
const FLASHCARDS_DIR = path.join(ROOT, "src/content/flashcards");
const CACHE_PATH = path.join(FLASHCARDS_DIR, ".cache.json");
const CHANGED_PATH = path.join(FLASHCARDS_DIR, "changed.json");

const INGEST_PROMPT = [
  "Follow the ingest-flashcards skill.",
  "Read src/content/flashcards/changed.json.",
  "Write one flashcard JSON file at each changed outFile.",
].join(" ");

function resolveAgentBin(): string {
  for (const name of ["cursor-agent", "agent"]) {
    const result = spawnSync("sh", ["-c", `command -v ${name}`], {
      encoding: "utf8",
    });
    if (result.status === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
  }
  throw new Error("cursor-agent (or agent) not found on PATH");
}

function removeOutFile(
  root: string,
  type: FlashcardSource["type"],
  id: string,
): string {
  const rel = sourceOutputRel(type, id);
  const full = path.join(root, rel);
  if (fs.existsSync(full)) fs.unlinkSync(full);
  return rel;
}

function writeCache(cache: CacheFile): void {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function markIngested(cache: CacheFile, sources: FlashcardSource[]): void {
  const ingestedAt = new Date().toISOString();
  for (const source of sources) {
    const outFile = path.join(ROOT, sourceOutputRel(source.type, source.id));
    if (!fs.existsSync(outFile)) continue;
    cache.sources[cacheKey(source)] = { hash: source.hash, ingestedAt };
  }
}

export function prepareIngest(
  root = ROOT,
  options: { all?: boolean } = {},
): {
  changed: FlashcardSource[];
  removed: { type: FlashcardSource["type"]; id: string; outFile: string }[];
  cache: CacheFile;
} {
  const sources = collectSources(root);
  const cache = readCache(path.join(root, "src/content/flashcards/.cache.json"));
  const diff = diffSources(sources, cache, { all: options.all });

  const byKey = new Map(sources.map((source) => [cacheKey(source), source]));
  const changed = diff.changed
    .map((ref) => byKey.get(cacheKey(ref)))
    .filter((source): source is FlashcardSource => Boolean(source));

  const removed = diff.removed.map((item) => ({
    ...item,
    outFile: removeOutFile(root, item.type, item.id),
  }));

  for (const item of diff.removed) {
    delete cache.sources[cacheKey(item)];
  }

  return { changed, removed, cache };
}

export function ingestFlashcards(
  options: { skipAgent?: boolean; all?: boolean } = {},
): void {
  const { changed, removed, cache } = prepareIngest(ROOT, { all: options.all });

  if (changed.length === 0) {
    writeCache(cache);
    if (fs.existsSync(CHANGED_PATH)) fs.unlinkSync(CHANGED_PATH);
    console.log("Flashcards: no source changes");
    return;
  }

  writeChangedManifest(
    CHANGED_PATH,
    changed.map((source) => toChangedEntry(source)),
    removed,
  );
  writeCache(cache);

  console.log(
    `Flashcards: ${changed.length} source(s) to ingest, ${removed.length} removed`,
  );

  if (options.skipAgent) return;

  const bin = resolveAgentBin();
  const result = spawnSync(bin, ["--force", "-p", INGEST_PROMPT], {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    return;
  }

  const next = readCache(CACHE_PATH);
  markIngested(next, changed);
  writeCache(next);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  ingestFlashcards({
    skipAgent: process.argv.includes("--skip-agent"),
    all: process.argv.includes("--all"),
  });
}
