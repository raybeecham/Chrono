"use client";

import { useState } from "react";

import { ChronoClipContext, getChronoClipTips } from "@/lib/chrono-clip";

export function ChronoClip({
  context,
  integrity,
  alertClassification,
  alertMessage,
  isOpen,
  onClose,
}: {
  context: ChronoClipContext;
  integrity: number;
  alertClassification?: "probable" | "definite";
  alertMessage?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = getChronoClipTips({
    context,
    integrity,
    alertClassification,
    alertMessage,
  });
  const tip = tips[tipIndex % tips.length];

  if (!isOpen) return null;

  return (
    <aside
      className={`chrono-clip ${alertMessage ? "has-alert" : ""}`}
      aria-label="ChronoClip desktop helper"
    >
      <div
        className="chrono-clip-bubble"
        role={alertMessage ? "alert" : "status"}
        aria-live={alertMessage ? "assertive" : "polite"}
      >
        <div className="chrono-clip-titlebar">
          <strong>ChronoClip says:</strong>
          <button type="button" onClick={onClose} aria-label="Hide ChronoClip">
            ×
          </button>
        </div>
        <p>{tip}</p>
        <div className="chrono-clip-actions">
          <button
            type="button"
            onClick={() => setTipIndex((current) => current + 1)}
          >
            Next tip
          </button>
          <small>Fictional Chrono helper</small>
        </div>
      </div>
      <div className="chrono-clip-character" aria-hidden="true">
        <div className="chrono-clip-wire" />
        <div className="chrono-clip-face">
          <span />
          <span />
        </div>
        <div className="chrono-clip-smile" />
      </div>
    </aside>
  );
}
