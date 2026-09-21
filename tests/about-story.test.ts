import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/about/AboutScrollStory.tsx", import.meta.url),
  "utf8"
);

test("uses one About story surface for every motion preference", () => {
  assert.equal(source.match(/<video/g)?.length, 1);
  assert.doesNotMatch(source, /motion-reduce:(?:hidden|grid)/);
});
