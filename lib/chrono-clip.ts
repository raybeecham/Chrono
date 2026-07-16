export type ChronoClipContext =
  | "welcome"
  | "time-capsule"
  | "web"
  | "chat"
  | "snake"
  | "missions"
  | "inbox"
  | "player"
  | "buddies"
  | "about"
  | "secret"
  | null;

type AlertClassification = "probable" | "definite";

const contextualTips: Record<Exclude<ChronoClipContext, null>, readonly string[]> = {
  welcome: [
    "Welcome to 1998! Try the Time Capsule for sourced context, or open Talk to Sam to meet your host.",
    "It looks like you’re exploring history. I can point things out without bending the timeline.",
  ],
  "time-capsule": [
    "Look for Documented, Representative, and Fictional labels—they tell you how each detail is grounded.",
    "Select a source count on a fact card to inspect the evidence behind it.",
  ],
  web: [
    "It looks like you’re browsing the World Wide Web! The NASA shuttle link is live on this date.",
    "Try the directory first. Search engines in 1998 still have plenty of competition.",
    "Archive Lens steps outside the reconstruction so you can compare it with real Wayback Machine captures.",
  ],
  chat: [
    "Sam only knows what a teenager could know on December 4, 1998. Future words may disturb the timeline.",
    "Try asking Sam about websites, games, music, school, or what he plans to do this weekend.",
  ],
  snake: [
    "Need help feeding the snake? Red pixels are generally considered edible.",
    "Use the arrow keys or direction pad. The snake speeds up as your score climbs.",
  ],
  missions: [
    "Complete each real desktop action to earn your Certified Time Traveler session badge.",
    "Mission Control tracks ChronoNet visits, messages to Sam, Snake pixels, and integrity events automatically.",
  ],
  inbox: [
    "You’ve got mail! Labels separate representative period details from fictional messages.",
    "Open the Y2K message for a taste of the computer worries circulating in late 1998.",
  ],
  player: [
    "ChronoAmp uses original synthesized tracker loops—no copied songs or recordings.",
    "Pick a track, press Play, and watch the tiny spectrum display do its best.",
  ],
  buddies: [
    "Buddy lists and away messages made online presence feel strangely exciting.",
    "These contacts are fictional. Sam is the only buddy connected to the temporal relay.",
  ],
  about: [
    "Chrono separates sourced history, representative reconstruction, and fictional atmosphere.",
    "I’m ChronoClip—an original fictional helper inspired by late-1990s desktop assistants.",
  ],
  secret: [
    "You found the Developer Vault. The best interfaces reward a little curiosity.",
    "There may be another secret hiding in a famous sequence of arrow keys.",
  ],
};

const desktopTips = [
  "Select a desktop icon to begin. You can minimize a window and reopen it from the taskbar.",
  "I’ll stay down here if you need me. Select my taskbar button to hide or reopen me.",
] as const;

export function getChronoClipTips({
  context,
  integrity,
  alertClassification,
  alertMessage,
}: {
  context: ChronoClipContext;
  integrity: number;
  alertClassification?: AlertClassification;
  alertMessage?: string;
}): readonly string[] {
  if (alertClassification && alertMessage) {
    return [
      alertClassification === "definite"
        ? `Whoops! That sounds like definite future knowledge. ${alertMessage}`
        : `That phrase may be ahead of its time. ${alertMessage}`,
      "Try rephrasing the question using only ideas that existed by December 4, 1998.",
    ];
  }

  const tips = context ? contextualTips[context] : desktopTips;

  if (integrity < 100) {
    return [
      tips[0],
      `Timeline integrity is ${integrity}%. Previously logged future concepts will not reduce it twice.`,
      ...tips.slice(1),
    ];
  }

  return tips;
}
