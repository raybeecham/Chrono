export type MissionId = "nasa" | "geocities" | "chat" | "snake" | "future";

export const chronoMissions: ReadonlyArray<{
  id: MissionId;
  title: string;
  instruction: string;
  destination: "web" | "chat" | "snake";
}> = [
  {
    id: "nasa",
    title: "Witness history",
    instruction: "Open ChronoNet and visit the NASA STS-88 mission page.",
    destination: "web",
  },
  {
    id: "geocities",
    title: "Meet the early web",
    instruction: "Find Sam’s fictional GeoCities homepage.",
    destination: "web",
  },
  {
    id: "chat",
    title: "Talk to a local",
    instruction: "Send Sam at least one question about life in 1998.",
    destination: "chat",
  },
  {
    id: "snake",
    title: "Take a pixel break",
    instruction: "Collect one red pixel in Snake ’98.",
    destination: "snake",
  },
  {
    id: "future",
    title: "Test the timeline",
    instruction: "Mention future knowledge and observe the integrity response.",
    destination: "chat",
  },
];

export function missionProgress(completed: readonly MissionId[]) {
  const completedIds = new Set(completed);
  const count = chronoMissions.filter((mission) =>
    completedIds.has(mission.id),
  ).length;

  return {
    count,
    total: chronoMissions.length,
    percent: Math.round((count / chronoMissions.length) * 100),
    isComplete: count === chronoMissions.length,
  };
}
