"use client";

import { useEffect } from "react";

const flyers = Array.from({ length: 14 }, (_, index) => ({
  left: `${(index * 37 + 9) % 88}%`,
  top: `${(index * 53 + 6) % 82}%`,
  delay: `${(index % 7) * -0.7}s`,
  duration: `${4.8 + (index % 5) * 0.55}s`,
}));

export function RetroScreensaver({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    function handleKeyDown() {
      onExit();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  return (
    <div
      className="retro-screensaver"
      role="dialog"
      aria-label="Chrono flying clocks screensaver"
      onClick={onExit}
    >
      <div className="screensaver-stars" aria-hidden="true" />
      {flyers.map((flyer, index) => (
        <div
          className="screensaver-flyer"
          key={index}
          style={{
            left: flyer.left,
            top: flyer.top,
            animationDelay: flyer.delay,
            animationDuration: flyer.duration,
          }}
          aria-hidden="true"
        >
          <span>◴</span><strong>1998</strong>
        </div>
      ))}
      <p>Flying Through Time</p>
      <button type="button" onClick={onExit}>Move, click, or press a key to exit</button>
    </div>
  );
}
