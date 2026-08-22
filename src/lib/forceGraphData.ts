export type GraphNode3D = {
  id: string;
  group: number | null;
  name: string;
  href?: string;
  color?: string;
  tags?: string[];
  isolated?: boolean;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
};

export type GraphLink3D = {
  source: string | GraphNode3D;
  target: string | GraphNode3D;
};

export type GraphInput = {
  nodes: {
    id: string;
    name?: string;
    title?: string;
    href?: string;
    color?: string;
    tags?: string[];
  }[];
  edges?: { source: string; target: string }[];
  links?: { source: string; target: string }[];
};

const ISOLATE_SPAWN_SPAN = 24;

export function nodeId(node: string | GraphNode3D) {
  return typeof node === "string" ? node : node.id;
}

export function isIsolated(id: string, links: GraphLink3D[]) {
  return !links.some(
    (link) => nodeId(link.source) === id || nodeId(link.target) === id,
  );
}

export function assignGroups(graph: GraphInput): {
  nodes: GraphNode3D[];
  links: GraphLink3D[];
} {
  const links = (graph.edges ?? graph.links ?? []).map((link) => ({
    source: link.source,
    target: link.target,
  }));
  const adjacent = new Map<string, string[]>();
  for (const node of graph.nodes) adjacent.set(node.id, []);
  for (const link of links) {
    adjacent.get(nodeId(link.source))?.push(nodeId(link.target));
    adjacent.get(nodeId(link.target))?.push(nodeId(link.source));
  }

  const groupOf = new Map<string, number | null>();
  const visited = new Set<string>();
  let nextGroup = 0;

  for (const node of graph.nodes) {
    if (visited.has(node.id)) continue;
    if ((adjacent.get(node.id)?.length ?? 0) === 0) {
      groupOf.set(node.id, null);
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

    const group = nextGroup;
    nextGroup += 1;
    for (const id of component) groupOf.set(id, group);
  }

  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      group: groupOf.get(node.id) ?? null,
      name: node.name ?? node.title ?? node.id,
      href: node.href,
      color: node.color,
      tags: node.tags,
      isolated: (groupOf.get(node.id) ?? null) === null,
    })),
    links,
  };
}

export function mergeGraphData(
  current: { nodes: GraphNode3D[]; links: GraphLink3D[] },
  incoming: { nodes: GraphNode3D[]; links: GraphLink3D[] },
): { nodes: GraphNode3D[]; links: GraphLink3D[] } {
  const existingById = new Map(current.nodes.map((node) => [node.id, node]));
  const links = incoming.links.map((link) => ({
    source: nodeId(link.source),
    target: nodeId(link.target),
  }));

  const nodes = incoming.nodes.map((node) => {
    const existing = existingById.get(node.id);
    if (existing) {
      existing.group = node.group;
      existing.name = node.name;
      existing.href = node.href ?? existing.href;
      existing.color = node.color ?? existing.color;
      existing.tags = node.tags ?? existing.tags;
      existing.isolated = isIsolated(existing.id, links);
      return existing;
    }

    const next: GraphNode3D = { ...node };
    placeNewNode(next, links, existingById);
    next.isolated = isIsolated(next.id, links);
    return next;
  });

  return { nodes, links };
}

function placeNewNode(
  node: GraphNode3D,
  links: GraphLink3D[],
  existingById: Map<string, GraphNode3D>,
) {
  const neighbors = links
    .flatMap((link) => {
      const source = nodeId(link.source);
      const target = nodeId(link.target);
      if (source === node.id) return [target];
      if (target === node.id) return [source];
      return [];
    })
    .map((id) => existingById.get(id))
    .filter((item): item is GraphNode3D => Boolean(item));

  if (neighbors.length) {
    node.x = mean(neighbors, "x");
    node.y = mean(neighbors, "y");
    node.z = mean(neighbors, "z");
    return;
  }

  node.x = jitter();
  node.y = jitter();
  node.z = jitter();
}

function mean(nodes: GraphNode3D[], axis: "x" | "y" | "z") {
  return nodes.reduce((sum, node) => sum + (node[axis] ?? 0), 0) / nodes.length;
}

function jitter() {
  return (Math.random() - 0.5) * ISOLATE_SPAWN_SPAN;
}
