import path from "node:path";

const WIKILINK_RE = /(!)?\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
const IMAGE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".avif",
  ".pdf",
  ".mp4",
  ".webm",
]);

export type VaultNote = {
  vaultPath: string;
  slug: string[];
  title: string;
  tags: string[];
  flashcard?: boolean;
  summary?: string;
  created?: string;
  updatedAt: string;
  body: string;
};

export type VaultIndex = {
  notes: VaultNote[];
  byPath: Map<string, VaultNote>;
  byBasename: Map<string, VaultNote[]>;
  attachments: string[];
};

export type ConvertedNote = {
  markdown: string;
  links: string[];
  embeds: string[];
  attachments: { vaultPath: string; publicRel: string }[];
};

export type NotesCache = Record<string, { updatedAt: string }>;

export type LinkedFrom = {
  slug: string[];
  href: string;
  title: string;
};

export function stripTitleFormatting(title: string): string {
  let value = title.trim();
  value = value.replace(/^#+\s+/, "");
  value = value.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_match, target: string, alias?: string) => alias || target,
  );
  value = value.replace(/==([^=]+)==/g, "$1");
  value = value.replace(/\*\*([^*]+)\*\*/g, "$1");
  value = value.replace(/__([^_]+)__/g, "$1");
  value = value.replace(/~~([^~]+)~~/g, "$1");
  value = value.replace(/`([^`]+)`/g, "$1");
  value = value.replace(/\*([^*]+)\*/g, "$1");
  value = value.replace(/_([^_]+)_/g, "$1");
  value = value.replace(/<[^>]+>/g, "");
  return value.replace(/\s+/g, " ").trim();
}

export function slugifySegment(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function slugSegments(vaultPath: string): string[] {
  const withoutExt = vaultPath.replace(/\.[^.]+$/, "");
  return withoutExt.split(/[/\\]/).filter(Boolean).map(slugifySegment);
}

export function relativeHref(
  fromSlug: string[],
  toSlug: string[],
  heading?: string,
): string {
  const hash = heading ? `#${slugifySegment(heading)}` : "";
  const sameNote =
    fromSlug.length === toSlug.length &&
    fromSlug.every((part, i) => part === toSlug[i]);
  if (sameNote) {
    return hash || "./";
  }

  const fromDir = fromSlug.join("/") || ".";
  const relative = path.posix.relative(fromDir, toSlug.join("/"));
  const href = relative.split(path.posix.sep).join("/");
  return `${href.endsWith("/") ? href : `${href}/`}${hash}`;
}

function asIsoDate(value: unknown, fallback: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim()) {
    const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return value.trim();
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : String(item)))
      .map((item) => item.replace(/^\[\[|\]\]$/g, "").trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data: Record<string, unknown> = {};
  const lines = match[1].split(/\r?\n/);
  let key: string | null = null;
  let list: string[] | null = null;

  const flushList = () => {
    if (key && list) {
      data[key] = list;
    }
    list = null;
  };

  for (const line of lines) {
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && key) {
      if (!list) list = [];
      list.push(unquote(listItem[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      flushList();
      key = kv[1];
      const rest = kv[2].trim();
      if (rest === "" || rest === "[]") {
        list = [];
        data[key] = list;
        continue;
      }
      if (rest.startsWith("[") && rest.endsWith("]")) {
        data[key] = rest
          .slice(1, -1)
          .split(",")
          .map((item) => unquote(item.trim()))
          .filter(Boolean);
        continue;
      }
      data[key] = unquote(rest);
      continue;
    }

    if (line.trim() === "") {
      flushList();
      key = null;
    }
  }
  flushList();

  return { data, body: raw.slice(match[0].length) };
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "false") return false;
    if (lower === "true") return true;
  }
  return undefined;
}

export function parseNote(
  vaultPath: string,
  raw: string,
  mtimeIso: string,
): VaultNote {
  const { data, body } = parseFrontmatter(raw);
  const filename = path.posix.basename(
    vaultPath,
    path.posix.extname(vaultPath),
  );
  const titleSource =
    typeof data.title === "string" && data.title.trim() ? data.title : filename;
  const flashcard = asBoolean(data.flashcard ?? data.flashcards);

  return {
    vaultPath,
    slug: slugSegments(vaultPath),
    title: stripTitleFormatting(titleSource),
    tags: asStringArray(data.tags),
    ...(flashcard !== undefined ? { flashcard } : {}),
    summary:
      typeof data.summary === "string" && data.summary.trim()
        ? data.summary.trim()
        : undefined,
    created: data.created ? asIsoDate(data.created, mtimeIso) : undefined,
    updatedAt: asIsoDate(data.updated ?? data.created, mtimeIso),
    body: body.replace(/^\s+/, ""),
  };
}

export function buildIndex(
  files: { vaultPath: string; raw: string; mtimeIso: string }[],
  attachmentPaths: string[] = [],
): VaultIndex {
  const notes = files.map((file) =>
    parseNote(file.vaultPath, file.raw, file.mtimeIso),
  );
  const byPath = new Map<string, VaultNote>();
  const byBasename = new Map<string, VaultNote[]>();

  for (const note of notes) {
    byPath.set(note.vaultPath, note);
    const noExt = note.vaultPath.replace(/\\/g, "/").replace(/\.md$/i, "");
    byPath.set(noExt, note);

    const basename = path.posix.basename(noExt);
    const bucket = byBasename.get(basename) ?? [];
    bucket.push(note);
    byBasename.set(basename, bucket);
    byBasename.set(basename.toLowerCase(), bucket);
  }

  return { notes, byPath, byBasename, attachments: attachmentPaths };
}

export function resolveWikilinkTarget(
  target: string,
  index: VaultIndex,
): VaultNote | null {
  const cleaned = target.replace(/\\/g, "/").replace(/\.md$/i, "").trim();
  if (!cleaned) return null;

  const direct =
    index.byPath.get(cleaned) ||
    index.byPath.get(`${cleaned}.md`) ||
    index.byPath.get(decodeURIComponent(cleaned));
  if (direct) return direct;

  const withMd = `${cleaned}.md`;
  for (const note of index.notes) {
    if (note.vaultPath === withMd || note.vaultPath.endsWith(`/${withMd}`)) {
      return note;
    }
    const noExt = note.vaultPath.replace(/\.md$/i, "");
    if (noExt === cleaned || noExt.endsWith(`/${cleaned}`)) {
      return note;
    }
  }

  const basename = path.posix.basename(cleaned);
  const matches =
    index.byBasename.get(basename) ||
    index.byBasename.get(basename.toLowerCase()) ||
    [];
  if (matches.length === 1) return matches[0];
  return null;
}

type WikilinkHit = {
  raw: string;
  embed: boolean;
  target: string;
  heading?: string;
  alias?: string;
};

function parseWikilink(match: RegExpExecArray): WikilinkHit {
  return {
    raw: match[0],
    embed: match[1] === "!",
    target: match[2].trim(),
    heading: match[3]?.trim() || undefined,
    alias: match[4]?.trim() || undefined,
  };
}

function transformOutsideCode(
  markdown: string,
  transform: (text: string) => string,
): string {
  const parts: string[] = [];
  let i = 0;

  while (i < markdown.length) {
    if (markdown.startsWith("```", i) || markdown.startsWith("~~~", i)) {
      const fence = markdown.slice(i, i + 3);
      const end = markdown.indexOf(fence, i + 3);
      if (end === -1) {
        parts.push(markdown.slice(i));
        break;
      }
      parts.push(markdown.slice(i, end + 3));
      i = end + 3;
      continue;
    }

    if (markdown[i] === "`") {
      const end = markdown.indexOf("`", i + 1);
      if (end === -1) {
        parts.push(transform(markdown.slice(i)));
        break;
      }
      parts.push(markdown.slice(i, end + 1));
      i = end + 1;
      continue;
    }

    let nextFence = markdown.indexOf("```", i);
    const nextTilde = markdown.indexOf("~~~", i);
    if (nextTilde !== -1 && (nextFence === -1 || nextTilde < nextFence)) {
      nextFence = nextTilde;
    }
    const nextTick = markdown.indexOf("`", i);
    const next = [nextFence, nextTick]
      .filter((n) => n !== -1)
      .sort((a, b) => a - b)[0];
    const end = next === undefined ? markdown.length : next;
    parts.push(transform(markdown.slice(i, end)));
    i = end;
  }

  return parts.join("");
}

export function isAttachment(target: string): boolean {
  return IMAGE_EXTS.has(path.posix.extname(target).toLowerCase());
}

function attachmentPublicName(target: string): string {
  const ext = path.posix.extname(target);
  const base = path.posix.basename(target, ext);
  return `${slugifySegment(base)}${ext.toLowerCase()}`;
}

export function attachmentHref(slug: string[], fileName: string): string {
  return `/note-assets/${slug.join("/")}/${fileName}`;
}

function findAttachmentVaultPath(
  hostPath: string,
  target: string,
  index: VaultIndex,
): string {
  const cleaned = target.replace(/\\/g, "/").replace(/^\.\//, "");
  const base = path.posix.basename(cleaned);
  const known = index.attachments;

  if (known.includes(cleaned)) return cleaned;

  const matches = known.filter((item) => path.posix.basename(item) === base);
  if (matches.length === 1) return matches[0];

  const hostDir = path.posix.dirname(hostPath);
  const beside = matches.find((item) => path.posix.dirname(item) === hostDir);
  if (beside) return beside;
  if (matches.length > 0) return matches[0];

  if (cleaned.includes("/")) return cleaned;
  if (hostDir === ".") return cleaned;
  return path.posix.join(hostDir, cleaned);
}

function extractSection(body: string, heading: string): string {
  const lines = body.split(/\r?\n/);
  const wanted = heading.trim().toLowerCase();
  let start = -1;
  let level = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    const text = stripTitleFormatting(match[2]).toLowerCase();
    if (
      text === wanted ||
      slugifySegment(match[2]) === slugifySegment(heading)
    ) {
      start = i;
      level = match[1].length;
      break;
    }
  }

  if (start === -1) return body;

  const collected = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) break;
    collected.push(lines[i]);
  }
  return collected.join("\n").trim();
}

function stripLeadingH1(body: string): string {
  return body.replace(/^\s*#\s+[^\n]+\n+/, "");
}

function stripComments(body: string): string {
  return body.replace(/%%[\s\S]*?%%/g, "");
}

function collectEmbedPaths(
  body: string,
  index: VaultIndex,
  seen: Set<string>,
): string[] {
  const embeds: string[] = [];
  transformOutsideCode(body, (text) => {
    WIKILINK_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = WIKILINK_RE.exec(text))) {
      const hit = parseWikilink(match);
      if (!hit.embed || isAttachment(hit.target)) continue;
      const target = resolveWikilinkTarget(hit.target, index);
      if (!target) continue;
      if (seen.has(target.vaultPath)) continue;
      embeds.push(target.vaultPath);
      seen.add(target.vaultPath);
      embeds.push(...collectEmbedPaths(target.body, index, seen));
    }
    return text;
  });
  return embeds;
}

export function collectEmbeds(note: VaultNote, index: VaultIndex): string[] {
  return collectEmbedPaths(note.body, index, new Set());
}

function resolveEmbedTree(
  body: string,
  current: VaultNote,
  root: VaultNote,
  index: VaultIndex,
  stack: Set<string>,
  attachments: ConvertedNote["attachments"],
): string {
  return transformOutsideCode(stripComments(body), (text) =>
    text.replace(WIKILINK_RE, (raw, bang, target, heading, alias) => {
      if (bang !== "!") return raw;
      const hit: WikilinkHit = {
        raw,
        embed: true,
        target: String(target).trim(),
        heading: heading?.trim() || undefined,
        alias: alias?.trim() || undefined,
      };

      if (isAttachment(hit.target)) {
        const fileName = attachmentPublicName(hit.target);
        const publicRel = path.posix.join(root.slug.join("/"), fileName);
        attachments.push({
          vaultPath: findAttachmentVaultPath(
            current.vaultPath,
            hit.target,
            index,
          ),
          publicRel,
        });
        const alt = stripTitleFormatting(
          hit.alias ||
            path.posix.basename(hit.target, path.posix.extname(hit.target)),
        );
        return `![${alt}](${attachmentHref(root.slug, fileName)})`;
      }

      const targetNote = resolveWikilinkTarget(hit.target, index);
      if (!targetNote) {
        return hit.alias || hit.target;
      }
      if (stack.has(targetNote.vaultPath)) {
        return "";
      }

      stack.add(targetNote.vaultPath);
      let extracted = hit.heading
        ? extractSection(targetNote.body, hit.heading)
        : stripLeadingH1(targetNote.body);
      extracted = resolveEmbedTree(
        extracted,
        targetNote,
        root,
        index,
        stack,
        attachments,
      );
      stack.delete(targetNote.vaultPath);
      return extracted.trim();
    }),
  );
}

function convertWikilinks(
  body: string,
  host: VaultNote,
  index: VaultIndex,
  links: Set<string>,
): string {
  return transformOutsideCode(body, (text) =>
    text.replace(WIKILINK_RE, (raw, bang, target, heading, alias) => {
      if (bang === "!") return raw;
      const hit: WikilinkHit = {
        raw,
        embed: false,
        target: String(target).trim(),
        heading: heading?.trim() || undefined,
        alias: alias?.trim() || undefined,
      };
      const label = stripTitleFormatting(hit.alias || hit.target);
      const targetNote = resolveWikilinkTarget(hit.target, index);
      if (!targetNote) {
        return label;
      }
      links.add(targetNote.vaultPath);
      const href = relativeHref(host.slug, targetNote.slug, hit.heading);
      return `[${label}](${href})`;
    }),
  );
}

export function convertNote(note: VaultNote, index: VaultIndex): ConvertedNote {
  const attachments: ConvertedNote["attachments"] = [];
  const stack = new Set<string>([note.vaultPath]);
  const inlined = resolveEmbedTree(
    note.body,
    note,
    note,
    index,
    stack,
    attachments,
  );
  const embeds = collectEmbeds(note, index);
  const links = new Set<string>(embeds);
  const markdown = convertWikilinks(inlined, note, index, links).trim() + "\n";
  return {
    markdown,
    links: [...links],
    embeds,
    attachments,
  };
}

export function notesNeedingRebuild(
  index: VaultIndex,
  cache: NotesCache,
  options: { all?: boolean } = {},
): Set<string> {
  if (options.all) {
    return new Set(index.notes.map((note) => note.vaultPath));
  }

  const rebuild = new Set<string>();
  const embedMap = new Map<string, string[]>();

  for (const note of index.notes) {
    embedMap.set(note.vaultPath, collectEmbeds(note, index));
    const cached = cache[note.vaultPath];
    if (!cached || cached.updatedAt !== note.updatedAt) {
      rebuild.add(note.vaultPath);
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const note of index.notes) {
      if (rebuild.has(note.vaultPath)) continue;
      const embeds = embedMap.get(note.vaultPath) ?? [];
      if (embeds.some((embed) => rebuild.has(embed))) {
        rebuild.add(note.vaultPath);
        changed = true;
      }
    }
  }

  return rebuild;
}

export function collectLinkedFrom(
  notes: { vaultPath: string; slug: string[]; title: string }[],
  linksByPath: Map<string, string[]>,
  hrefForSlug: (slug: string[]) => string,
): Map<string, LinkedFrom[]> {
  const byPath = new Map(notes.map((note) => [note.vaultPath, note]));
  const linkedFrom = new Map<string, LinkedFrom[]>();
  for (const note of notes) linkedFrom.set(note.vaultPath, []);

  for (const source of notes) {
    const seen = new Set<string>();
    for (const targetPath of linksByPath.get(source.vaultPath) ?? []) {
      if (seen.has(targetPath) || targetPath === source.vaultPath) continue;
      seen.add(targetPath);
      const target = byPath.get(targetPath);
      if (!target) continue;
      const inbound = linkedFrom.get(target.vaultPath);
      if (!inbound) continue;
      if (inbound.some((item) => item.href === hrefForSlug(source.slug))) {
        continue;
      }
      inbound.push({
        slug: source.slug,
        href: hrefForSlug(source.slug),
        title: source.title,
      });
    }
  }

  for (const inbound of linkedFrom.values()) {
    inbound.sort(
      (a, b) => a.title.localeCompare(b.title) || a.href.localeCompare(b.href),
    );
  }

  return linkedFrom;
}
