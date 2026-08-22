import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const CACHE_VERSION = 1;

export type SourceType = "blog" | "note";

export type SourceRef = {
  type: SourceType;
  id: string;
  hash: string;
};

export type FlashcardSource = SourceRef & {
  path: string;
  title: string;
  href: string;
  tags: string[];
};

export type CacheFile = {
  version: number;
  sources: Record<string, { hash: string; ingestedAt?: string }>;
};

export type ChangedEntry = {
  type: SourceType;
  id: string;
  path: string;
  title: string;
  href: string;
  tags: string[];
  outFile: string;
};

export type ChangedManifest = {
  generatedAt: string;
  changed: ChangedEntry[];
  removed: { type: SourceType; id: string; outFile: string }[];
};

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function cacheKey(source: { type: SourceType; id: string }): string {
  return `${source.type}:${source.id}`;
}

export function sourceOutputRel(type: SourceType, id: string): string {
  return path.posix.join("src/content/flashcards/sources", type, `${id}.json`);
}

export function registeredBlogSlugs(indexTs: string): string[] {
  return [...indexTs.matchAll(/^\s+"([^"]+)":\s*\{/gm)].map((match) => match[1]);
}

export function parseBlogMeta(raw: string): { title: string; tags: string[] } {
  const title = raw.match(/title:\s*["']([^"']+)["']/)?.[1] ?? "";
  const keywordsBlock = raw.match(/keywords:\s*\[([\s\S]*?)\]/);
  const tags = keywordsBlock
    ? [...keywordsBlock[1].matchAll(/["']([^"']+)["']/g)].map((match) => match[1])
    : [];
  return { title, tags };
}

export function parseNotePage(raw: string): {
  id: string;
  href: string;
  title: string;
  tags: string[];
} {
  const page = JSON.parse(raw) as {
    slug?: string[];
    href?: string;
    title?: string;
    tags?: string[];
  };
  const id = (page.slug ?? []).join("/");
  return {
    id,
    href: page.href ?? (id ? `/notes/${id}/` : ""),
    title: page.title ?? "",
    tags: page.tags ?? [],
  };
}

export function noteIdFromPagePath(pagesDir: string, file: string): string {
  const rel = path.relative(pagesDir, file).split(path.sep).join("/");
  return rel.replace(/\.json$/i, "");
}

export function diffSources(
  current: SourceRef[],
  cache: CacheFile,
): {
  changed: SourceRef[];
  unchanged: SourceRef[];
  removed: { type: SourceType; id: string }[];
} {
  const changed: SourceRef[] = [];
  const unchanged: SourceRef[] = [];
  const currentKeys = new Set<string>();

  for (const source of current) {
    const key = cacheKey(source);
    currentKeys.add(key);
    const cached = cache.sources[key];
    if (!cached || cached.hash !== source.hash) {
      changed.push(source);
    } else {
      unchanged.push(source);
    }
  }

  const removed = Object.keys(cache.sources)
    .filter((key) => !currentKeys.has(key))
    .map((key) => {
      const [type, ...idParts] = key.split(":");
      return { type: type as SourceType, id: idParts.join(":") };
    });

  return { changed, unchanged, removed };
}

export function emptyCache(): CacheFile {
  return { version: CACHE_VERSION, sources: {} };
}

export function readCache(cachePath: string): CacheFile {
  if (!fs.existsSync(cachePath)) return emptyCache();
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, "utf8")) as CacheFile;
    if (parsed.version !== CACHE_VERSION || !parsed.sources) return emptyCache();
    return parsed;
  } catch {
    return emptyCache();
  }
}

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

export function collectSources(root: string): FlashcardSource[] {
  const blogsDir = path.join(root, "src/content/blogs");
  const notesPagesDir = path.join(root, "src/content/notes/pages");
  const sources: FlashcardSource[] = [];

  const registryPath = path.join(blogsDir, "index.ts");
  if (fs.existsSync(registryPath)) {
    const slugs = new Set(
      registeredBlogSlugs(fs.readFileSync(registryPath, "utf8")),
    );
    for (const slug of slugs) {
      const file = path.join(blogsDir, `${slug}.mdx`);
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, "utf8");
      const meta = parseBlogMeta(raw);
      sources.push({
        type: "blog",
        id: slug,
        path: path.relative(root, file).split(path.sep).join("/"),
        title: meta.title || slug,
        href: `/blogs/${slug}`,
        tags: meta.tags,
        hash: hashContent(raw),
      });
    }
  }

  for (const file of walkJsonFiles(notesPagesDir)) {
    const raw = fs.readFileSync(file, "utf8");
    const meta = parseNotePage(raw);
    const id = meta.id || noteIdFromPagePath(notesPagesDir, file);
    if (!id) continue;
    sources.push({
      type: "note",
      id,
      path: path.relative(root, file).split(path.sep).join("/"),
      title: meta.title || id,
      href: meta.href || `/notes/${id}/`,
      tags: meta.tags,
      hash: hashContent(raw),
    });
  }

  return sources.sort(
    (a, b) =>
      a.type.localeCompare(b.type) || a.id.localeCompare(b.id),
  );
}

export function toChangedEntry(source: FlashcardSource): ChangedEntry {
  return {
    type: source.type,
    id: source.id,
    path: source.path,
    title: source.title,
    href: source.href,
    tags: source.tags,
    outFile: sourceOutputRel(source.type, source.id),
  };
}

export function writeChangedManifest(
  manifestPath: string,
  changed: ChangedEntry[],
  removed: { type: SourceType; id: string; outFile: string }[],
): ChangedManifest {
  const manifest: ChangedManifest = {
    generatedAt: new Date().toISOString(),
    changed,
    removed,
  };
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}
