"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { NotesGraphData } from "@/lib/notes";

type GraphView = "2d" | "3d";

interface NotesGraphProps {
  graph: NotesGraphData;
}

const NotesGraphCanvas = dynamic(
  () => import("./NotesGraphCanvas").then((module) => module.NotesGraphCanvas),
  { ssr: false },
);

const NotesGraphCanvas3D = dynamic(
  () =>
    import("./NotesGraphCanvas3D").then((module) => module.NotesGraphCanvas3D),
  { ssr: false },
);

export function NotesGraph({ graph }: NotesGraphProps) {
  const router = useRouter();
  const [view, setView] = useState<GraphView>("2d");
  const Canvas = view === "3d" ? NotesGraphCanvas3D : NotesGraphCanvas;

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <div className="absolute top-4 left-4 z-[101] flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/notes/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-foreground hover:bg-muted"
        >
          <X className="w-4 h-4" />
          Close
        </button>
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            aria-pressed={view === "2d"}
            onClick={() => setView("2d")}
            className={`rounded-full px-3 py-1 text-sm ${
              view === "2d"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2D
          </button>
          <button
            type="button"
            aria-pressed={view === "3d"}
            onClick={() => setView("3d")}
            className={`rounded-full px-3 py-1 text-sm ${
              view === "3d"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3D
          </button>
        </div>
      </div>
      <Canvas graph={graph} />
    </div>
  );
}
