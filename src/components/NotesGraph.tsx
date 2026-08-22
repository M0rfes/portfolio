"use client";

import { ComponentType, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { NotesGraphData } from "@/lib/notes";

interface NotesGraphProps {
  graph: NotesGraphData;
}

export function NotesGraph({ graph }: NotesGraphProps) {
  const router = useRouter();
  const [Canvas, setCanvas] = useState<
    ComponentType<{ graph: NotesGraphData }> | null
  >(null);

  useEffect(() => {
    import("./NotesGraphCanvas").then((module) => {
      setCanvas(() => module.NotesGraphCanvas);
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <button
        type="button"
        onClick={() => router.push("/notes/")}
        className="absolute top-4 left-4 z-[101] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-foreground hover:bg-muted"
      >
        <X className="w-4 h-4" />
        Close
      </button>
      {Canvas ? <Canvas graph={graph} /> : null}
    </div>
  );
}
