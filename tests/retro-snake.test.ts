import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../lib/retro-snake.ts", import.meta.url);
const {
  advanceSnake,
  findNextSnakeFood,
  resolveSnakeDirection,
} = (await import(moduleUrl.href)) as typeof import("../lib/retro-snake");

test("snake cannot reverse directly into itself", () => {
  assert.equal(resolveSnakeDirection("right", "left"), "right");
  assert.equal(resolveSnakeDirection("right", "up"), "up");
});

test("snake advances one cell while preserving length", () => {
  const result = advanceSnake(
    [
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
    "right",
    { x: 4, y: 1 },
    6,
    4,
  );

  assert.deepEqual(result.snake, [
    { x: 3, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ]);
  assert.equal(result.ateFood, false);
  assert.equal(result.status, "running");
});

test("eating food grows the snake", () => {
  const eaten = advanceSnake(
    [
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    "right",
    { x: 3, y: 1 },
    6,
    4,
  );
  const moved = advanceSnake(
    eaten.snake,
    "right",
    { x: 5, y: 3 },
    6,
    4,
  );

  assert.equal(eaten.snake.length, 3);
  assert.equal(eaten.ateFood, true);
  assert.equal(moved.snake.length, 3);
});

test("walls and the snake body end the game", () => {
  const wall = advanceSnake(
    [{ x: 0, y: 0 }],
    "left",
    { x: 2, y: 2 },
    4,
    4,
  );
  const body = advanceSnake(
    [
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
    ],
    "left",
    { x: 3, y: 3 },
    5,
    5,
  );

  assert.equal(wall.status, "game-over");
  assert.equal(body.status, "game-over");
});

test("food placement is deterministic and never overlaps the snake", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];
  const first = findNextSnakeFood(snake, 4, 4, 20);
  const second = findNextSnakeFood(snake, 4, 4, 20);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(snake.some((segment) => segment.x === first.x && segment.y === first.y), false);
});
