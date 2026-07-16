import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/chrono-missions.ts", import.meta.url);
const { chronoMissions, missionProgress } = (await import(
  moduleUrl.href
)) as typeof import("../lib/chrono-missions");

test("guided tour contains five unique action-based missions", () => {
  assert.equal(chronoMissions.length, 5);
  assert.equal(new Set(chronoMissions.map((mission) => mission.id)).size, 5);
  assert.deepEqual(
    new Set(chronoMissions.map((mission) => mission.destination)),
    new Set(["web", "chat", "snake"]),
  );
});

test("mission progress ignores duplicates and certifies all five actions", () => {
  assert.deepEqual(missionProgress(["nasa", "nasa", "chat"]), {
    count: 2,
    total: 5,
    percent: 40,
    isComplete: false,
  });

  assert.deepEqual(
    missionProgress(["nasa", "geocities", "chat", "snake", "future"]),
    { count: 5, total: 5, percent: 100, isComplete: true },
  );
});
