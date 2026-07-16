export type SnakeDirection = "up" | "down" | "left" | "right";

export type SnakePoint = Readonly<{
  x: number;
  y: number;
}>;

export type SnakeMoveResult = {
  snake: SnakePoint[];
  status: "running" | "game-over" | "won";
  ateFood: boolean;
};

const directionVectors: Record<SnakeDirection, SnakePoint> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const oppositeDirections: Record<SnakeDirection, SnakeDirection> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function pointsMatch(left: SnakePoint, right: SnakePoint) {
  return left.x === right.x && left.y === right.y;
}

export function resolveSnakeDirection(
  current: SnakeDirection,
  requested: SnakeDirection,
): SnakeDirection {
  return oppositeDirections[current] === requested ? current : requested;
}

export function advanceSnake(
  snake: readonly SnakePoint[],
  direction: SnakeDirection,
  food: SnakePoint,
  width: number,
  height: number,
): SnakeMoveResult {
  const head = snake[0];
  if (!head || width <= 0 || height <= 0) {
    return { snake: [...snake], status: "game-over", ateFood: false };
  }

  const vector = directionVectors[direction];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
  const hitWall =
    nextHead.x < 0 ||
    nextHead.x >= width ||
    nextHead.y < 0 ||
    nextHead.y >= height;

  if (hitWall) {
    return { snake: [...snake], status: "game-over", ateFood: false };
  }

  const ateFood = pointsMatch(nextHead, food);
  const collisionBody = ateFood ? snake : snake.slice(0, -1);
  if (collisionBody.some((segment) => pointsMatch(segment, nextHead))) {
    return { snake: [...snake], status: "game-over", ateFood: false };
  }

  const nextSnake = [nextHead, ...snake];
  if (!ateFood) nextSnake.pop();

  return {
    snake: nextSnake,
    status: nextSnake.length === width * height ? "won" : "running",
    ateFood,
  };
}

export function findNextSnakeFood(
  snake: readonly SnakePoint[],
  width: number,
  height: number,
  seed: number,
): SnakePoint | null {
  const cellCount = width * height;
  if (cellCount <= 0 || snake.length >= cellCount) return null;

  const occupied = new Set(snake.map((segment) => `${segment.x}:${segment.y}`));
  const startingIndex = Math.abs(seed * 37 + 11) % cellCount;

  for (let offset = 0; offset < cellCount; offset += 1) {
    const index = (startingIndex + offset) % cellCount;
    const candidate = {
      x: index % width,
      y: Math.floor(index / width),
    };

    if (!occupied.has(`${candidate.x}:${candidate.y}`)) return candidate;
  }

  return null;
}
