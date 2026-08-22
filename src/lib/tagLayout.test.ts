import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  nodeTagTarget,
  tagHome2d,
  tagHome3d,
  tagPullStrength,
} from "./tagLayout";

describe("tagHome2d", () => {
  test("is stable for the same tag", () => {
    assert.deepEqual(tagHome2d("concurrency"), tagHome2d("concurrency"));
  });

  test("places the tag on the ring", () => {
    const home = tagHome2d("rust", 100);
    assert.ok(Math.abs(Math.hypot(home.x, home.y) - 100) < 1e-9);
  });
});

describe("tagHome3d", () => {
  test("is stable for the same tag", () => {
    assert.deepEqual(tagHome3d("concurrency"), tagHome3d("concurrency"));
  });

  test("places the tag on the sphere", () => {
    const home = tagHome3d("rust", 100);
    assert.ok(Math.abs(Math.hypot(home.x, home.y, home.z) - 100) < 1e-9);
  });
});

describe("nodeTagTarget", () => {
  test("returns null when a note has no tags", () => {
    assert.equal(nodeTagTarget([], 2), null);
    assert.equal(nodeTagTarget(undefined, 3), null);
  });

  test("matches the tag home for a single tag", () => {
    assert.deepEqual(nodeTagTarget(["Rust"], 2), tagHome2d("rust"));
    assert.deepEqual(nodeTagTarget(["Rust"], 3), tagHome3d("rust"));
  });

  test("averages homes and ignores tag order", () => {
    const a = tagHome2d("concurrency");
    const b = tagHome2d("rust");
    const mid = {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    };
    assert.deepEqual(nodeTagTarget(["rust", "concurrency"], 2), mid);
    assert.deepEqual(nodeTagTarget(["concurrency", "rust"], 2), mid);
  });
});

describe("tagPullStrength", () => {
  test("is zero without tags and weak with tags", () => {
    assert.equal(tagPullStrength([]), 0);
    assert.ok(tagPullStrength(["rust"]) > 0);
    assert.ok(tagPullStrength(["rust"]) < 0.2);
  });
});
