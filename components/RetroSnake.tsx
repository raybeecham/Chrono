"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  advanceSnake,
  findNextSnakeFood,
  resolveSnakeDirection,
  type SnakeDirection,
  type SnakePoint,
} from "@/lib/retro-snake";

const BOARD_WIDTH = 18;
const BOARD_HEIGHT = 13;
const INITIAL_SNAKE: SnakePoint[] = [
  { x: 7, y: 6 },
  { x: 6, y: 6 },
  { x: 5, y: 6 },
];
const INITIAL_FOOD: SnakePoint = { x: 12, y: 6 };

type GameStatus = "ready" | "running" | "paused" | "game-over" | "won";

const keyDirections: Record<string, SnakeDirection | undefined> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

function cellKey(point: SnakePoint) {
  return `${point.x}:${point.y}`;
}

function statusCopy(
  status: GameStatus,
  score: number,
  length: number,
  head?: SnakePoint,
) {
  switch (status) {
    case "running":
      return `Game running. Score ${score}. Length ${length}. Snake head at column ${(head?.x ?? 0) + 1}, row ${(head?.y ?? 0) + 1}.`;
    case "paused":
      return `Game paused at ${score} points with a length of ${length}.`;
    case "game-over":
      return `Game over. Final score ${score}. Select Play again to restart.`;
    case "won":
      return `Perfect game. You filled the board with a score of ${score}.`;
    default:
      return "Ready. Select Start, then use the arrow keys or W A S D.";
  }
}

export function RetroSnake({
  isActive = true,
  onFoodCollected,
}: {
  isActive?: boolean;
  onFoodCollected?: () => void;
}) {
  const [snake, setSnake] = useState<SnakePoint[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<SnakePoint>(INITIAL_FOOD);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const directionRef = useRef<SnakeDirection>("right");
  const queuedDirectionRef = useRef<SnakeDirection>("right");
  const snakeRef = useRef<SnakePoint[]>(INITIAL_SNAKE);
  const foodRef = useRef<SnakePoint>(INITIAL_FOOD);
  const scoreRef = useRef(0);
  const onFoodCollectedRef = useRef(onFoodCollected);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onFoodCollectedRef.current = onFoodCollected;
  }, [onFoodCollected]);

  const snakeCells = useMemo(
    () => new Set(snake.map((segment) => cellKey(segment))),
    [snake],
  );
  const headKey = snake[0] ? cellKey(snake[0]) : "";

  function queueDirection(requested: SnakeDirection) {
    queuedDirectionRef.current = resolveSnakeDirection(
      directionRef.current,
      requested,
    );
  }

  function resetGame(startImmediately = false) {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setScore(0);
    setStatus(startImmediately ? "running" : "ready");
    directionRef.current = "right";
    queuedDirectionRef.current = "right";
    snakeRef.current = INITIAL_SNAKE;
    foodRef.current = INITIAL_FOOD;
    scoreRef.current = 0;
    window.requestAnimationFrame(() => boardRef.current?.focus());
  }

  function startOrResume() {
    if (status === "game-over" || status === "won") {
      resetGame(true);
      return;
    }

    setStatus("running");
    window.requestAnimationFrame(() => boardRef.current?.focus());
  }

  function togglePause() {
    setStatus((current) => (current === "running" ? "paused" : "running"));
    window.requestAnimationFrame(() => boardRef.current?.focus());
  }

  useEffect(() => {
    if (isActive || status !== "running") return;

    const timer = window.setTimeout(() => setStatus("paused"), 0);
    return () => window.clearTimeout(timer);
  }, [isActive, status]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setStatus((current) => (current === "running" ? "paused" : current));
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (status !== "running") return;

    const speed = Math.max(75, 165 - Math.floor(score / 30) * 12);
    const timer = window.setInterval(() => {
      const nextDirection = queuedDirectionRef.current;
      directionRef.current = nextDirection;
      const result = advanceSnake(
        snakeRef.current,
        nextDirection,
        foodRef.current,
        BOARD_WIDTH,
        BOARD_HEIGHT,
      );
      snakeRef.current = result.snake;
      setSnake(result.snake);

      if (result.status === "game-over") {
        setStatus("game-over");
        setBestScore((current) => Math.max(current, scoreRef.current));
        return;
      }

      if (result.ateFood) {
        onFoodCollectedRef.current?.();
        const nextScore = scoreRef.current + 10;
        scoreRef.current = nextScore;
        setScore(nextScore);
        setBestScore((current) => Math.max(current, nextScore));

        const nextFood = findNextSnakeFood(
          result.snake,
          BOARD_WIDTH,
          BOARD_HEIGHT,
          nextScore,
        );
        if (!nextFood || result.status === "won") {
          setStatus("won");
        } else {
          foodRef.current = nextFood;
          setFood(nextFood);
        }
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [score, status]);

  return (
    <div className="snake-game">
      <header className="snake-game-header">
        <div>
          <p className="win-kicker">PERIOD-STYLE ARCADE RECREATION</p>
          <h2>Snake &apos;98</h2>
          <p>
            Chase the red pixel, grow longer, and avoid the walls and your own
            trail. Simple rules; dangerously effective procrastination.
          </p>
        </div>
        <dl className="snake-scoreboard" aria-label="Snake score">
          <div>
            <dt>Score</dt>
            <dd>{score.toString().padStart(4, "0")}</dd>
          </div>
          <div>
            <dt>Best</dt>
            <dd>{bestScore.toString().padStart(4, "0")}</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{snake.length}</dd>
          </div>
          <div>
            <dt>Speed</dt>
            <dd>{1 + Math.floor(score / 30)}</dd>
          </div>
        </dl>
      </header>

      <div className="snake-console">
        <div
          className="snake-board-shell"
          ref={boardRef}
          role="group"
          aria-label="Snake game board"
          aria-describedby="snake-instructions snake-live-status"
          tabIndex={0}
          onKeyDown={(event) => {
            const requestedDirection = keyDirections[event.key];
            if (requestedDirection) {
              event.preventDefault();
              queueDirection(requestedDirection);
              if (status === "ready") setStatus("running");
              return;
            }

            if (event.key.toLowerCase() === "p") {
              event.preventDefault();
              if (status === "running" || status === "paused") togglePause();
            }
          }}
        >
          <div
            className={`snake-board ${status === "game-over" ? "game-over" : ""}`}
            aria-hidden="true"
            style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}
          >
            {Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, (_, index) => {
              const point = {
                x: index % BOARD_WIDTH,
                y: Math.floor(index / BOARD_WIDTH),
              };
              const key = cellKey(point);
              const isSnake = snakeCells.has(key);
              const isHead = key === headKey;
              const isFood = key === cellKey(food);

              return (
                <span
                  className={`${isSnake ? "snake-pixel" : ""}${isHead ? " snake-head" : ""}${isFood ? " snake-food" : ""}`}
                  key={key}
                />
              );
            })}
          </div>
          {(status === "ready" ||
            status === "paused" ||
            status === "game-over" ||
            status === "won") && (
            <div className={`snake-overlay ${status}`} aria-hidden="true">
              <strong>
                {status === "ready"
                  ? "READY?"
                  : status === "paused"
                    ? "PAUSED"
                    : status === "won"
                      ? "PERFECT!"
                      : "GAME OVER"}
              </strong>
              <span>
                {status === "game-over" || status === "won"
                  ? `SCORE ${score}`
                  : "ARROWS / W A S D"}
              </span>
            </div>
          )}
        </div>

        <aside className="snake-controls" aria-label="Snake controls">
          <div className="snake-dpad">
            <span />
            <button type="button" aria-label="Move up" onClick={() => queueDirection("up")}>
              ▲
            </button>
            <span />
            <button type="button" aria-label="Move left" onClick={() => queueDirection("left")}>
              ◀
            </button>
            <span className="snake-dpad-center" aria-hidden="true" />
            <button type="button" aria-label="Move right" onClick={() => queueDirection("right")}>
              ▶
            </button>
            <span />
            <button type="button" aria-label="Move down" onClick={() => queueDirection("down")}>
              ▼
            </button>
            <span />
          </div>

          <div className="snake-action-buttons">
            <button type="button" onClick={startOrResume} disabled={status === "running"}>
              {status === "game-over" || status === "won"
                ? "Play again"
                : status === "paused"
                  ? "Resume"
                  : "Start"}
            </button>
            <button
              type="button"
              onClick={togglePause}
              disabled={status !== "running"}
            >
              Pause
            </button>
            <button type="button" onClick={() => resetGame(false)}>
              Reset
            </button>
          </div>
        </aside>
      </div>

      <p className="snake-instructions" id="snake-instructions">
        Keyboard: arrow keys or W A S D. Press P to pause. Touch and mouse
        controls are on the right.
      </p>
      <p className="sr-only" id="snake-live-status" aria-live="polite">
        {statusCopy(status, score, snake.length, snake[0])}
      </p>
      <footer className="snake-period-note">
        <strong>Why it belongs:</strong> a tiny grid, instant controls, and
        score chasing fit naturally beside the late-1990s desktop experience.
        This Chrono version is a clearly labeled recreation.
      </footer>
    </div>
  );
}

export default RetroSnake;
