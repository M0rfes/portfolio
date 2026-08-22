import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  assignGroups,
  isIsolated,
  mergeGraphData,
  nodeId,
  type GraphNode3D,
} from "./forceGraphData";

describe("assignGroups", () => {
  test("assigns distinct groups to two connected clusters and null to isolates", () => {
    const { nodes, links } = assignGroups({
      nodes: [
        { id: "a", title: "A" },
        { id: "b", title: "B" },
        { id: "c", title: "C" },
        { id: "d", title: "D" },
        { id: "orphan", title: "Orphan" },
      ],
      edges: [
        { source: "a", target: "b" },
        { source: "c", target: "d" },
      ],
    });

    const byId = new Map(nodes.map((node) => [node.id, node]));
    assert.equal(byId.get("a")?.group, byId.get("b")?.group);
    assert.equal(byId.get("c")?.group, byId.get("d")?.group);
    assert.notEqual(byId.get("a")?.group, byId.get("c")?.group);
    assert.equal(byId.get("orphan")?.group, null);
    assert.equal(byId.get("orphan")?.isolated, true);
    assert.equal(byId.get("a")?.name, "A");
    assert.deepEqual(
      assignGroups({
        nodes: [{ id: "a", title: "A", tags: ["rust"] }],
        edges: [],
      }).nodes[0].tags,
      ["rust"],
    );
    assert.deepEqual(links, [
      { source: "a", target: "b" },
      { source: "c", target: "d" },
    ]);
  });
});

describe("isIsolated", () => {
  test("is true when a node has no incident links", () => {
    assert.equal(isIsolated("x", [{ source: "a", target: "b" }]), true);
    assert.equal(isIsolated("a", [{ source: "a", target: "b" }]), false);
  });
});

describe("nodeId", () => {
  test("reads an id from a string or node object", () => {
    assert.equal(nodeId("alpha"), "alpha");
    assert.equal(nodeId({ id: "beta", group: 0, name: "Beta" }), "beta");
  });
});

describe("mergeGraphData", () => {
  test("reuses existing node objects so positions survive an update", () => {
    const existing: GraphNode3D = {
      id: "keep",
      group: 0,
      name: "Keep",
      x: 10,
      y: 20,
      z: 30,
    };
    const merged = mergeGraphData(
      { nodes: [existing], links: [] },
      {
        nodes: [{ id: "keep", group: 1, name: "Keep v2" }],
        links: [],
      },
    );

    assert.equal(merged.nodes[0], existing);
    assert.equal(existing.x, 10);
    assert.equal(existing.y, 20);
    assert.equal(existing.z, 30);
    assert.equal(existing.group, 1);
    assert.equal(existing.name, "Keep v2");
  });

  test("spawns a linked node beside its neighbor", () => {
    const neighbor: GraphNode3D = {
      id: "hub",
      group: 0,
      name: "Hub",
      x: 100,
      y: -40,
      z: 16,
    };
    const merged = mergeGraphData(
      { nodes: [neighbor], links: [] },
      {
        nodes: [neighbor, { id: "spoke", group: 0, name: "Spoke" }],
        links: [{ source: "hub", target: "spoke" }],
      },
    );

    const spoke = merged.nodes.find((node) => node.id === "spoke");
    assert.ok(spoke);
    assert.equal(spoke.x, 100);
    assert.equal(spoke.y, -40);
    assert.equal(spoke.z, 16);
  });

  test("spawns an isolated node near the origin", () => {
    const merged = mergeGraphData(
      { nodes: [], links: [] },
      {
        nodes: [{ id: "lone", group: null, name: "Lone" }],
        links: [],
      },
    );

    const lone = merged.nodes[0];
    assert.ok(lone.x != null && Math.abs(lone.x) <= 24);
    assert.ok(lone.y != null && Math.abs(lone.y) <= 24);
    assert.ok(lone.z != null && Math.abs(lone.z) <= 24);
    assert.equal(lone.isolated, true);
  });
});
