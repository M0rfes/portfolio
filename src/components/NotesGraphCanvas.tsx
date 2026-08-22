"use client";

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import { useRouter } from "next/navigation";
import { NotesGraphData } from "@/lib/notes";
import {
  ForceDirectedGraph,
  type ForceLink,
  type ForceNode,
} from "@/lib/forceDirectedGraph";

const DEFAULT_SPACING = 80;
const DEFAULT_LINK_DISTANCE = 40;
const DEFAULT_NODE_SCALE = 0.5;

export type NotesGraphCanvasHandle = {
  addNode: (node: ForceNode, links?: ForceLink[]) => void;
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

function assignClusters(graph: NotesGraphData): {
  nodes: ForceNode[];
  links: ForceLink[];
} {
  const adjacent = new Map<string, string[]>();
  const degree = new Map<string, number>();
  for (const node of graph.nodes) adjacent.set(node.id, []);
  for (const edge of graph.edges) {
    adjacent.get(edge.source)?.push(edge.target);
    adjacent.get(edge.target)?.push(edge.source);
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const clusterOf = new Map<string, number | null>();
  const visited = new Set<string>();
  let nextCluster = 0;

  for (const node of graph.nodes) {
    if (visited.has(node.id)) continue;
    if ((degree.get(node.id) ?? 0) === 0) {
      clusterOf.set(node.id, null);
      visited.add(node.id);
      continue;
    }

    const stack = [node.id];
    const component: string[] = [];
    visited.add(node.id);
    while (stack.length) {
      const id = stack.pop()!;
      component.push(id);
      for (const neighbor of adjacent.get(id) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }

    const cluster = nextCluster;
    nextCluster += 1;
    for (const id of component) clusterOf.set(id, cluster);
  }

  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      cluster: clusterOf.get(node.id) ?? null,
      title: node.title,
      href: node.href,
      color: node.color,
      tags: node.tags,
    })),
    links: graph.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  };
}

function GraphMinimap({
  engineRef,
  background,
  border,
}: {
  engineRef: React.RefObject<ForceDirectedGraph | null>;
  background: string;
  border: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;

    const draw = () => {
      const engine = engineRef.current;
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      const nodes = engine?.getNodes() ?? [];
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const node of nodes) {
        if (node.x == null || node.y == null) continue;
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
      }

      if (Number.isFinite(minX) && engine) {
        const spanX = Math.max(maxX - minX, 1);
        const spanY = Math.max(maxY - minY, 1);
        minX -= spanX * 0.1;
        maxX += spanX * 0.1;
        minY -= spanY * 0.1;
        maxY += spanY * 0.1;
        const pad = 24;
        const toX = (x: number) =>
          pad + ((x - minX) / (maxX - minX)) * (width - pad * 2);
        const toY = (y: number) =>
          pad + ((y - minY) / (maxY - minY)) * (height - pad * 2);

        for (const node of nodes) {
          if (node.x == null || node.y == null) continue;
          ctx.beginPath();
          ctx.fillStyle = node.color ?? "#6c7086";
          ctx.arc(toX(node.x), toY(node.y), 2, 0, Math.PI * 2);
          ctx.fill();
        }

        const view = engine.getView();
        const viewW = view.width / view.k;
        const viewH = view.height / view.k;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          toX(view.x - viewW / 2),
          toY(view.y - viewH / 2),
          toX(view.x + viewW / 2) - toX(view.x - viewW / 2),
          toY(view.y + viewH / 2) - toY(view.y - viewH / 2),
        );
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [background, border, engineRef]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={180}
      className="cursor-pointer rounded-lg border border-border"
      onClick={(event) => {
        const engine = engineRef.current;
        const canvas = canvasRef.current;
        if (!engine || !canvas) return;
        const nodes = engine.getNodes();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const node of nodes) {
          if (node.x == null || node.y == null) continue;
          minX = Math.min(minX, node.x);
          maxX = Math.max(maxX, node.x);
          minY = Math.min(minY, node.y);
          maxY = Math.max(maxY, node.y);
        }
        if (!Number.isFinite(minX)) return;
        const spanX = Math.max(maxX - minX, 1);
        const spanY = Math.max(maxY - minY, 1);
        minX -= spanX * 0.1;
        maxX += spanX * 0.1;
        minY -= spanY * 0.1;
        maxY += spanY * 0.1;
        const pad = 24;
        const rect = canvas.getBoundingClientRect();
        const clickX =
          ((event.clientX - rect.left) / rect.width) * canvas.width;
        const clickY =
          ((event.clientY - rect.top) / rect.height) * canvas.height;
        engine.centerOn(
          minX + ((clickX - pad) / (canvas.width - pad * 2)) * (maxX - minX),
          minY + ((clickY - pad) / (canvas.height - pad * 2)) * (maxY - minY),
        );
      }}
    />
  );
}

export const NotesGraphCanvas = forwardRef<
  NotesGraphCanvasHandle,
  { graph: NotesGraphData }
>(function NotesGraphCanvas({ graph }, ref) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ForceDirectedGraph | null>(null);
  const didFit = useRef(false);
  const [spacing, setSpacing] = useState(DEFAULT_SPACING);
  const [linkDistance, setLinkDistance] = useState(DEFAULT_LINK_DISTANCE);
  const [nodeScale, setNodeScale] = useState(DEFAULT_NODE_SCALE);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.05);
  const [maxZoom, setMaxZoom] = useState(8);

  const data = useMemo(() => assignClusters(graph), [graph]);
  const colors = useMemo(
    () => ({
      background: themeColor("--background", "#1e1e2e"),
      link: themeColor("--border", "#45475a"),
      label: themeColor("--foreground", "#cdd6f4"),
      isolatedFill: themeColor("--muted-foreground", "#6c7086"),
      isolatedStroke: themeColor("--foreground", "#a6adc8"),
    }),
    [],
  );

  useImperativeHandle(ref, () => ({
    addNode: (node, links = []) => engineRef.current?.addNode(node, links),
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const engine = new ForceDirectedGraph({
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
      onViewChange: (view) => {
        setZoom(view.k);
        setMinZoom(view.minK);
        setMaxZoom(view.maxK);
      },
      onSettled: () => {
        if (didFit.current) return;
        didFit.current = true;
        engine.fitToView(0);
      },
    });
    engineRef.current = engine;
    didFit.current = false;

    const onResize = () =>
      engine.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [colors, data, router]);

  return (
    <>
      <div ref={hostRef} className="h-full w-full bg-background" />

      <aside className="absolute top-4 right-4 z-[101] w-64 rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
        <p className="mb-3 text-sm font-medium text-foreground">Graph controls</p>
        <div className="space-y-3">
          <ControlSlider
            label="Zoom"
            value={zoom}
            min={minZoom}
            max={maxZoom}
            step={0.05}
            onChange={(value) => {
              setZoom(value);
              engineRef.current?.setZoom(value);
            }}
          />
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

      <div className="absolute bottom-4 left-4 z-[101] rounded-xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur">
        <p className="mb-2 px-1 text-xs text-muted-foreground">Minimap</p>
        <GraphMinimap
          engineRef={engineRef}
          background={colors.background}
          border={themeColor("--primary", "#89b4fa")}
        />
      </div>
    </>
  );
});
