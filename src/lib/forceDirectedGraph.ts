import { lighten } from "./colorContrast";
import { nodeTagTarget, tagPullStrength } from "./tagLayout";
import {
  drag as d3Drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  select,
  zoom as d3Zoom,
  zoomIdentity,
  type DragBehavior,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
  type ZoomBehavior,
  type ZoomTransform,
} from "d3";

export type ForceNode = SimulationNodeDatum & {
  id: string;
  cluster: number | null;
  title?: string;
  href?: string;
  color?: string;
  tags?: string[];
};

export type ForceLink = SimulationLinkDatum<ForceNode> & {
  source: string | ForceNode;
  target: string | ForceNode;
};

export type ForceGraphColors = {
  background: string;
  link: string;
  label: string;
  isolatedFill: string;
  isolatedStroke: string;
};

export type ForceGraphView = {
  x: number;
  y: number;
  k: number;
  minK: number;
  maxK: number;
  width: number;
  height: number;
};

type ForceDirectedGraphOptions = {
  container: HTMLElement;
  width: number;
  height: number;
  nodes: ForceNode[];
  links: ForceLink[];
  colors: ForceGraphColors;
  charge?: number;
  linkDistance?: number;
  nodeScale?: number;
  onNodeClick?: (node: ForceNode) => void;
  onViewChange?: (view: ForceGraphView) => void;
  onSettled?: () => void;
};

const MIN_NODE_RADIUS = 4;
const MAX_NODE_RADIUS = 10;
const LABEL_SCREEN_PX = 8;
const FIT_PADDING = 80;
const MAX_NODE_SCREEN_RATIO = 0.12;

// Many-body repulsion is strong enough for clusters to separate, but
// distanceMax cuts off the long-range shove that would fling isolates away.
const CHARGE_DISTANCE_MAX = 220;

// Weak barycenter lock: keeps the whole system near the viewport origin
// without collapsing the two clusters into one blob.
const CENTER_STRENGTH = 0.05;

// Gentle gravity toward the viewport center. Isolates have no link force, so
// this (plus forceCenter) is what keeps them on-screen.
const GRAVITY_STRENGTH = 0.02;

const LINK_STRENGTH = 0.65;
const COLLIDE_PADDING = 5;
const VELOCITY_DECAY = 0.32;
const REHEAT_ALPHA = 0.3;
const LINK_REST_OPACITY = 0.45;
const LINK_DIM_OPACITY = 0.16;
const LINK_LIT_OPACITY = 0.95;
const LINK_WIDTH = 1;
const NODE_LIT = 0.24;
const NODE_LIT_SELF = 0.36;

function linkId(link: ForceLink) {
  const source = typeof link.source === "string" ? link.source : link.source.id;
  const target = typeof link.target === "string" ? link.target : link.target.id;
  return `${source}\0${target}`;
}

function nodeId(node: string | ForceNode) {
  return typeof node === "string" ? node : node.id;
}

export class ForceDirectedGraph {
  private readonly container: HTMLElement;
  private readonly colors: ForceGraphColors;
  private readonly onNodeClick?: (node: ForceNode) => void;
  private readonly onViewChange?: (view: ForceGraphView) => void;
  private readonly onSettled?: () => void;
  private readonly svg: ReturnType<typeof select<SVGSVGElement, unknown>>;
  private readonly root: ReturnType<typeof select<SVGGElement, unknown>>;
  private readonly linkLayer: ReturnType<typeof select<SVGGElement, unknown>>;
  private readonly nodeLayer: ReturnType<typeof select<SVGGElement, unknown>>;
  private readonly simulation: Simulation<ForceNode, ForceLink>;
  private readonly zoom: ZoomBehavior<SVGSVGElement, unknown>;
  private readonly drag: DragBehavior<
    SVGGElement,
    ForceNode,
    ForceNode | { x: number; y: number }
  >;
  private readonly manyBody = forceManyBody<ForceNode>();
  private readonly linkForce = forceLink<ForceNode, ForceLink>();
  private readonly collide = forceCollide<ForceNode>();
  private readonly centering = forceCenter<ForceNode>();
  private readonly gravityX = forceX<ForceNode>(0);
  private readonly gravityY = forceY<ForceNode>(0);
  private readonly tagX = forceX<ForceNode>();
  private readonly tagY = forceY<ForceNode>();

  private nodes: ForceNode[];
  private links: ForceLink[];
  private readonly nodeById = new Map<string, ForceNode>();
  private width: number;
  private height: number;
  private nodeScale: number;
  private transform: ZoomTransform = zoomIdentity;
  private maxDegree = 1;
  private destroyed = false;
  private hoveredId: string | null = null;
  private readonly litNodes = new Set<string>();

  constructor(options: ForceDirectedGraphOptions) {
    this.container = options.container;
    this.colors = options.colors;
    this.onNodeClick = options.onNodeClick;
    this.onViewChange = options.onViewChange;
    this.onSettled = options.onSettled;
    this.width = options.width;
    this.height = options.height;
    this.nodeScale = options.nodeScale ?? 0.5;
    this.nodes = options.nodes.map((node) => ({ ...node }));
    this.links = options.links.map((link) => ({ ...link }));
    for (const node of this.nodes) this.nodeById.set(node.id, node);
    this.maxDegree = this.computeMaxDegree();

    const cx = this.width / 2;
    const cy = this.height / 2;
    for (const node of this.nodes) {
      if (node.x == null) node.x = cx + (Math.random() - 0.5) * 80;
      if (node.y == null) node.y = cy + (Math.random() - 0.5) * 80;
    }

    this.svg = select(this.container)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("display", "block")
      .style("background", this.colors.background)
      .style("touch-action", "none");

    this.root = this.svg.append("g");
    this.linkLayer = this.root.append("g").attr("stroke-linecap", "round");
    this.nodeLayer = this.root.append("g");

    this.manyBody
      .strength(-(options.charge ?? 80))
      .distanceMax(CHARGE_DISTANCE_MAX)
      .theta(0.9);

    this.linkForce
      .id((node) => node.id)
      .distance(options.linkDistance ?? 40)
      .strength(LINK_STRENGTH)
      .iterations(1);

    this.centering.x(cx).y(cy).strength(CENTER_STRENGTH);
    this.gravityX.x(cx).strength(GRAVITY_STRENGTH);
    this.gravityY.y(cy).strength(GRAVITY_STRENGTH);
    this.bindTagForces();
    this.collide.radius((node) => this.radius(node) + COLLIDE_PADDING).strength(0.7);

    this.simulation = forceSimulation(this.nodes)
      .force("charge", this.manyBody)
      .force("link", this.linkForce.links(this.links))
      .force("center", this.centering)
      .force("x", this.gravityX)
      .force("y", this.gravityY)
      .force("tagX", this.tagX)
      .force("tagY", this.tagY)
      .force("collide", this.collide)
      .velocityDecay(VELOCITY_DECAY)
      .on("tick", () => this.ticked())
      .on("end", () => {
        if (this.destroyed) return;
        this.onSettled?.();
      });

    this.drag = d3Drag<SVGGElement, ForceNode>()
      .on("start", (event, node) => this.dragstarted(event, node))
      .on("drag", (event, node) => this.dragged(event, node))
      .on("end", (event, node) => this.dragended(event, node));

    this.zoom = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 8])
      .on("zoom", (event) => {
        this.transform = event.transform;
        this.root.attr("transform", event.transform.toString());
        this.styleLabels();
        this.emitView();
      });

    this.svg.call(this.zoom);

    this.join();
    this.simulation.alpha(1).restart();
  }

  addNode(node: ForceNode, links: ForceLink[] = []) {
    if (this.destroyed) return;
    if (!this.nodeById.has(node.id)) {
      const neighborIds = links.flatMap((link) => {
        const source = nodeId(link.source);
        const target = nodeId(link.target);
        if (source === node.id) return [target];
        if (target === node.id) return [source];
        return [];
      });
      const neighbors = neighborIds
        .map((id) => this.nodeById.get(id))
        .filter((item): item is ForceNode => Boolean(item));
      const next: ForceNode = { ...node };
      if (neighbors.length) {
        next.x =
          neighbors.reduce((sum, item) => sum + (item.x ?? 0), 0) /
          neighbors.length;
        next.y =
          neighbors.reduce((sum, item) => sum + (item.y ?? 0), 0) /
          neighbors.length;
      } else {
        next.x = this.width / 2 + (Math.random() - 0.5) * 40;
        next.y = this.height / 2 + (Math.random() - 0.5) * 40;
      }
      this.nodes.push(next);
      this.nodeById.set(next.id, next);
    }

    const existing = new Set(this.links.map(linkId));
    for (const link of links) {
      const key = linkId(link);
      if (existing.has(key)) continue;
      if (!this.nodeById.has(nodeId(link.source))) continue;
      if (!this.nodeById.has(nodeId(link.target))) continue;
      this.links.push({ source: nodeId(link.source), target: nodeId(link.target) });
      existing.add(key);
    }

    this.maxDegree = this.computeMaxDegree();
    this.simulation.nodes(this.nodes);
    this.linkForce.links(this.links);
    this.join();
    this.reheat();
  }

  reheat() {
    this.simulation.alpha(REHEAT_ALPHA).restart();
  }

  setCharge(strength: number) {
    this.manyBody.strength(-Math.abs(strength));
    this.reheat();
  }

  setLinkDistance(distance: number) {
    this.linkForce.distance(distance);
    this.reheat();
  }

  setNodeScale(scale: number) {
    this.nodeScale = scale;
    this.collide.radius((node) => this.radius(node) + COLLIDE_PADDING);
    this.styleNodes();
    this.styleLabels();
  }

  setZoom(k: number) {
    const view = this.getView();
    this.focus(view.x, view.y, k, 0);
  }

  getZoom() {
    return this.transform.k;
  }

  getView(): ForceGraphView {
    const [minK, maxK] = this.zoom.scaleExtent();
    return {
      x: (this.width / 2 - this.transform.x) / this.transform.k,
      y: (this.height / 2 - this.transform.y) / this.transform.k,
      k: this.transform.k,
      minK,
      maxK,
      width: this.width,
      height: this.height,
    };
  }

  getNodes() {
    return this.nodes;
  }

  centerOn(x: number, y: number, duration = 300) {
    this.focus(x, y, this.transform.k, duration);
  }

  fitToView(duration = 400) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const node of this.nodes) {
      if (node.x == null || node.y == null) continue;
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
    if (!Number.isFinite(minX)) return;

    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const k = Math.min(
      this.width / (spanX + FIT_PADDING * 2),
      this.height / (spanY + FIT_PADDING * 2),
    );
    const maxRadius = MAX_NODE_RADIUS * this.nodeScale;
    const zoomCap = Math.max(
      (Math.min(this.width, this.height) * MAX_NODE_SCREEN_RATIO) /
        (2 * maxRadius),
      k * 1.8,
    );
    this.zoom.scaleExtent([k * 0.95, zoomCap]);
    this.focus((minX + maxX) / 2, (minY + maxY) / 2, k, duration);
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;
    this.svg.attr("width", width).attr("height", height);
    this.centering.x(width / 2).y(height / 2);
    this.gravityX.x(width / 2);
    this.gravityY.y(height / 2);
    this.bindTagForces();
    this.emitView();
  }

  destroy() {
    this.destroyed = true;
    this.simulation.stop();
    this.simulation.on("tick", null);
    this.simulation.on("end", null);
    this.zoom.on("zoom", null);
    this.svg.on(".zoom", null);
    this.svg.remove();
    this.nodeById.clear();
    this.nodes = [];
    this.links = [];
  }

  private join() {
    const link = this.linkLayer
      .selectAll<SVGLineElement, ForceLink>("line")
      .data(this.links, linkId);

    link.exit().remove();
    link
      .enter()
      .append("line")
      .attr("stroke", this.colors.link)
      .attr("stroke-opacity", LINK_REST_OPACITY)
      .attr("stroke-width", LINK_WIDTH);

    const node = this.nodeLayer
      .selectAll<SVGGElement, ForceNode>("g.node")
      .data(this.nodes, (item) => item.id);

    node.exit().remove();

    const enter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("cursor", "grab")
      .call(this.drag)
      .on("click", (event, item) => {
        if (event.defaultPrevented) return;
        this.onNodeClick?.(item);
      })
      .on("pointerenter", (_, item) => this.setHover(item.id))
      .on("pointerleave", () => this.setHover(null));

    enter.append("circle");
    enter
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging")
      .attr("pointer-events", "none")
      .attr("paint-order", "stroke")
      .attr("fill", this.colors.label)
      .attr("stroke", this.colors.background)
      .attr("font-family", "sans-serif");

    this.styleLinks();
    this.styleNodes();
    this.styleLabels();
  }

  private ticked() {
    if (this.destroyed) return;
    this.linkLayer
      .selectAll<SVGLineElement, ForceLink>("line")
      .attr("x1", (link) => (link.source as ForceNode).x ?? 0)
      .attr("y1", (link) => (link.source as ForceNode).y ?? 0)
      .attr("x2", (link) => (link.target as ForceNode).x ?? 0)
      .attr("y2", (link) => (link.target as ForceNode).y ?? 0);

    this.nodeLayer
      .selectAll<SVGGElement, ForceNode>("g.node")
      .attr("transform", (node) => `translate(${node.x ?? 0},${node.y ?? 0})`);
  }

  private styleLinks() {
    this.linkLayer
      .selectAll<SVGLineElement, ForceLink>("line")
      .attr("stroke", (link) =>
        this.isLitLink(link) ? lighten(this.colors.link, 0.5) : this.colors.link,
      )
      .attr("stroke-opacity", (link) => {
        if (!this.hoveredId) return LINK_REST_OPACITY;
        return this.isLitLink(link) ? LINK_LIT_OPACITY : LINK_DIM_OPACITY;
      })
      .attr("stroke-width", LINK_WIDTH);
  }

  private styleNodes() {
    this.nodeLayer
      .selectAll<SVGGElement, ForceNode>("g.node")
      .select("circle")
      .attr("r", (node) => this.radius(node))
      .attr("fill", (node) => this.litFill(node))
      .attr("stroke", (node) =>
        node.cluster == null ? this.colors.isolatedStroke : "none",
      )
      .attr("stroke-width", (node) => (node.cluster == null ? 1.5 : 0))
      .attr("stroke-dasharray", (node) =>
        node.cluster == null ? "3 2" : null,
      )
      .attr("fill-opacity", (node) => (node.cluster == null ? 0.7 : 1));
  }

  private styleLabels() {
    const k = Math.max(this.transform.k, 0.01);
    this.nodeLayer
      .selectAll<SVGGElement, ForceNode>("g.node")
      .select("text")
      .text((node) => node.title ?? node.id)
      .attr("y", (node) => this.radius(node) + 3 / k)
      .attr("font-size", LABEL_SCREEN_PX / k)
      .attr("stroke-width", 3 / k);
  }

  private dragstarted(
    event: { active: number },
    node: ForceNode,
  ) {
    if (!event.active) this.simulation.alphaTarget(REHEAT_ALPHA).restart();
    node.fx = node.x;
    node.fy = node.y;
  }

  private dragged(event: { x: number; y: number }, node: ForceNode) {
    node.fx = event.x;
    node.fy = event.y;
  }

  private dragended(event: { active: number }, node: ForceNode) {
    if (!event.active) this.simulation.alphaTarget(0);
    node.fx = null;
    node.fy = null;
  }

  private focus(x: number, y: number, k: number, duration: number) {
    const [minK, maxK] = this.zoom.scaleExtent();
    const scale = Math.min(maxK, Math.max(minK, k));
    const next = zoomIdentity
      .translate(this.width / 2, this.height / 2)
      .scale(scale)
      .translate(-x, -y);
    if (duration > 0) {
      this.svg.transition().duration(duration).call(this.zoom.transform, next);
      return;
    }
    this.svg.call(this.zoom.transform, next);
  }

  private emitView() {
    this.onViewChange?.(this.getView());
  }

  private bindTagForces() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.tagX
      .x((node) => {
        const target = nodeTagTarget(node.tags, 2);
        return target ? cx + target.x : cx;
      })
      .strength((node) => tagPullStrength(node.tags));
    this.tagY
      .y((node) => {
        const target = nodeTagTarget(node.tags, 2);
        return target ? cy + target.y : cy;
      })
      .strength((node) => tagPullStrength(node.tags));
  }

  private radius(node: ForceNode) {
    const degree = this.degree(node.id);
    if (this.maxDegree <= 0) return MIN_NODE_RADIUS * this.nodeScale;
    return (
      (MIN_NODE_RADIUS +
        Math.sqrt(degree / this.maxDegree) *
          (MAX_NODE_RADIUS - MIN_NODE_RADIUS)) *
      this.nodeScale
    );
  }

  private fill(node: ForceNode) {
    return node.color ?? this.colors.isolatedFill;
  }

  private litFill(node: ForceNode) {
    const base = this.fill(node);
    if (node.id === this.hoveredId) return lighten(base, NODE_LIT_SELF);
    if (this.litNodes.has(node.id)) return lighten(base, NODE_LIT);
    return base;
  }

  private isLitLink(link: ForceLink) {
    if (!this.hoveredId) return false;
    return (
      nodeId(link.source) === this.hoveredId ||
      nodeId(link.target) === this.hoveredId
    );
  }

  private setHover(id: string | null) {
    if (this.destroyed) return;
    if (id === this.hoveredId) return;
    this.hoveredId = id;
    this.litNodes.clear();
    if (id) {
      this.litNodes.add(id);
      for (const link of this.links) {
        const source = nodeId(link.source);
        const target = nodeId(link.target);
        if (source === id) this.litNodes.add(target);
        if (target === id) this.litNodes.add(source);
      }
    }
    this.styleLinks();
    this.styleNodes();
  }

  private degree(id: string) {
    let count = 0;
    for (const link of this.links) {
      if (nodeId(link.source) === id || nodeId(link.target) === id) count += 1;
    }
    return count;
  }

  private computeMaxDegree() {
    const counts = new Map<string, number>();
    for (const link of this.links) {
      const source = nodeId(link.source);
      const target = nodeId(link.target);
      counts.set(source, (counts.get(source) ?? 0) + 1);
      counts.set(target, (counts.get(target) ?? 0) + 1);
    }
    return Math.max(1, ...counts.values());
  }
}
