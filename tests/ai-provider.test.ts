import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/ai-provider.ts", import.meta.url);
const { selectAIProvider } = (await import(
  moduleUrl.href
)) as typeof import("../lib/ai-provider");

test("auto mode prefers a configured Gemini free-tier key", () => {
  assert.equal(
    selectAIProvider({ geminiKey: "gemini", openAIKey: "openai" }),
    "gemini",
  );
});

test("auto mode can retain OpenAI as an optional configured provider", () => {
  assert.equal(selectAIProvider({ openAIKey: "openai" }), "openai");
});

test("an explicit provider never silently spends through another provider", () => {
  assert.equal(
    selectAIProvider({ preference: "gemini", openAIKey: "openai" }),
    null,
  );
  assert.equal(
    selectAIProvider({ preference: "openai", geminiKey: "gemini" }),
    null,
  );
});

test("missing and whitespace-only keys keep deterministic mode active", () => {
  assert.equal(
    selectAIProvider({ geminiKey: "  ", openAIKey: "" }),
    null,
  );
});
