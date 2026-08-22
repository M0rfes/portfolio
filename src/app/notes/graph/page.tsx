import { NotesGraph } from "@/components/NotesGraph";
import { getNotesGraph } from "@/lib/notes";

export const metadata = {
  title: "Notes Graph | Fahim Khan",
  description: "Fullscreen graph of published notes and their links.",
};

export default function NotesGraphPage() {
  return <NotesGraph graph={getNotesGraph()} />;
}
