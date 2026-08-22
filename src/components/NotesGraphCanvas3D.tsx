"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { NotesGraphData } from "@/lib/notes";
import { contrastAgainst } from "@/lib/colorContrast";
import { assignGroups, type GraphLink3D, type GraphNode3D } from "@/lib/forceGraphData";
import { ForceGraph3DView } from "@/lib/forceGraph3d";
import { useTheme } from "./ThemeProvider";

const DEFAULT_SPACING = 90;
const DEFAULT_LINK_DISTANCE = 40;
const DEFAULT_NODE_SCALE = 0.5;

export type NotesGraphCanvas3DHandle = {
  updateGraphData: (nodes: GraphNode3D[], links: GraphLink3D[]) => void;
  addNode: (node: GraphNode3D, links?: GraphLink3D[]) => void;
};

function themeColor(name: string, fallback: string) {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

function formatSliderValue(value: number, step: number) {
  if (step < 1) return value.toFixed(2);
  return String(Math.round(value));
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{formatSliderValue(value, step)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

export const NotesGraphCanvas3D = forwardRef<
  NotesGraphCanvas3DHandle,
  { graph: NotesGraphData }
>(function NotesGraphCanvas3D({ graph }, ref) {
  const router = useRouter();
  const { theme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ForceGraph3DView | null>(null);
  const [spacing, setSpacing] = useState(DEFAULT_SPACING);
  const [linkDistance, setLinkDistance] = useState(DEFAULT_LINK_DISTANCE);
  const [nodeScale, setNodeScale] = useState(DEFAULT_NODE_SCALE);

  const data = useMemo(() => assignGroups(graph), [graph]);
  const colors = useMemo(() => {
    const background = themeColor("--background", "#1e1e2e");
    return {
      background,
      link: themeColor("--border", "#45475a"),
      isolatedFill: themeColor("--muted-foreground", "#6c7086"),
      label: contrastAgainst(background),
    };
  }, [theme]);

  useImperativeHandle(ref, () => ({
    updateGraphData: (nodes, links) =>
      engineRef.current?.updateGraphData(nodes, links),
    addNode: (node, links = []) => engineRef.current?.addNode(node, links),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const engine = new ForceGraph3DView({
      container: host,
      width: window.innerWidth,
      height: window.innerHeight,
      nodes: data.nodes,
      links: data.links,
      colors,
      charge: DEFAULT_SPACING,
      linkDistance: DEFAULT_LINK_DISTANCE,
      nodeScale: DEFAULT_NODE_SCALE,
      onNodeClick: (node) => {
        if (node.href) router.push(node.href);
      },
    });
    engineRef.current = engine;

    const onResize = () =>
      engine.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [data, router]);

  useEffect(() => {
    engineRef.current?.setColors(colors);
  }, [colors]);

  return (
    <>
      <div ref={hostRef} className="h-full w-full bg-background" />

      <aside className="absolute top-4 right-4 z-[101] w-64 rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
        <p className="mb-1 text-sm font-medium text-foreground">3D graph</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Drag to rotate · Scroll to zoom
        </p>
        <div className="space-y-3">
          <ControlSlider
            label="Node size"
            value={nodeScale}
            min={0.25}
            max={2}
            step={0.05}
            onChange={(value) => {
              setNodeScale(value);
              engineRef.current?.setNodeScale(value);
            }}
          />
          <ControlSlider
            label="Node spacing"
            value={spacing}
            min={20}
            max={250}
            onChange={(value) => {
              setSpacing(value);
              engineRef.current?.setCharge(value);
            }}
          />
          <ControlSlider
            label="Link distance"
            value={linkDistance}
            min={20}
            max={120}
            onChange={(value) => {
              setLinkDistance(value);
              engineRef.current?.setLinkDistance(value);
            }}
          />
          <button
            type="button"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
            onClick={() => engineRef.current?.fitToView(300)}
          >
            Fit to view
          </button>
          <button
            type="button"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
            onClick={() => {
              setNodeScale(DEFAULT_NODE_SCALE);
              setSpacing(DEFAULT_SPACING);
              setLinkDistance(DEFAULT_LINK_DISTANCE);
              engineRef.current?.setNodeScale(DEFAULT_NODE_SCALE);
              engineRef.current?.setCharge(DEFAULT_SPACING);
              engineRef.current?.setLinkDistance(DEFAULT_LINK_DISTANCE);
              engineRef.current?.fitToView(300);
            }}
          >
            Reset
          </button>
        </div>
      </aside>
    </>
  );
});
