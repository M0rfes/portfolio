import fs from "node:fs";
import path from "node:path";

export type NoteMeta = {
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

export type NotePage = NoteMeta & {
  markdown: string;
};

export type NotesGraphData = {
  nodes: {
    id: string;
    title: string;
    href: string;
    tags: string[];
    color: string;
  }[];
  edges: { source: string; target: string }[];
};

type NotesIndex = {
  notes: NoteMeta[];
  graph: NotesGraphData;
};

const INDEX_PATH = path.join(process.cwd(), "src/content/notes/index.json");
const PAGES_DIR = path.join(process.cwd(), "src/content/notes/pages");

function readIndex(): NotesIndex {
  if (!fs.existsSync(INDEX_PATH)) {
    return { notes: [], graph: { nodes: [], edges: [] } };
  }
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as NotesIndex;
}

export function getAllNotes(): NoteMeta[] {
  return readIndex().notes;
}

export function getNotesGraph(): NotesGraphData {
  return readIndex().graph;
}

export function getNoteBySlug(slug: string[]): NotePage | null {
  if (!slug.length) return null;
  const file = path.join(PAGES_DIR, ...slug) + ".json";
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as NotePage;
}
