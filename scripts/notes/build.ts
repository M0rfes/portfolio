import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildIndex,
  convertNote,
  notesNeedingRebuild,
  type VaultNote,
} from "./convert";

export const CACHE_VERSION = 1;

const ROOT = process.cwd();
const VAULT_DIR = path.join(ROOT, "vault");
const OUT_DIR = path.join(ROOT, "src/content/notes");
const PAGES_DIR = path.join(OUT_DIR, "pages");
const PUBLIC_DIR = path.join(ROOT, "public/notes");
const CACHE_PATH = path.join(OUT_DIR, ".cache.json");
const INDEX_PATH = path.join(OUT_DIR, "index.json");
const SKIP_DIRS = new Set([".obsidian", ".agent", ".git", ".trash", "node_modules"]);

type CacheFile = {
  version: number;
  notes: Record<
    string,
    {
      updatedAt: string;
      slug: string[];
      links: string[];
    }
  >;
};

type NoteMeta = {
  slug: string[];
  href: string;
  title: string;
  tags: string[];
  summary?: string;
  created?: string;
  updatedAt: string;
  vaultPath: string;
  folder: string;
};

function updateSubmodule() {
  execSync("git submodule update --init --remote --recursive vault", {
    cwd: ROOT,
    stdio: "inherit",
  });
}

function walkMarkdown(dir: string, base: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdown(full, base));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return out;
}

function readCache(): CacheFile {
  if (!fs.existsSync(CACHE_PATH)) {
    return { version: CACHE_VERSION, notes: {} };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) as CacheFile;
    if (parsed.version !== CACHE_VERSION || !parsed.notes) {
      return { version: CACHE_VERSION, notes: {} };
    }
    return parsed;
  } catch {
    return { version: CACHE_VERSION, notes: {} };
  }
}

function pagePathForSlug(slug: string[]): string {
  return path.join(PAGES_DIR, ...slug) + ".json";
}

function hrefForSlug(slug: string[]): string {
  return `/notes/${slug.join("/")}/`;
}

function rgbIntToHex(rgb: number): string {
  return `#${rgb.toString(16).padStart(6, "0")}`;
}

function readGraphColors(): { tag: string; color: string }[] {
  const graphPath = path.join(VAULT_DIR, ".obsidian/graph.json");
  if (!fs.existsSync(graphPath)) return [];
  try {
    const graph = JSON.parse(fs.readFileSync(graphPath, "utf8")) as {
      colorGroups?: { query?: string; color?: { rgb?: number } }[];
    };
    return (graph.colorGroups ?? [])
      .map((group) => {
        const tag = group.query?.match(/#([^\s]+)/)?.[1];
        if (!tag || group.color?.rgb == null) return null;
        return { tag, color: rgbIntToHex(group.color.rgb) };
      })
      .filter((group): group is { tag: string; color: string } => Boolean(group));
  } catch {
    return [];
  }
}

function colorForTags(
  tags: string[],
  groups: { tag: string; color: string }[],
): string {
  const lower = tags.map((tag) => tag.toLowerCase());
  const match = groups.find((group) =>
    lower.includes(group.tag.toLowerCase()),
  );
  return match?.color ?? "#89b4fa";
}

function copyAttachment(
  vaultRel: string,
  publicRel: string,
): void {
  const candidates = [
    path.join(VAULT_DIR, vaultRel),
    path.join(VAULT_DIR, path.posix.basename(vaultRel)),
  ];
  const source = candidates.find((candidate) => fs.existsSync(candidate));
  if (!source) return;
  const dest = path.join(PUBLIC_DIR, publicRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
}

function folderName(note: VaultNote): string {
  const parts = note.vaultPath.split("/");
  return parts.length > 1 ? parts[0] : "Notes";
}

function isoFromMtime(mtime: Date): string {
  return mtime.toISOString().slice(0, 10);
}

export function buildNotes(options: { skipGit?: boolean } = {}) {
  if (!options.skipGit) {
    updateSubmodule();
  }

  const files = walkMarkdown(VAULT_DIR, VAULT_DIR).map((vaultPath) => {
    const full = path.join(VAULT_DIR, vaultPath);
    const stat = fs.statSync(full);
    return {
      vaultPath,
      raw: fs.readFileSync(full, "utf8"),
      mtimeIso: isoFromMtime(stat.mtime),
    };
  });

  const index = buildIndex(files);
  const cache = readCache();
  const rebuild = notesNeedingRebuild(index, cache.notes);

  for (const note of index.notes) {
    const outFile = pagePathForSlug(note.slug);
    if (!fs.existsSync(outFile)) {
      rebuild.add(note.vaultPath);
    }
  }

  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const linksByPath = new Map<string, string[]>();
  for (const [vaultPath, entry] of Object.entries(cache.notes)) {
    linksByPath.set(vaultPath, entry.links ?? []);
  }

  for (const note of index.notes) {
    if (!rebuild.has(note.vaultPath)) continue;
    const converted = convertNote(note, index);
    const meta: NoteMeta = {
      slug: note.slug,
      href: hrefForSlug(note.slug),
      title: note.title,
      tags: note.tags,
      summary: note.summary,
      created: note.created,
      updatedAt: note.updatedAt,
      vaultPath: note.vaultPath,
      folder: folderName(note),
    };
    const outFile = pagePathForSlug(note.slug);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(
      outFile,
      JSON.stringify({ ...meta, markdown: converted.markdown }, null, 2),
    );
    linksByPath.set(note.vaultPath, converted.links);
    cache.notes[note.vaultPath] = {
      updatedAt: note.updatedAt,
      slug: note.slug,
      links: converted.links,
    };
    for (const attachment of converted.attachments) {
      copyAttachment(attachment.vaultPath, attachment.publicRel);
    }
  }

  const currentPaths = new Set(index.notes.map((note) => note.vaultPath));
  for (const [vaultPath, entry] of Object.entries(cache.notes)) {
    if (currentPaths.has(vaultPath)) continue;
    delete cache.notes[vaultPath];
    if (entry.slug?.length) {
      const stale = pagePathForSlug(entry.slug);
      if (fs.existsSync(stale)) fs.unlinkSync(stale);
    }
  }

  const byPath = new Map(index.notes.map((note) => [note.vaultPath, note]));
  const colorGroups = readGraphColors();
  const notes: NoteMeta[] = index.notes
    .map((note) => ({
      slug: note.slug,
      href: hrefForSlug(note.slug),
      title: note.title,
      tags: note.tags,
      summary: note.summary,
      created: note.created,
      updatedAt: note.updatedAt,
      vaultPath: note.vaultPath,
      folder: folderName(note),
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.title.localeCompare(b.title));

  const graph = {
    nodes: notes.map((note) => ({
      id: note.slug.join("/"),
      title: note.title,
      href: note.href,
      tags: note.tags,
      color: colorForTags(note.tags, colorGroups),
    })),
    edges: notes.flatMap((note) => {
      const links = linksByPath.get(note.vaultPath) ?? [];
      return links
        .map((targetPath) => byPath.get(targetPath))
        .filter((target): target is VaultNote => Boolean(target))
        .map((target) => ({
          source: note.slug.join("/"),
          target: target.slug.join("/"),
        }));
    }),
  };

  fs.writeFileSync(INDEX_PATH, JSON.stringify({ notes, graph }, null, 2));
  cache.version = CACHE_VERSION;
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

  console.log(
    `Notes: ${notes.length} total, ${rebuild.size} rebuilt, ${graph.edges.length} links`,
  );
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  buildNotes({ skipGit: process.argv.includes("--skip-git") });
}
