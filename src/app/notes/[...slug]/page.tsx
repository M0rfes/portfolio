import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import { NoteContent } from "@/components/NoteContent";
import { NoteMarkdown } from "@/components/NoteMarkdown";

interface NotePageProps {
  params: Promise<{ slug: string[] }>;
}

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) {
    return { title: "Note Not Found" };
  }

  return {
    title: `${note.title} | Fahim Khan`,
    description: note.summary || `Note: ${note.title}`,
    openGraph: {
      title: note.title,
      description: note.summary || `Note: ${note.title}`,
      type: "article",
      url: `https://fahim.shonif.com${note.href}`,
      siteName: "Fahim Khan - Senior Software Engineer",
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  if (slug?.[0] === "graph") {
    notFound();
  }
  const note = getNoteBySlug(slug);
  if (!note) {
    notFound();
  }
  return (
    <NoteContent note={note}>
      <NoteMarkdown markdown={note.markdown} />
    </NoteContent>
  );
}
