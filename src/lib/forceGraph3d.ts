import ForceGraph3D, {
  type ForceGraph3DInstance,
} from "3d-force-graph";
import {
  forceCenter,
  forceCollide,
  forceRadial,
  forceX,
  forceY,
  forceZ,
} from "d3-force-3d";
import SpriteText from "three-spritetext";
import { contrastAgainst, lighten } from "./colorContrast";
import {
  mergeGraphData,
  nodeId,
  type GraphLink3D,
  type GraphNode3D,
} from "./forceGraphData";
import { nodeTagTarget, tagPullStrength } from "./tagLayout";

export type ForceGraph3DColors = {
  background: string;
  link: string;
  isolatedFill: string;
  label: string;
};

export type ForceGraph3DOptions = {
  container: HTMLElement;
  width: number;
  height: number;
  nodes: GraphNode3D[];
  links: GraphLink3D[];
  colors: ForceGraph3DColors;
  charge?: number;
  linkDistance?: number;
  nodeScale?: number;
  onNodeClick?: (node: GraphNode3D) => void;
  onSettled?: () => void;
};

const GROUP_PALETTE = [
  "#89b4fa",
  "#f38ba8",
  "#a6e3a1",
  "#fab387",
  "#cba6f7",
  "#94e2d5",
  "#f9e2af",
];

const CHARGE_DISTANCE_MAX = 280;
const CENTER_STRENGTH = 0.14;
const GRAVITY_STRENGTH = 0.045;
const RADIAL_STRENGTH_ISOLATED = 0.18;
const RADIAL_STRENGTH_CLUSTER = 0.03;
const RADIAL_RADIUS_ISOLATED = 48;
const RADIAL_RADIUS_CLUSTER = 150;
const LINK_STRENGTH = 0.55;
const COLLIDE_PADDING = 2;
const VELOCITY_DECAY = 0.36;
const CLUSTER_NODE_VAL = 1.25;
const ISOLATED_NODE_VAL = 0.7;
const NODE_REL_SIZE = 4;
const LABEL_HEIGHT = 3.2;
const NODE_LIT = 0.24;
const NODE_LIT_SELF = 0.36;
const LINK_WIDTH = 1;

export class ForceGraph3DView {
  private colors: ForceGraph3DColors;
  private readonly onNodeClick?: (node: GraphNode3D) => void;
  private readonly graph: ForceGraph3DInstance<GraphNode3D, GraphLink3D>;
  private chargeStrength: number;
  private linkDistance: number;
  private nodeScale: number;
  private didFit = false;
  private destroyed = false;
  private hoveredId: string | null = null;
  private readonly litNodes = new Set<string>();

  constructor(options: ForceGraph3DOptions) {
    this.colors = options.colors;
    this.onNodeClick = options.onNodeClick;
    this.chargeStrength = options.charge ?? 90;
    this.linkDistance = options.linkDistance ?? 40;
    this.nodeScale = options.nodeScale ?? 0.5;

    this.graph = (
      new ForceGraph3D(options.container, {
        controlType: "orbit",
      }) as unknown as ForceGraph3DInstance<GraphNode3D, GraphLink3D>
    )
      .width(options.width)
      .height(options.height)
      .backgroundColor(this.colors.background)
      .showNavInfo(false)
      .enableNavigationControls(true)
      .enablePointerInteraction(true)
      .enableNodeDrag(true)
      .nodeId("id")
      .nodeLabel((node) => node.name)
      .nodeRelSize(NODE_REL_SIZE)
      .nodeVal((node) => this.nodeValue(node))
      .nodeColor((node) => this.displayNodeColor(node))
      .nodeOpacity(0.95)
      .nodeResolution(16)
      .nodeThreeObjectExtend(true)
      .nodeThreeObject((node: GraphNode3D) => this.createLabel(node))
      .linkColor((link) => this.displayLinkColor(link))
      .linkOpacity(0.4)
      .linkWidth(() => this.displayLinkWidth())
      .d3VelocityDecay(VELOCITY_DECAY)
      .onNodeHover((node) => this.setHover(node?.id ?? null))
      .onNodeDragEnd(() => this.sealOrbitPointers())
      .onNodeClick((node) => this.onNodeClick?.(node))
      .onEngineStop(() => {
        if (this.destroyed) return;
        if (!this.didFit) {
          this.didFit = true;
          this.fitToView(0);
        }
        options.onSettled?.();
      });

    this.configureForces();
    this.graph.graphData({
      nodes: options.nodes.map((node) => ({ ...node })),
      links: options.links.map((link) => ({ ...link })),
    });
    this.patchOrbitPointerUp();
  }

  updateGraphData(nodes: GraphNode3D[], links: GraphLink3D[]) {
    if (this.destroyed) return;
    const merged = mergeGraphData(this.graph.graphData(), { nodes, links });
    this.graph.graphData(merged);
  }

  addNode(node: GraphNode3D, links: GraphLink3D[] = []) {
    const current = this.graph.graphData();
    const nextNodes = current.nodes.some((item) => item.id === node.id)
      ? current.nodes
      : [...current.nodes, node];
    this.updateGraphData(nextNodes, [...current.links, ...links]);
  }

  setCharge(strength: number) {
    this.chargeStrength = Math.abs(strength);
    const charge = this.graph.d3Force("charge");
    charge?.strength?.(-this.chargeStrength);
    this.graph.d3ReheatSimulation();
  }

  setLinkDistance(distance: number) {
    this.linkDistance = distance;
    const link = this.graph.d3Force("link");
    link?.distance?.(distance);
    this.graph.d3ReheatSimulation();
  }

  setColors(colors: ForceGraph3DColors) {
    this.colors = colors;
    this.graph
      .backgroundColor(colors.background)
      .nodeColor((node) => this.displayNodeColor(node))
      .linkColor((link) => this.displayLinkColor(link))
      .linkWidth(() => this.displayLinkWidth())
      .nodeThreeObject((node: GraphNode3D) => this.createLabel(node));
  }

  setNodeScale(scale: number) {
    this.nodeScale = scale;
    this.graph
      .nodeVal((node) => this.nodeValue(node))
      .nodeThreeObject((node: GraphNode3D) => this.createLabel(node));
    this.refreshCollide();
  }

  fitToView(duration = 400) {
    this.graph.zoomToFit(duration, 40);
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.graph.width(width).height(height);
  }

  getNodes() {
    return this.graph.graphData().nodes;
  }

  destroy() {
    this.destroyed = true;
    this.graph.pauseAnimation();
    this.graph._destructor();
  }

  private orbitControls() {
    return this.graph.controls() as {
      _onPointerUp?: (event: PointerEvent) => void;
      _pointers?: Array<number | string>;
      _pointerPositions?: Record<string | number, { x: number; y: number }>;
    };
  }

  private sealOrbitPointers() {
    const controls = this.orbitControls();
    const positions = controls._pointerPositions;
    if (!positions) return;
    for (const id of controls._pointers ?? []) {
      if (!positions[id]) positions[id] = { x: 0, y: 0 };
    }
  }

  private patchOrbitPointerUp() {
    const controls = this.orbitControls();
    const original = controls._onPointerUp?.bind(controls);
    if (!original) return;
    controls._onPointerUp = (event: PointerEvent) => {
      this.sealOrbitPointers();
      original(event);
    };
  }

  private configureForces() {
    const charge = this.graph.d3Force("charge");
    charge?.strength?.(-this.chargeStrength);
    charge?.distanceMax?.(CHARGE_DISTANCE_MAX);

    const link = this.graph.d3Force("link");
    link?.distance?.(this.linkDistance);
    link?.strength?.(LINK_STRENGTH);

    this.graph
      .d3Force("center", forceCenter(0, 0, 0).strength(CENTER_STRENGTH))
      .d3Force("x", forceX(0).strength(GRAVITY_STRENGTH))
      .d3Force("y", forceY(0).strength(GRAVITY_STRENGTH))
      .d3Force("z", forceZ(0).strength(GRAVITY_STRENGTH))
      .d3Force(
        "tagX",
        forceX<GraphNode3D>((node) => nodeTagTarget(node.tags, 3)?.x ?? 0).strength(
          (node) => tagPullStrength(node.tags),
        ),
      )
      .d3Force(
        "tagY",
        forceY<GraphNode3D>((node) => nodeTagTarget(node.tags, 3)?.y ?? 0).strength(
          (node) => tagPullStrength(node.tags),
        ),
      )
      .d3Force(
        "tagZ",
        forceZ<GraphNode3D>((node) => nodeTagTarget(node.tags, 3)?.z ?? 0).strength(
          (node) => tagPullStrength(node.tags),
        ),
      )
      .d3Force(
        "radial",
        forceRadial<GraphNode3D>((node) =>
          node.isolated ? RADIAL_RADIUS_ISOLATED : RADIAL_RADIUS_CLUSTER,
        )
          .strength((node) =>
            node.isolated ? RADIAL_STRENGTH_ISOLATED : RADIAL_STRENGTH_CLUSTER,
          )
          .x(0)
          .y(0)
          .z(0),
      );

    this.refreshCollide();
  }

  private refreshCollide() {
    this.graph.d3Force(
      "collide",
      forceCollide<GraphNode3D>(
        (node) => this.nodeRadius(node) + COLLIDE_PADDING,
      ).strength(0.65),
    );
  }

  private nodeValue(node: GraphNode3D) {
    return (
      (node.isolated ? ISOLATED_NODE_VAL : CLUSTER_NODE_VAL) * this.nodeScale
    );
  }

  private createLabel(node: GraphNode3D) {
    const sprite = new SpriteText(node.name) as SpriteText & {
      material: { depthWrite: boolean };
      position: { y: number };
    };
    sprite.color = contrastAgainst(this.colors.background);
    sprite.textHeight = LABEL_HEIGHT;
    sprite.fontFace = "sans-serif";
    sprite.strokeWidth = 3.2;
    sprite.strokeColor = this.colors.background;
    sprite.material.depthWrite = false;
    sprite.position.y = -(this.nodeRadius(node) + LABEL_HEIGHT * 0.85);
    return sprite;
  }

  private nodeRadius(node: GraphNode3D) {
    return Math.cbrt(this.nodeValue(node)) * NODE_REL_SIZE;
  }

  private nodeColor(node: GraphNode3D) {
    if (node.isolated) return this.colors.isolatedFill;
    if (node.color) return node.color;
    if (node.group == null) return this.colors.isolatedFill;
    return GROUP_PALETTE[node.group % GROUP_PALETTE.length];
  }

  private displayNodeColor(node: GraphNode3D) {
    const base = this.nodeColor(node);
    if (node.id === this.hoveredId) return lighten(base, NODE_LIT_SELF);
    if (this.litNodes.has(node.id)) return lighten(base, NODE_LIT);
    return base;
  }

  private displayLinkColor(link: GraphLink3D) {
    if (this.isLitLink(link)) return lighten(this.colors.link, 0.55);
    return this.colors.link;
  }

  private displayLinkWidth() {
    return LINK_WIDTH;
  }

  private isLitLink(link: GraphLink3D) {
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
      for (const link of this.graph.graphData().links) {
        const source = nodeId(link.source);
        const target = nodeId(link.target);
        if (source === id) this.litNodes.add(target);
        if (target === id) this.litNodes.add(source);
      }
    }
    this.graph
      .nodeColor((node) => this.displayNodeColor(node))
      .linkColor((link) => this.displayLinkColor(link))
      .linkWidth(() => this.displayLinkWidth())
      .linkOpacity(id ? 0.55 : 0.4);
  }
}
