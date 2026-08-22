import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { uniqueSortedTags } from "./tags";

describe("uniqueSortedTags", () => {
  test("dedupes, trims, and sorts", () => {
    assert.deepEqual(
      uniqueSortedTags([[" concurrency", "locks"], ["locks", ""], ["rust"]]),
      ["concurrency", "locks", "rust"],
    );
  });
});
