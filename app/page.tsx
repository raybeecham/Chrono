"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Stage = "landing" | "dialing" | "desktop";
type WindowId = "welcome" | "time-capsule" | "web" | "chat" | "about";
type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatResponse = {
  reply: string;
  contamination: boolean;
  integrityDelta: number;
  anachronism: string;
  mode: "ai" | "demo";
};

const demoPrompts = [
  "What websites do you use?",
  "What game should I buy?",
  "Have you heard of an iPhone?",
];

const dialSequence = [
  "Initializing Chrono temporal modem...",
  "Dialing Austin gateway: 512-555-0198",
  "Negotiating connection at 56.0 kbps...",
  "Synchronizing cultural context...",
  "Connection established: DEC 04 1998",
];

const desktopApps: Array<{
  id: WindowId;
  label: string;
  icon: string;
}> = [
  { id: "time-capsule", label: "Time Capsule", icon: "⌛" },
  { id: "web", label: "The Internet", icon: "🌐" },
  { id: "chat", label: "Talk to Sam", icon: "💬" },
  { id: "about", label: "About Chrono", icon: "🕰️" },
];

function playTemporalTones() {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const notes = [880, 1040, 620, 1260, 440, 1480, 740];

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + index * 0.09;

    oscillator.type = index % 2 === 0 ? "square" : "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.075);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.08);
  });

  window.setTimeout(() => void context.close(), 1_200);
}

function WindowFrame({
  title,
  icon,
  children,
  onClose,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <section className="win-window" aria-label={title}>
      <header className="win-titlebar">
        <div className="win-titlebar-label">
          <span aria-hidden="true">{icon}</span>
          <strong>{title}</strong>
        </div>
        <div className="win-controls" aria-label="Window controls">
          <button type="button" aria-label={`Minimize ${title}`}>
            _
          </button>
          <button type="button" aria-label={`Maximize ${title}`}>
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
  const [dialStep, setDialStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [integrity, setIntegrity] = useState(100);
  const [temporalAlert, setTemporalAlert] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "demo">("demo");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, I’m Sam. It’s December 4, 1998, and I’m supposed to be doing homework. What do you want to know?",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (stage !== "dialing") return;

    const timers = dialSequence.map((_, index) =>
      window.setTimeout(() => setDialStep(index + 1), 520 * (index + 1)),
    );
    const finish = window.setTimeout(() => {
      setStage("desktop");
      setActiveWindow("welcome");
    }, 520 * (dialSequence.length + 1));

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [stage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!temporalAlert) return;
    const timer = window.setTimeout(() => setTemporalAlert(null), 5_500);
    return () => window.clearTimeout(timer);
  }, [temporalAlert]);

  const currentClock = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    [],
  );

  function beginJourney() {
    setDialStep(0);
    setStage("dialing");
    if (soundEnabled) playTemporalTones();
  }

  async function sendMessage(rawMessage?: string) {
    const content = (rawMessage ?? chatInput).trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(nextMessages);
    setChatInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const result = (await response.json()) as ChatResponse;
      setChatMode(result.mode);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.reply },
      ]);

      if (result.contamination) {
        const delta = Math.min(-1, result.integrityDelta || -4);
        setIntegrity((current) => Math.max(0, current + delta));
        setTemporalAlert(
          result.anachronism
            ? `Future knowledge detected: ${result.anachronism}`
            : "Future knowledge detected",
        );
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "The phone line just dropped. Try that again after the modem reconnects.",
        },
      ]);
    } finally {
      setIsSending(false);
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
              <span>GPT-5.6 characters</span>
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
            {dialSequence.slice(0, dialStep).map((line, index) => (
              <p key={line} className={index === dialStep - 1 ? "current" : ""}>
                <span>&gt;</span> {line}
              </p>
            ))}
            <span className="terminal-cursor" aria-hidden="true" />
          </div>
          <div className="dial-progress" aria-hidden="true">
            <span style={{ width: `${(dialStep / dialSequence.length) * 100}%` }} />
          </div>
          <button type="button" onClick={() => setStage("landing")}>
            Cancel transmission
          </button>
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
              {desktopApps.map((app) => (
                <button
                  type="button"
                  key={app.id}
                  className={activeWindow === app.id ? "selected" : ""}
                  onClick={() => setActiveWindow(app.id)}
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
              {activeWindow === "welcome" && (
                <WindowFrame
                  title="Welcome to Chrono"
                  icon="🕰️"
                  onClose={() => setActiveWindow(null)}
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
                          gaining ground, most homes still use dial-up, and your
                          host has no idea what an iPhone is.
                        </p>
                        <div className="welcome-actions">
                          <button type="button" onClick={() => setActiveWindow("web")}>
                            Browse the 1998 web
                          </button>
                          <button type="button" onClick={() => setActiveWindow("chat")}>
                            Talk to Sam
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

              {activeWindow === "time-capsule" && (
                <WindowFrame
                  title="Time Capsule Explorer"
                  icon="⌛"
                  onClose={() => setActiveWindow(null)}
                >
                  <div className="capsule-layout">
                    <nav className="capsule-nav" aria-label="Time capsule categories">
                      <button type="button" className="active">
                        Snapshot
                      </button>
                      <button type="button">Technology</button>
                      <button type="button">Culture</button>
                      <button type="button">Everyday life</button>
                    </nav>
                    <div className="capsule-content">
                      <p className="win-kicker">DECEMBER 1998 · UNITED STATES</p>
                      <h2>A world between analog habits and digital ambition.</h2>
                      <div className="fact-grid">
                        <article>
                          <span>CONNECT</span>
                          <strong>56k dial-up</strong>
                          <p>The phone line and internet connection cannot coexist.</p>
                        </article>
                        <article>
                          <span>LISTEN</span>
                          <strong>CDs, radio, tapes</strong>
                          <p>Portable music is physical, personal, and easy to scratch.</p>
                        </article>
                        <article>
                          <span>PLAY</span>
                          <strong>Half-Life arrives</strong>
                          <p>PC gaming is rapidly becoming more cinematic.</p>
                        </article>
                        <article>
                          <span>SEARCH</span>
                          <strong>Yahoo! first</strong>
                          <p>Directories and portals organize the expanding web.</p>
                        </article>
                      </div>
                      <p className="source-note">
                        This prototype uses a curated historical snapshot. Future
                        versions will attach primary-source citations to each fact.
                      </p>
                    </div>
                  </div>
                </WindowFrame>
              )}

              {activeWindow === "web" && (
                <WindowFrame
                  title="Chrono Navigator"
                  icon="🌐"
                  onClose={() => setActiveWindow(null)}
                >
                  <div className="browser-shell">
                    <div className="browser-toolbar">
                      <button type="button">←</button>
                      <button type="button">→</button>
                      <button type="button">⌂</button>
                      <label>
                        <span>Address</span>
                        <input
                          aria-label="Browser address"
                          readOnly
                          value="http://www.chrononet.net/1998"
                        />
                      </label>
                    </div>
                    <div className="browser-page">
                      <div className="web-marquee">★ WELCOME TO THE WORLD WIDE WEB ★</div>
                      <h2>ChronoNet Directory</h2>
                      <p className="visitor-count">You are visitor #000,019,998</p>
                      <div className="web-columns">
                        <section>
                          <h3>Explore the web</h3>
                          <a href="#web-yahoo">Yahoo! Web Directory</a>
                          <a href="#web-geocities">GeoCities Neighborhoods</a>
                          <a href="#web-ask">Ask Jeeves</a>
                          <a href="#web-nasa">NASA Shuttle Mission</a>
                        </section>
                        <section>
                          <h3>What is new?</h3>
                          <p>Animated GIF collections</p>
                          <p>Free guestbooks for your homepage</p>
                          <p>Winamp skins and desktop themes</p>
                          <p>Java applets your browser may not load</p>
                        </section>
                      </div>
                      <div className="under-construction">🚧 UNDER CONSTRUCTION 🚧</div>
                      <small>Best viewed at 800 × 600 resolution.</small>
                    </div>
                  </div>
                </WindowFrame>
              )}

              {activeWindow === "chat" && (
                <WindowFrame
                  title="Chrono Instant Messenger - Sam Carter"
                  icon="💬"
                  onClose={() => setActiveWindow(null)}
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
                      </dl>
                      <span className={`mode-badge ${chatMode}`}>
                        {chatMode === "ai" ? "GPT-5.6 live" : "Demo fallback"}
                      </span>
                    </aside>
                    <div className="chat-main">
                      <div className="chat-history" aria-live="polite">
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
                      <form className="chat-form" onSubmit={handleSubmit}>
                        <label className="sr-only" htmlFor="time-traveler-message">
                          Message Sam
                        </label>
                        <input
                          id="time-traveler-message"
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

              {activeWindow === "about" && (
                <WindowFrame
                  title="About Chrono"
                  icon="🕰️"
                  onClose={() => setActiveWindow(null)}
                >
                  <div className="about-window">
                    <div className="about-mark">◴</div>
                    <div>
                      <p className="win-kicker">OPENAI BUILD WEEK 2026</p>
                      <h2>Chrono turns historical knowledge into an experience.</h2>
                      <p>
                        GPT-5.6 powers period-aware characters and evaluates
                        temporal contamination. Codex accelerates implementation,
                        testing, and iteration across the project.
                      </p>
                      <ul>
                        <li>One focused, runnable 1998 vertical slice</li>
                        <li>Server-side OpenAI Responses API integration</li>
                        <li>Offline demo mode for reliable judging</li>
                        <li>Time Integrity Engine that reacts to future knowledge</li>
                      </ul>
                    </div>
                  </div>
                </WindowFrame>
              )}
            </div>

            {!activeWindow && (
              <button
                className="reopen-window"
                type="button"
                onClick={() => setActiveWindow("welcome")}
              >
                Double-click an icon, or reopen the welcome screen
              </button>
            )}
          </div>

          {temporalAlert && (
            <div className="temporal-alert" role="status">
              <strong>⚠ TEMPORAL CONTAMINATION</strong>
              <span>{temporalAlert}</span>
            </div>
          )}

          <footer className="taskbar">
            <button className="start-button" type="button" onClick={() => setActiveWindow("welcome")}>
              <span aria-hidden="true">◴</span> Start
            </button>
            <div className="taskbar-divider" />
            {activeWindow && (
              <button className="active-task" type="button">
                {desktopApps.find((app) => app.id === activeWindow)?.icon ?? "🕰️"} {activeWindow.replace("-", " ")}
              </button>
            )}
            <div className="taskbar-spacer" />
            <button className="return-button" type="button" onClick={() => setStage("landing")}>
              Exit era
            </button>
            <time>{currentClock}</time>
          </footer>
        </div>
      </div>
      <p className="monitor-caption">CHRONO TEMPORAL DISPLAY · BUILD 0.1</p>
    </main>
  );
}
