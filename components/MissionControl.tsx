"use client";

import {
  chronoMissions,
  missionProgress,
  type MissionId,
} from "@/lib/chrono-missions";

export function MissionControl({
  completed,
  onLaunch,
}: {
  completed: readonly MissionId[];
  onLaunch: (destination: "web" | "chat" | "snake") => void;
}) {
  const progress = missionProgress(completed);

  return (
    <div className="mission-control">
      <header className="mission-header">
        <div>
          <p className="win-kicker">CHRONOCLIP GUIDED TOUR</p>
          <h2>First Night in 1998</h2>
          <p>Complete real actions across the desktop to certify your visit.</p>
        </div>
        <div className={`mission-seal ${progress.isComplete ? "complete" : ""}`}>
          <span>{progress.isComplete ? "✓" : `${progress.count}/${progress.total}`}</span>
          <strong>{progress.isComplete ? "CERTIFIED" : "IN PROGRESS"}</strong>
        </div>
      </header>

      <div
        className="mission-progress"
        role="progressbar"
        aria-label="Time traveler mission progress"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.count}
      >
        <span style={{ width: `${progress.percent}%` }} />
      </div>

      <ol className="mission-list">
        {chronoMissions.map((mission, index) => {
          const isComplete = completed.includes(mission.id);
          return (
            <li className={isComplete ? "complete" : ""} key={mission.id}>
              <span className="mission-check" aria-hidden="true">
                {isComplete ? "✓" : index + 1}
              </span>
              <div>
                <strong>{mission.title}</strong>
                <p>{mission.instruction}</p>
              </div>
              <button
                type="button"
                onClick={() => onLaunch(mission.destination)}
              >
                {isComplete ? "Revisit" : "Go"}
              </button>
            </li>
          );
        })}
      </ol>

      {progress.isComplete && (
        <div className="mission-certificate" role="status">
          <strong>Certified Time Traveler</strong>
          <span>Austin, Texas · December 4, 1998</span>
          <small>Session badge · fictional Chrono credential</small>
        </div>
      )}
    </div>
  );
}
