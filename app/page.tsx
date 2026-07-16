"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { BuddyList } from "@/components/BuddyList";
import { ChronoAmp } from "@/components/ChronoAmp";
import { ChronoClip } from "@/components/ChronoClip";
import { ChronoWeb } from "@/components/ChronoWeb";
import { MissionControl } from "@/components/MissionControl";
import { RetroInbox } from "@/components/RetroInbox";
import { RetroScreensaver } from "@/components/RetroScreensaver";
import { RetroSnake } from "@/components/RetroSnake";
import { TimeCapsule } from "@/components/TimeCapsule";
import { chronoMissions, type MissionId } from "@/lib/chrono-missions";

type Stage = "landing" | "dialing" | "desktop";
type WindowId =
  | "welcome"
  | "time-capsule"
  | "web"
  | "chat"
  | "snake"
  | "missions"
  | "inbox"
  | "player"
  | "buddies"
  | "screensaver"
  | "about"
  | "secret";
type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  reply: string;
  contamination: boolean;
  classification: "harmless" | "probable" | "definite";
  integrityDelta: number;
  anachronism: string;
  explanation: string;
  conceptId: string;
  isRepeat: boolean;
  mode: "ai" | "demo";
  provider?: "gemini" | "openai";
  fallbackReason?: string;
};

type TemporalAlert = {
  classification: "probable" | "definite";
  message: string;
};

type ChatNotice = {
  tone: "offline" | "error";
  message: string;
  retryMessage?: string;
};

const demoPrompts = [
  "What websites do you use?",
  "What game should I buy?",
  "Could a phone run apps someday?",
  "Have you heard of an iPhone?",
];

const dialSequence = [
  { at: 180, line: "Initializing Chrono temporal modem..." },
  { at: 850, line: "Dialing Austin gateway: 512-555-0198" },
  { at: 2_250, line: "Remote carrier detected..." },
  { at: 3_650, line: "Negotiating connection at 56.0 kbps..." },
  { at: 5_150, line: "Synchronizing cultural context..." },
  { at: 6_350, line: "Connection established: DEC 04 1998" },
] as const;

const DIAL_COMPLETE_AT = 7_150;

const desktopApps: Array<{
  id: WindowId;
  label: string;
  icon: string;
}> = [
  { id: "time-capsule", label: "Time Capsule", icon: "⌛" },
  { id: "web", label: "The Internet", icon: "🌐" },
  { id: "chat", label: "Talk to Sam", icon: "💬" },
  { id: "snake", label: "Snake '98", icon: "🐍" },
  { id: "missions", label: "Time Missions", icon: "✅" },
  { id: "inbox", label: "Inbox '98", icon: "📨" },
  { id: "player", label: "ChronoAmp", icon: "💿" },
  { id: "buddies", label: "Buddy List", icon: "⚡" },
  { id: "screensaver", label: "Screen Saver", icon: "🌠" },
  { id: "about", label: "About Chrono", icon: "🕰️" },
];

const secretDesktopApp = {
  id: "secret" as const,
  label: "Dev Vault",
  icon: "📁",
};

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

function playDialUpHandshake(): (() => void) | undefined {
  if (typeof window === "undefined") return undefined;

  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return undefined;

  const context = new AudioContextClass();
  const output = context.createGain();
  const startAt = context.currentTime;
  output.gain.setValueAtTime(0.62, startAt);
  output.connect(context.destination);

  function addTone(
    frequency: number,
    start: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
  ) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt + start);
    gain.gain.setValueAtTime(0.0001, startAt + start);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + start + 0.015);
    gain.gain.setValueAtTime(volume, startAt + start + duration - 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startAt + start + duration,
    );

    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(startAt + start);
    oscillator.stop(startAt + start + duration);
  }

  // Dial tone, followed by the DTMF pairs for 512-555-0198.
  addTone(350, 0.02, 0.58, 0.034);
  addTone(440, 0.02, 0.58, 0.034);

  const dtmf: Record<string, readonly [number, number]> = {
    "0": [941, 1336],
    "1": [697, 1209],
    "2": [697, 1336],
    "5": [770, 1336],
    "8": [852, 1336],
    "9": [852, 1477],
  };
  "5125550198".split("").forEach((digit, index) => {
    const pair = dtmf[digit];
    const digitStart = 0.7 + index * 0.13;
    addTone(pair[0], digitStart, 0.085, 0.035);
    addTone(pair[1], digitStart, 0.085, 0.035);
  });

  // A deterministic carrier exchange layered over low-volume line noise.
  const carrierFrequencies = [
    1180, 980, 1420, 1820, 2250, 1650, 2450, 1320, 2050, 2760, 1540, 2320,
    1880, 2580, 1140, 2180, 1480, 2680,
  ];
  carrierFrequencies.forEach((frequency, index) => {
    addTone(
      frequency,
      2.18 + index * 0.2,
      0.16,
      index % 4 === 0 ? 0.052 : 0.032,
      index % 3 === 0 ? "square" : "sine",
    );
  });
  addTone(2100, 5.82, 0.5, 0.024, "sine");
  addTone(680, 6.28, 0.23, 0.035, "triangle");
  addTone(880, 6.56, 0.16, 0.032, "sine");

  const noiseBuffer = context.createBuffer(
    1,
    Math.floor(context.sampleRate * 4.15),
    context.sampleRate,
  );
  const noiseData = noiseBuffer.getChannelData(0);
  for (let index = 0; index < noiseData.length; index += 1) {
    noiseData[index] = Math.random() * 2 - 1;
  }

  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noise.buffer = noiseBuffer;
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(1_850, startAt + 2.05);
  noiseFilter.Q.setValueAtTime(0.7, startAt + 2.05);
  noiseGain.gain.setValueAtTime(0.0001, startAt + 2.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.026, startAt + 2.2);
  noiseGain.gain.setValueAtTime(0.018, startAt + 5.85);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 6.2);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(output);
  noise.start(startAt + 2.05);
  noise.stop(startAt + 6.2);

  void context.resume();

  let stopped = false;
  let closeTimer = 0;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(closeTimer);
    if (context.state !== "closed") void context.close();
  };
  closeTimer = window.setTimeout(stop, DIAL_COMPLETE_AT + 250);

  return stop;
}

function formatClock() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function WindowFrame({
  title,
  icon,
  children,
  isMinimized,
  onMinimize,
  onClose,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <section
      className={`win-window ${isMaximized ? "maximized" : ""}`}
      aria-label={title}
      tabIndex={-1}
      hidden={isMinimized}
    >
      <header className="win-titlebar">
        <div className="win-titlebar-label">
          <span aria-hidden="true">{icon}</span>
          <strong>{title}</strong>
        </div>
        <div className="win-controls" aria-label="Window controls">
          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${title}`}
          >
            _
          </button>
          <button
            type="button"
            onClick={() => setIsMaximized((value) => !value)}
            aria-label={`${isMaximized ? "Restore" : "Maximize"} ${title}`}
            aria-pressed={isMaximized}
          >
            □
          </button>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`}>
            ×
          </button>
        </div>
      </header>
      <div className="win-menubar" aria-hidden="true">
        File&nbsp;&nbsp; Edit&nbsp;&nbsp; View&nbsp;&nbsp; Help
      </div>
      <div className="win-content">{children}</div>
    </section>
  );
}

function IntegrityMeter({ integrity }: { integrity: number }) {
  const status =
    integrity >= 90 ? "Stable" : integrity >= 70 ? "Drifting" : "Diverging";

  return (
    <div className="integrity-panel" aria-label={`Timeline integrity ${integrity}%`}>
      <div className="integrity-copy">
        <span>Timeline integrity</span>
        <strong>{integrity}%</strong>
      </div>
      <div className="integrity-track" aria-hidden="true">
        <span style={{ width: `${integrity}%` }} />
      </div>
      <small>{status}</small>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("landing");
  const [activeWindow, setActiveWindow] = useState<WindowId | null>("welcome");
  const [minimizedWindow, setMinimizedWindow] = useState<WindowId | null>(null);
  const [dialStep, setDialStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isChronoClipOpen, setIsChronoClipOpen] = useState(true);
  const [completedMissions, setCompletedMissions] = useState<MissionId[]>([]);
  const [missionNotice, setMissionNotice] = useState("");
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState("");
  const [integrity, setIntegrity] = useState(100);
  const [temporalAlert, setTemporalAlert] = useState<TemporalAlert | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"checking" | "ai" | "demo">(
    "checking",
  );
  const [chatProvider, setChatProvider] = useState<"gemini" | "openai" | null>(
    null,
  );
  const [chatNotice, setChatNotice] = useState<ChatNotice | null>(null);
  const [seenConcepts, setSeenConcepts] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, I’m Sam. It’s December 4, 1998, and I’m supposed to be doing homework. What do you want to know?",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const dialAudioStopRef = useRef<(() => void) | null>(null);
  const konamiIndexRef = useRef(0);
  const clockClickRef = useRef(0);
  const lastWindowOpenerRef = useRef<HTMLElement | null>(null);
  const desktopIconRefs = useRef<
    Partial<Record<WindowId, HTMLButtonElement | null>>
  >({});
  const [currentClock, setCurrentClock] = useState(formatClock);
  const taskWindow = activeWindow ?? minimizedWindow;
  const activeDesktopApps = secretUnlocked
    ? [...desktopApps, secretDesktopApp]
    : desktopApps;

  function completeMission(id: MissionId) {
    if (completedMissions.includes(id)) return;
    const mission = chronoMissions.find((entry) => entry.id === id);
    const nextCount = completedMissions.length + 1;
    setCompletedMissions((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setMissionNotice(
      nextCount === chronoMissions.length
        ? "All missions complete — Certified Time Traveler unlocked!"
        : `Mission complete: ${mission?.title ?? "Timeline action"}`,
    );
  }

  function unlockSecret(message: string) {
    setSecretUnlocked(true);
    setEasterEggMessage(message);
    setIsChronoClipOpen(true);
  }

  function handleClockClick() {
    clockClickRef.current += 1;
    if (clockClickRef.current >= 5) {
      clockClickRef.current = 0;
      unlockSecret("Five clicks through time! The Developer Vault appeared on your desktop.");
    }
  }

  function openWindow(id: WindowId, opener?: HTMLElement | null) {
    lastWindowOpenerRef.current =
      opener ?? desktopIconRefs.current[id] ?? lastWindowOpenerRef.current;
    setMinimizedWindow(null);
    setActiveWindow(id);
  }

  function closeWindow() {
    const returnTarget = lastWindowOpenerRef.current;
    setActiveWindow(null);
    setMinimizedWindow(null);
    window.requestAnimationFrame(() => {
      if (returnTarget?.isConnected) {
        returnTarget.focus();
      } else {
        document.querySelector<HTMLElement>(".start-button")?.focus();
      }
    });
  }

  function minimizeWindow(id: WindowId) {
    setActiveWindow(null);
    setMinimizedWindow(id);
    window.requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".active-task")?.focus(),
    );
  }

  useEffect(() => {
    if (stage !== "dialing") return;

    const timers = dialSequence.map((step, index) =>
      window.setTimeout(() => setDialStep(index + 1), step.at),
    );
    const finish = window.setTimeout(() => {
      dialAudioStopRef.current?.();
      dialAudioStopRef.current = null;
      setStage("desktop");
      setActiveWindow("welcome");
      setIsChronoClipOpen(true);
    }, DIAL_COMPLETE_AT);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [stage]);

  useEffect(
    () => () => {
      dialAudioStopRef.current?.();
    },
    [],
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    chatEndRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    if (stage !== "desktop" || !activeWindow) return;

    const frame = window.requestAnimationFrame(() => {
      const target =
        activeWindow === "chat"
          ? document.querySelector<HTMLElement>("#time-traveler-message")
          : document.querySelector<HTMLElement>(".win-window");
      target?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeWindow, stage]);

  useEffect(() => {
    if (stage !== "desktop") return;

    function handleEscape(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      if (event.key === "Escape" && activeWindow) closeWindow();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeWindow, stage]);

  useEffect(() => {
    if (!temporalAlert) return;
    const timer = window.setTimeout(() => setTemporalAlert(null), 5_500);
    return () => window.clearTimeout(timer);
  }, [temporalAlert]);

  useEffect(() => {
    if (!missionNotice) return;
    const timer = window.setTimeout(() => setMissionNotice(""), 3_600);
    return () => window.clearTimeout(timer);
  }, [missionNotice]);

  useEffect(() => {
    if (!easterEggMessage) return;
    const timer = window.setTimeout(() => setEasterEggMessage(""), 5_000);
    return () => window.clearTimeout(timer);
  }, [easterEggMessage]);

  useEffect(() => {
    if (stage !== "desktop") return;

    function handleSecretSequence(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.matches("input, textarea, [contenteditable='true']")
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = KONAMI_CODE[konamiIndexRef.current];
      if (key === expected) {
        konamiIndexRef.current += 1;
        if (konamiIndexRef.current === KONAMI_CODE.length) {
          konamiIndexRef.current = 0;
          unlockSecret("Classic code accepted. The Developer Vault is now available.");
        }
      } else {
        konamiIndexRef.current = key === KONAMI_CODE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", handleSecretSequence);
    return () => window.removeEventListener("keydown", handleSecretSequence);
  }, [stage]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentClock(formatClock()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function beginJourney() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialAudioStopRef.current?.();
      dialAudioStopRef.current = null;
      setStage("desktop");
      setActiveWindow("welcome");
      setIsChronoClipOpen(true);
      return;
    }

    dialAudioStopRef.current?.();
    setDialStep(0);
    setStage("dialing");
    dialAudioStopRef.current = soundEnabled ? playDialUpHandshake() ?? null : null;
  }

  function stopDialAudio() {
    dialAudioStopRef.current?.();
    dialAudioStopRef.current = null;
  }

  function cancelJourney() {
    stopDialAudio();
    setStage("landing");
  }

  function completeJourney() {
    stopDialAudio();
    setDialStep(dialSequence.length);
    setStage("desktop");
    setActiveWindow("welcome");
    setIsChronoClipOpen(true);
  }

  async function sendMessage(
    rawMessage?: string,
    options: { appendUser?: boolean } = {},
  ) {
    const content = (rawMessage ?? chatInput).trim();
    if (!content || isSending) return;

    const appendUser = options.appendUser ?? true;
    const nextMessages: ChatMessage[] = appendUser
      ? [...messages, { role: "user", content }]
      : messages;
    setMessages(nextMessages);
    setChatInput("");
    setChatNotice(null);
    setIsSending(true);
    completeMission("chat");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, seenConcepts }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const result = (await response.json()) as ChatResponse;
      setChatMode(result.mode);
      setChatProvider(result.provider ?? null);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.reply },
      ]);

      if (result.conceptId) {
        setSeenConcepts((current) =>
          current.includes(result.conceptId)
            ? current
            : [...current, result.conceptId],
        );
      }

      if (result.integrityDelta < 0) {
        setIntegrity((current) =>
          Math.max(0, current + result.integrityDelta),
        );
      }

      if (
        result.contamination &&
        (result.classification === "probable" ||
          result.classification === "definite")
      ) {
        const concept = result.anachronism || "Unfamiliar future concept";
        const repeatNote = result.isRepeat
          ? " Already logged—integrity was not reduced again."
          : "";
        setTemporalAlert({
          classification: result.classification,
          message: `${concept}: ${result.explanation}${repeatNote}`,
        });
        completeMission("future");
        setIsChronoClipOpen(true);
      }

      if (result.mode === "demo") {
        const missingKey = result.fallbackReason === "missing_api_key";
        const rateLimited = result.fallbackReason?.endsWith("_rate_limited");
        const authError = result.fallbackReason?.endsWith("_auth_error");
        const failedProvider = result.fallbackReason?.startsWith("gemini_")
          ? "Gemini"
          : result.fallbackReason?.startsWith("openai_")
            ? "OpenAI"
            : "The live AI provider";
        setChatNotice({
          tone: "offline",
          message: missingKey
            ? "Deterministic demo mode is active; no API connection is required."
            : rateLimited
              ? `${failedProvider}'s free-tier rate limit was reached. A deterministic 1998 reply kept the conversation moving.`
              : authError
                ? `${failedProvider} credential could not be used. A deterministic 1998 reply kept the conversation moving.`
                : `${failedProvider} is temporarily unavailable. A deterministic 1998 reply kept the conversation moving.`,
        });
      }
    } catch {
      setChatNotice({
        tone: "error",
        message: "The phone line dropped before Sam could answer.",
        retryMessage: content,
      });
    } finally {
      setIsSending(false);
      window.requestAnimationFrame(() => {
        const input = chatInputRef.current;
        if (input && !input.closest("[hidden]")) input.focus();
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  if (stage === "landing") {
    return (
      <main className="landing-shell">
        <div className="star-field" aria-hidden="true" />
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Chrono home">
            <span className="brand-mark" aria-hidden="true">
              ◴
            </span>
            <span>CHRONO</span>
          </a>
          <div className="header-actions">
            <span className="build-week-pill">OPENAI BUILD WEEK 2026</span>
            <button
              className="sound-toggle"
              type="button"
              onClick={() => setSoundEnabled((value) => !value)}
              aria-pressed={soundEnabled}
            >
              Sound {soundEnabled ? "on" : "off"}
            </button>
          </div>
        </header>

        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">AN AI-GENERATED TIME MACHINE</p>
            <h1>
              Don’t read history.
              <span>Live it.</span>
            </h1>
            <p className="hero-description">
              Step into a living snapshot of the past. Explore the web, meet
              people of the era, and see what happens when a time traveler says
              too much.
            </p>
            <div className="hero-actions">
              <button className="primary-cta" type="button" onClick={beginJourney}>
                Enter December 1998 <span aria-hidden="true">→</span>
              </button>
              <a className="secondary-cta" href="#destinations">
                View destinations
              </a>
            </div>
            <div className="trust-row">
              <span>Live AI + offline characters</span>
              <span>Interactive reconstruction</span>
              <span>Time Integrity Engine</span>
            </div>
          </div>

          <div className="portal-wrap" aria-label="Time portal set to 1998">
            <div className="portal-orbit orbit-one" />
            <div className="portal-orbit orbit-two" />
            <div className="portal-core">
              <span className="portal-label">DESTINATION</span>
              <strong>1998</strong>
              <span>DEC 04 · AUSTIN, TX</span>
            </div>
            <div className="portal-coordinate coordinate-a">30.2672° N</div>
            <div className="portal-coordinate coordinate-b">97.7431° W</div>
          </div>
        </section>

        <section className="destination-section" id="destinations">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CHOOSE A DESTINATION</p>
              <h2>One polished era now. An entire timeline next.</h2>
            </div>
            <p>
              The Build Week prototype focuses on one complete vertical slice:
              the late-1990s internet and the people who lived through it.
            </p>
          </div>

          <div className="era-grid">
            <article className="era-card locked">
              <span className="era-year">100 CE</span>
              <h3>Imperial Rome</h3>
              <p>Markets, streets, citizens, and daily life.</p>
              <span className="era-status">Planned</span>
            </article>
            <article className="era-card locked">
              <span className="era-year">1969</span>
              <h3>The Moonshot</h3>
              <p>Experience one event through many perspectives.</p>
              <span className="era-status">Planned</span>
            </article>
            <article className="era-card featured">
              <span className="era-year">1998</span>
              <h3>The Early Web</h3>
              <p>Dial-up, desktop icons, GeoCities, and a teenager named Sam.</p>
              <button type="button" onClick={beginJourney}>
                Visit this era
              </button>
            </article>
            <article className="era-card locked">
              <span className="era-year">2050</span>
              <h3>Speculative Future</h3>
              <p>A clearly labeled, AI-generated possible world.</p>
              <span className="era-status">Planned</span>
            </article>
          </div>

          <div className="timeline" aria-label="Chrono timeline">
            {["100", "1492", "1969", "1998", "2026", "2050"].map((year) => (
              <div className={year === "1998" ? "active" : ""} key={year}>
                <span />
                <small>{year}</small>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (stage === "dialing") {
    return (
      <main className="dial-screen" aria-live="polite">
        <div className="dial-terminal">
          <div className="dial-logo">CHRONO TEMPORAL ACCESS TERMINAL</div>
          <div className="dial-copy">
            {dialSequence.slice(0, dialStep).map((step, index) => (
              <p
                key={step.line}
                className={index === dialStep - 1 ? "current" : ""}
              >
                <span>&gt;</span> {step.line}
              </p>
            ))}
            <span className="terminal-cursor" aria-hidden="true" />
          </div>
          <div
            className="dial-progress"
            role="progressbar"
            aria-label="Temporal modem connection progress"
            aria-valuemin={0}
            aria-valuemax={dialSequence.length}
            aria-valuenow={dialStep}
          >
            <span style={{ width: `${(dialStep / dialSequence.length) * 100}%` }} />
          </div>
          <div className="dial-controls">
            <button type="button" onClick={completeJourney}>
              Skip connection
            </button>
            {soundEnabled && (
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(false);
                  stopDialAudio();
                }}
              >
                Mute modem
              </button>
            )}
            <button type="button" onClick={cancelJourney}>
              Cancel transmission
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="crt-room">
      <div className="crt-monitor">
        <div className="crt-screen">
          <div className="scanlines" aria-hidden="true" />
          <div className="desktop-header">
            <div>
              <span className="live-dot" /> CHRONO GATEWAY CONNECTED
            </div>
            <div>DECEMBER 4, 1998 · AUSTIN, TEXAS</div>
          </div>

          <div className="desktop-canvas">
            <aside className="desktop-icons" aria-label="Desktop applications">
              {activeDesktopApps.map((app) => (
                <button
                  type="button"
                  key={app.id}
                  className={taskWindow === app.id ? "selected" : ""}
                  ref={(element) => {
                    desktopIconRefs.current[app.id] = element;
                  }}
                  onClick={(event) => openWindow(app.id, event.currentTarget)}
                  aria-pressed={taskWindow === app.id}
                >
                  <span className="desktop-icon" aria-hidden="true">
                    {app.icon}
                  </span>
                  <span>{app.label}</span>
                </button>
              ))}
            </aside>

            <div className="desktop-status-stack">
              <IntegrityMeter integrity={integrity} />
              <div className="reconstruction-badge">
                <strong>Historical reconstruction</strong>
                <span>Documented context + clearly labeled AI dialogue</span>
              </div>
            </div>

            <div className="window-stage">
              {taskWindow === "welcome" && (
                <WindowFrame
                  title="Welcome to Chrono"
                  icon="🕰️"
                  isMinimized={minimizedWindow === "welcome"}
                  onMinimize={() => minimizeWindow("welcome")}
                  onClose={closeWindow}
                >
                  <div className="welcome-window">
                    <div className="welcome-banner">
                      <span>YOU HAVE ARRIVED</span>
                      <strong>FRIDAY, DECEMBER 4, 1998</strong>
                    </div>
                    <div className="welcome-grid">
                      <div>
                        <p className="win-kicker">YOUR TEMPORAL BRIEFING</p>
                        <h2>The web is young, loud, slow, and full of possibility.</h2>
                        <p>
                          Windows 98 is new. Google is a tiny company. DVDs are
                          gaining ground, most homes are still offline, and dial-up
                          is the usual path online. Your host has no idea what an
                          iPhone is.
                        </p>
                        <div className="welcome-actions">
                          <button
                            type="button"
                            onClick={(event) =>
                              openWindow("web", event.currentTarget)
                            }
                          >
                            Browse the 1998 web
                          </button>
                          <button
                            type="button"
                            onClick={(event) =>
                              openWindow("chat", event.currentTarget)
                            }
                          >
                            Talk to Sam
                          </button>
                          <button
                            type="button"
                            onClick={(event) =>
                              openWindow("snake", event.currentTarget)
                            }
                          >
                            Play Snake &apos;98
                          </button>
                          <button
                            type="button"
                            onClick={(event) =>
                              openWindow("missions", event.currentTarget)
                            }
                          >
                            Start guided mission
                          </button>
                        </div>
                      </div>
                      <div className="computer-illustration" aria-hidden="true">
                        <div className="computer-screen">
                          <span>WELCOME</span>
                          <strong>1998</strong>
                        </div>
                        <div className="computer-base" />
                      </div>
                    </div>
                  </div>
                </WindowFrame>
              )}

              {taskWindow === "time-capsule" && (
                <WindowFrame
                  title="Time Capsule Explorer"
                  icon="⌛"
                  isMinimized={minimizedWindow === "time-capsule"}
                  onMinimize={() => minimizeWindow("time-capsule")}
                  onClose={closeWindow}
                >
                  <TimeCapsule />
                </WindowFrame>
              )}

              {taskWindow === "web" && (
                <WindowFrame
                  title="Chrono Navigator"
                  icon="🌐"
                  isMinimized={minimizedWindow === "web"}
                  onMinimize={() => minimizeWindow("web")}
                  onClose={closeWindow}
                >
                  <ChronoWeb
                    onVisitMissionPage={(page) =>
                      completeMission(page === "nasa" ? "nasa" : "geocities")
                    }
                  />
                </WindowFrame>
              )}

              {taskWindow === "chat" && (
                <WindowFrame
                  title="Chrono Instant Messenger - Sam Carter"
                  icon="💬"
                  isMinimized={minimizedWindow === "chat"}
                  onMinimize={() => minimizeWindow("chat")}
                  onClose={closeWindow}
                >
                  <div className="chat-layout">
                    <aside className="profile-card">
                      <div className="avatar" aria-hidden="true">SC</div>
                      <strong>Sam Carter</strong>
                      <span>17 · Austin, TX</span>
                      <dl>
                        <div>
                          <dt>Status</dt>
                          <dd>Online</dd>
                        </div>
                        <div>
                          <dt>Computer</dt>
                          <dd>Gateway 2000</dd>
                        </div>
                        <div>
                          <dt>Connection</dt>
                          <dd>56k modem</dd>
                        </div>
                        <div>
                          <dt>Interests</dt>
                          <dd>PC games, skating, music</dd>
                        </div>
                      </dl>
                      <span className={`mode-badge ${chatMode}`}>
                        {chatMode === "ai"
                          ? chatProvider === "gemini"
                            ? "Gemini live"
                            : "GPT-5.6 live"
                          : chatMode === "demo"
                            ? "Demo fallback"
                            : "Live + demo ready"}
                      </span>
                    </aside>
                    <div className="chat-main" aria-busy={isSending}>
                      <div
                        className="chat-history"
                        role="log"
                        aria-live="polite"
                        aria-label="Conversation with Sam"
                      >
                        {messages.map((message, index) => (
                          <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                            <strong>{message.role === "assistant" ? "Sam" : "You"}</strong>
                            <p>{message.content}</p>
                          </div>
                        ))}
                        {isSending && (
                          <div className="chat-message assistant typing">
                            <strong>Sam</strong>
                            <p>typing<span>.</span><span>.</span><span>.</span></p>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="prompt-chips" aria-label="Suggested questions">
                        {demoPrompts.map((prompt) => (
                          <button
                            type="button"
                            key={prompt}
                            onClick={() => void sendMessage(prompt)}
                            disabled={isSending}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                      {chatNotice && (
                        <div
                          className={`chat-notice ${chatNotice.tone}`}
                          role={chatNotice.tone === "error" ? "alert" : "status"}
                        >
                          <span>{chatNotice.message}</span>
                          {chatNotice.retryMessage && (
                            <button
                              type="button"
                              disabled={isSending}
                              onClick={() =>
                                void sendMessage(chatNotice.retryMessage, {
                                  appendUser: false,
                                })
                              }
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      )}
                      <form className="chat-form" onSubmit={handleSubmit}>
                        <label className="sr-only" htmlFor="time-traveler-message">
                          Message Sam
                        </label>
                        <input
                          id="time-traveler-message"
                          ref={chatInputRef}
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          placeholder="Ask Sam about life in 1998..."
                          maxLength={1_000}
                          disabled={isSending}
                        />
                        <button type="submit" disabled={isSending || !chatInput.trim()}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                </WindowFrame>
              )}

              {taskWindow === "snake" && (
                <WindowFrame
                  title="Snake '98"
                  icon="🐍"
                  isMinimized={minimizedWindow === "snake"}
                  onMinimize={() => minimizeWindow("snake")}
                  onClose={closeWindow}
                >
                  <RetroSnake
                    isActive={activeWindow === "snake"}
                    onFoodCollected={() => completeMission("snake")}
                  />
                </WindowFrame>
              )}

              {taskWindow === "missions" && (
                <WindowFrame
                  title="Chrono Mission Control"
                  icon="✅"
                  isMinimized={minimizedWindow === "missions"}
                  onMinimize={() => minimizeWindow("missions")}
                  onClose={closeWindow}
                >
                  <MissionControl
                    completed={completedMissions}
                    onLaunch={(destination) => openWindow(destination)}
                  />
                </WindowFrame>
              )}

              {taskWindow === "inbox" && (
                <WindowFrame
                  title="Chrono Mail - Inbox"
                  icon="📨"
                  isMinimized={minimizedWindow === "inbox"}
                  onMinimize={() => minimizeWindow("inbox")}
                  onClose={closeWindow}
                >
                  <RetroInbox />
                </WindowFrame>
              )}

              {taskWindow === "player" && (
                <WindowFrame
                  title="ChronoAmp Media Player"
                  icon="💿"
                  isMinimized={minimizedWindow === "player"}
                  onMinimize={() => minimizeWindow("player")}
                  onClose={closeWindow}
                >
                  <ChronoAmp />
                </WindowFrame>
              )}

              {taskWindow === "buddies" && (
                <WindowFrame
                  title="Chrono Messenger - Buddy List"
                  icon="⚡"
                  isMinimized={minimizedWindow === "buddies"}
                  onMinimize={() => minimizeWindow("buddies")}
                  onClose={closeWindow}
                >
                  <BuddyList onMessageSam={() => openWindow("chat")} />
                </WindowFrame>
              )}

              {taskWindow === "secret" && (
                <WindowFrame
                  title="Developer Vault"
                  icon="📁"
                  isMinimized={minimizedWindow === "secret"}
                  onMinimize={() => minimizeWindow("secret")}
                  onClose={closeWindow}
                >
                  <div className="secret-vault">
                    <div className="secret-vault-logo" aria-hidden="true">◴</div>
                    <div>
                      <p className="win-kicker">SECRET FILE UNLOCKED</p>
                      <h2>Nice keyboard work, time traveler.</h2>
                      <p>
                        This hidden folder is an original Chrono Easter egg. It
                        celebrates the tiny secrets, cheat codes, and developer
                        signatures that made software feel personal.
                      </p>
                      <dl>
                        <div><dt>Build:</dt><dd>Chrono 0.3 “Phone Line Busy”</dd></div>
                        <div><dt>Destination:</dt><dd>December 4, 1998</dd></div>
                        <div><dt>Secret:</dt><dd>There are five clicks in every clock.</dd></div>
                      </dl>
                    </div>
                  </div>
                </WindowFrame>
              )}

              {taskWindow === "about" && (
                <WindowFrame
                  title="About Chrono"
                  icon="🕰️"
                  isMinimized={minimizedWindow === "about"}
                  onMinimize={() => minimizeWindow("about")}
                  onClose={closeWindow}
                >
                  <div className="about-window">
                    <div className="about-mark">◴</div>
                    <div>
                      <p className="win-kicker">OPENAI BUILD WEEK 2026</p>
                      <h2>Chrono turns historical knowledge into an experience.</h2>
                      <p>
                        Gemini or GPT-5.6 can write Sam&apos;s historically bounded
                        dialogue through a server-only provider adapter. A deterministic
                        guardrail classifies temporal contamination and keeps the demo
                        usable if live AI is unavailable. Codex accelerates implementation,
                        testing, source integration, and iteration.
                      </p>
                      <ul>
                        <li>One focused, runnable 1998 vertical slice</li>
                        <li>Server-side Gemini and OpenAI provider integration</li>
                        <li>Wayback Machine Archive Lens for real 1998 captures</li>
                        <li>Curated source cards with explicit evidence labels</li>
                        <li>Offline demo mode with the same integrity rules</li>
                        <li>Repeat-aware Time Integrity Engine</li>
                        <li>Keyboard and touch-friendly Snake &apos;98 game</li>
                        <li>Original ChronoClip contextual desktop helper</li>
                        <li>Action-tracked guided Time Missions</li>
                        <li>Fictional mail and buddy-list reconstructions</li>
                        <li>Original synthesized ChronoAmp tracks</li>
                      </ul>
                    </div>
                  </div>
                </WindowFrame>
              )}
            </div>

            {!activeWindow && !minimizedWindow && (
              <button
                className="reopen-window"
                type="button"
                onClick={(event) => openWindow("welcome", event.currentTarget)}
              >
                Select a desktop icon, or reopen the welcome screen
              </button>
            )}
          </div>

          {activeWindow === "screensaver" && (
            <RetroScreensaver onExit={closeWindow} />
          )}

          {taskWindow !== "screensaver" && (
            <ChronoClip
              context={taskWindow}
              integrity={integrity}
              alertClassification={temporalAlert?.classification}
              alertMessage={temporalAlert?.message}
              isOpen={isChronoClipOpen}
              onClose={() => setIsChronoClipOpen(false)}
            />
          )}

          {missionNotice && (
            <div className="mission-toast" role="status" aria-live="polite">
              <strong>✓ Mission Control</strong>
              <span>{missionNotice}</span>
            </div>
          )}

          {easterEggMessage && (
            <div className="easter-egg-toast" role="status" aria-live="polite">
              <strong>★ SECRET UNLOCKED</strong>
              <span>{easterEggMessage}</span>
            </div>
          )}

          {temporalAlert && (
            <div
              className={`temporal-alert ${temporalAlert.classification}`}
              role="status"
              aria-live="assertive"
            >
              <strong>
                {temporalAlert.classification === "definite"
                  ? "⚠ TEMPORAL CONTAMINATION"
                  : "⚠ POSSIBLE ANACHRONISM"}
              </strong>
              <span>{temporalAlert.message}</span>
            </div>
          )}

          <footer className="taskbar">
            <button
              className="start-button"
              type="button"
              onClick={(event) => openWindow("welcome", event.currentTarget)}
            >
              <span aria-hidden="true">◴</span> Start
            </button>
            <div className="taskbar-divider" />
            {taskWindow && (
              <button
                className={`active-task ${minimizedWindow ? "minimized" : ""}`}
                type="button"
                onClick={() => {
                  if (minimizedWindow) {
                    setActiveWindow(minimizedWindow);
                    setMinimizedWindow(null);
                  } else {
                    document.querySelector<HTMLElement>(".win-window")?.focus();
                  }
                }}
              >
                {activeDesktopApps.find((app) => app.id === taskWindow)?.icon ?? "🕰️"} {taskWindow.replace("-", " ")}
              </button>
            )}
            <div className="taskbar-spacer" />
            <button
              className={`chrono-clip-task ${isChronoClipOpen ? "active" : ""}`}
              type="button"
              onClick={() => setIsChronoClipOpen((current) => !current)}
              aria-pressed={isChronoClipOpen}
              aria-label={`${isChronoClipOpen ? "Hide" : "Open"} ChronoClip helper`}
            >
              <span aria-hidden="true">📎</span>
              <span className="chrono-clip-task-label">ChronoClip</span>
            </button>
            <div
              className="taskbar-integrity"
              aria-label={`Timeline integrity ${integrity}%`}
            >
              <span>Integrity</span> <strong>{integrity}%</strong>
            </div>
            <button className="return-button" type="button" onClick={() => setStage("landing")}>
              Exit era
            </button>
            <button
              className="taskbar-clock"
              type="button"
              onClick={handleClockClick}
              aria-label={`Current time ${currentClock}. A curious clock.`}
            >
              {currentClock}
            </button>
          </footer>
        </div>
      </div>
      <p className="monitor-caption">CHRONO TEMPORAL DISPLAY · BUILD 0.3</p>
    </main>
  );
}
