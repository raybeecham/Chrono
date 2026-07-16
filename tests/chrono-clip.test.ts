import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/chrono-clip.ts", import.meta.url);
const { getChronoClipTips } = (await import(moduleUrl.href)) as typeof import(
  "../lib/chrono-clip"
);

test("ChronoClip gives advice for the active desktop context", () => {
  const tips = getChronoClipTips({ context: "snake", integrity: 100 });

  assert.match(tips[0], /Red pixels/i);
});

test("ChronoClip prioritizes temporal alerts over ordinary tips", () => {
  const tips = getChronoClipTips({
    context: "chat",
    integrity: 92,
    alertClassification: "definite",
    alertMessage: "iPhone: This product has not been announced yet.",
  });

  assert.match(tips[0], /definite future knowledge/i);
  assert.match(tips[0], /iPhone/);
  assert.match(tips[1], /December 4, 1998/);
});

test("ChronoClip explains changed integrity without hiding contextual help", () => {
  const tips = getChronoClipTips({ context: "web", integrity: 97 });

  assert.match(tips[0], /World Wide Web/i);
  assert.match(tips[1], /97%/);
  assert.match(tips[1], /not reduce it twice/i);
});
