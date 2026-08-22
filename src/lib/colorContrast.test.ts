import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { contrastAgainst, lighten } from "./colorContrast";

describe("contrastAgainst", () => {
  test("returns dark text on light theme backgrounds", () => {
    assert.equal(contrastAgainst("#eff1f5"), "#0a0a0a");
    assert.equal(contrastAgainst("#fdf6e3"), "#0a0a0a");
    assert.equal(contrastAgainst("#ffffff"), "#0a0a0a");
  });

  test("returns light text on dark theme backgrounds", () => {
    assert.equal(contrastAgainst("#1e1e2e"), "#f5f5f5");
    assert.equal(contrastAgainst("#000b1e"), "#f5f5f5");
    assert.equal(contrastAgainst("rgb(30, 30, 46)"), "#f5f5f5");
  });
});

describe("lighten", () => {
  test("mixes a color toward white", () => {
    assert.equal(lighten("#000000", 0.5), "#808080");
    assert.equal(lighten("#89b4fa", 0), "#89b4fa");
  });
});
