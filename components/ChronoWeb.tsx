"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  archiveStartingPoints,
  create1998ArchiveUrl,
} from "@/lib/wayback-1998";

type WebPageId = "home" | "yahoo" | "geocities" | "ask" | "nasa" | "archive";

const pageAddresses: Record<WebPageId, string> = {
  home: "http://www.chrononet.net/1998",
  yahoo: "http://www.yahoo.com/Computers_and_Internet/",
  geocities: "http://www.geocities.com/SiliconValley/Heights/5120/",
  ask: "http://www.askjeeves.com/",
  nasa: "http://www.nasa.gov/shuttle/missions/sts-88/",
  archive: "chrono://research/archive-lens/1998",
};

const searchIndex = [
  {
    terms: ["game", "games", "half-life", "starcraft", "zelda"],
    title: "PC & Console Games — December 1998",
    copy: "Half-Life, StarCraft, and The Legend of Zelda: Ocarina of Time are filling magazines, message boards, and after-school arguments.",
  },
  {
    terms: ["music", "song", "cd", "radio"],
    title: "Music, CDs & Radio",
    copy: "Try artist fan pages, CDNow, local radio station sites, or a carefully maintained list of Winamp skins.",
  },
  {
    terms: ["space", "nasa", "shuttle", "station", "sts-88"],
    title: "NASA: Space Shuttle Endeavour launches STS-88",
    copy: "Today’s mission carries Unity, the first U.S.-built component of the International Space Station.",
  },
  {
    terms: ["chat", "email", "message", "friends"],
    title: "Email, IRC & Instant Messaging",
    copy: "People trade email addresses, join IRC channels, and watch their AIM buddy lists for friends to sign on.",
  },
  {
    terms: ["internet", "web", "www", "online", "software", "usenet"],
    title: "World Wide Web, software & Usenet",
    copy: "Directories, personal homepages, shareware sites, and threaded Usenet discussions help people navigate a web without modern social feeds.",
  },
  {
    terms: ["news", "newspaper", "magazine", "weather"],
    title: "News, magazines & weather",
    copy: "Newspaper and television sites are online, but many readers still begin with print, radio, or the evening broadcast.",
  },
  {
    terms: ["sports", "baseball", "travel", "outdoors"],
    title: "Sports, travel & outdoors",
    copy: "Team pages, fan sites, and manually updated score pages share the web with travel guides and local recreation directories.",
  },
  {
    terms: ["austin", "texas", "local", "regional"],
    title: "Austin, Texas — regional directory",
    copy: "Look for city guides, venue calendars, local news, university pages, and hand-built lists of Austin links.",
  },
];

export function ChronoWeb({
  onVisitMissionPage,
}: {
  onVisitMissionPage?: (page: "nasa" | "geocities") => void;
}) {
  const [history, setHistory] = useState<WebPageId[]>(["home"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [guestbookSigned, setGuestbookSigned] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveError, setArchiveError] = useState("");
  const browserPageRef = useRef<HTMLDivElement | null>(null);
  const didMountRef = useRef(false);

  const currentPage = history[historyIndex];
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const results = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();
    if (!normalized) return [];

    const matches = searchIndex.filter((entry) =>
      entry.terms.some((term) => normalized.includes(term)),
    );

    return matches;
  }, [submittedQuery]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() =>
      browserPageRef.current?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [currentPage]);

  function navigate(page: WebPageId) {
    if (page === "nasa" || page === "geocities") {
      onVisitMissionPage?.(page);
    }
    if (page === currentPage) return;
    const nextHistory = [...history.slice(0, historyIndex + 1), page];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  function openSearch(value: string) {
    setQuery(value);
    setSubmittedQuery(value);
    navigate("ask");
  }

  function handleArchiveSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const archiveUrl = create1998ArchiveUrl(archiveQuery);
    if (!archiveUrl) {
      setArchiveError("Enter a valid website address, such as nasa.gov.");
      return;
    }

    setArchiveError("");
    window.open(archiveUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="browser-shell">
      <div className="browser-toolbar" aria-label="Chrono Navigator controls">
        <button
          type="button"
          aria-label="Go back"
          disabled={!canGoBack}
          onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Go forward"
          disabled={!canGoForward}
          onClick={() =>
            setHistoryIndex((index) => Math.min(history.length - 1, index + 1))
          }
        >
          →
        </button>
        <button type="button" aria-label="ChronoNet home" onClick={() => navigate("home")}>
          ⌂
        </button>
        <label>
          <span>Address</span>
          <input aria-label="Browser address" readOnly value={pageAddresses[currentPage]} />
        </label>
      </div>

      <div
        className={`browser-page browser-page-${currentPage}`}
        ref={browserPageRef}
        tabIndex={-1}
      >
        {currentPage === "home" && (
          <>
            <div className="web-marquee">★ WELCOME TO THE WORLD WIDE WEB ★</div>
            <h2>ChronoNet Directory</h2>
            <p className="visitor-count">You are visitor #000,019,998</p>
            <div className="web-columns">
              <section>
                <h3>Explore the web</h3>
                <button type="button" className="web-link" onClick={() => navigate("yahoo")}>
                  Yahoo! Web Directory
                </button>
                <button type="button" className="web-link" onClick={() => navigate("geocities")}>
                  GeoCities Neighborhoods
                </button>
                <button type="button" className="web-link" onClick={() => navigate("ask")}>
                  Ask Jeeves
                </button>
                <button type="button" className="web-link" onClick={() => navigate("nasa")}>
                  NASA Shuttle Mission — live today
                </button>
                <button type="button" className="web-link" onClick={() => navigate("archive")}>
                  Chrono Archive Lens — real 1998 captures
                </button>
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
          </>
        )}

        {currentPage === "yahoo" && (
          <article className="retro-page yahoo-page">
            <p className="retro-page-label">DOCUMENTED SERVICE · PERIOD RECONSTRUCTION</p>
            <h2>Yahoo!</h2>
            <p className="retro-subtitle">The web organized by actual humans.</p>
            <div className="directory-grid">
              {[
                ["Arts & Humanities", "Photography · Books · Music", "music"],
                ["Computers & Internet", "WWW · Software · Usenet", "internet"],
                ["Entertainment", "Movies · TV · Games", "games"],
                ["News & Media", "Newspapers · Magazines · Weather", "news"],
                ["Recreation & Sports", "Baseball · Travel · Outdoors", "sports"],
                ["Regional", "Countries · States · Cities", "Austin"],
              ].map(([title, copy, search]) => (
                <div key={title}>
                  <button type="button" onClick={() => openSearch(search)}>
                    {title}
                  </button>
                  <span>{copy}</span>
                </div>
              ))}
            </div>
            <button type="button" className="retro-home-link" onClick={() => navigate("home")}>
              Return to ChronoNet
            </button>
          </article>
        )}

        {currentPage === "geocities" && (
          <article className="retro-page geocities-page">
            <p className="retro-page-label">FICTIONAL RECONSTRUCTION · SAM’S HOMEPAGE</p>
            <h2>Sam’s Totally Awesome Homepage</h2>
            <p className="blink-copy">Welcome, web traveler!!!</p>
            <div className="geocities-copy">
              <section>
                <h3>Stuff I’m into</h3>
                <p>Half-Life, StarCraft, skate videos, Green Day, and learning HTML by breaking it.</p>
              </section>
              <section>
                <h3>Current status</h3>
                <p>Homework: unfinished. Modem: connected. Phone line: occupied. Parents: annoyed.</p>
              </section>
            </div>
            <button
              type="button"
              className="guestbook-button"
              aria-pressed={guestbookSigned}
              onClick={() => setGuestbookSigned(true)}
            >
              {guestbookSigned ? "✓ Guestbook signed — thanks!" : "Sign my guestbook"}
            </button>
            <p className="hit-counter">This page has been visited 000042 times.</p>
          </article>
        )}

        {currentPage === "ask" && (
          <article className="retro-page ask-page">
            <p className="retro-page-label">REPRESENTATIVE SEARCH EXPERIENCE</p>
            <h2>Ask Jeeves</h2>
            <p className="retro-subtitle">Ask a question in plain English.</p>
            <form className="jeeves-search" onSubmit={handleSearch}>
              <label htmlFor="jeeves-query">What would you like to know?</label>
              <div>
                <input
                  id="jeeves-query"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try: games, music, NASA..."
                  maxLength={120}
                />
                <button type="submit" disabled={!query.trim()}>
                  Ask
                </button>
              </div>
            </form>
            <div className="search-results" aria-live="polite">
              {submittedQuery && results.length > 0 && (
                <h3>Jeeves found {results.length} answer(s)</h3>
              )}
              {submittedQuery && results.length === 0 && (
                <div className="search-empty">
                  <strong>No exact answer for “{submittedQuery}”</strong>
                  <p>
                    Try fewer words. Search engines in 1998 work best when you
                    meet them halfway.
                  </p>
                </div>
              )}
              {results.map((result) => (
                <article key={result.title}>
                  <strong>{result.title}</strong>
                  <p>{result.copy}</p>
                </article>
              ))}
            </div>
          </article>
        )}

        {currentPage === "nasa" && (
          <article className="retro-page nasa-page">
            <p className="retro-page-label">
              DOCUMENTED EVENT · PERIOD RECONSTRUCTION
            </p>
            <div className="nasa-heading">
              <span aria-hidden="true">★</span>
              <div>
                <p>SPACE SHUTTLE ENDEAVOUR</p>
                <h2>STS-88 launches today</h2>
              </div>
            </div>
            <p className="nasa-lede">
              At 3:35 a.m. Eastern on December 4, 1998, Endeavour began the first
              shuttle mission to the International Space Station, carrying the
              U.S.-built Unity connecting module.
            </p>
            <dl className="mission-facts">
              <div><dt>Mission</dt><dd>First ISS shuttle flight</dd></div>
              <div><dt>Orbiter</dt><dd>Endeavour</dd></div>
              <div><dt>Crew</dt><dd>Six</dd></div>
              <div><dt>Planned duration</dt><dd>Nearly 12 days</dd></div>
            </dl>
            <a
              className="nasa-source-link"
              href="https://www.nasa.gov/mission/sts-88/"
              target="_blank"
              rel="noreferrer"
            >
              Open the NASA mission record ↗
            </a>
          </article>
        )}

        {currentPage === "archive" && (
          <article className="retro-page archive-lens-page">
            <p className="archive-lens-layer">
              CHRONO RESEARCH LAYER · MODERN TOOL · NOT A 1998 APPLICATION
            </p>
            <h2>Archive Lens</h2>
            <p className="archive-lens-intro">
              Step outside the reconstruction and open real web captures preserved
              by the Internet Archive&apos;s Wayback Machine. Captures may be incomplete,
              missing images, or recorded on a nearby date.
            </p>

            <div className="archive-starting-points">
              {archiveStartingPoints.map((entry) => (
                <article key={entry.id}>
                  <div>
                    <strong>{entry.site}</strong>
                    <span>{entry.captureLabel}</span>
                  </div>
                  <p>{entry.description}</p>
                  <code>{entry.originalUrl}</code>
                  <a href={entry.archiveUrl} target="_blank" rel="noreferrer">
                    Open in the Wayback Machine ↗
                  </a>
                </article>
              ))}
            </div>

            <form className="archive-search" onSubmit={handleArchiveSearch}>
              <label htmlFor="archive-url">Try another website in 1998</label>
              <div>
                <input
                  id="archive-url"
                  value={archiveQuery}
                  onChange={(event) => setArchiveQuery(event.target.value)}
                  placeholder="example.com"
                  inputMode="url"
                  maxLength={240}
                  aria-describedby="archive-help archive-error"
                />
                <button type="submit" disabled={!archiveQuery.trim()}>
                  Browse 1998
                </button>
              </div>
              <small id="archive-help">
                Opens the Internet Archive in a new tab. Availability varies by site.
              </small>
              <span id="archive-error" className="archive-error" role="alert">
                {archiveError}
              </span>
            </form>

            <a
              className="archive-about-link"
              href="https://archivesupport.zendesk.com/hc/en-us/articles/360004651732-Using-The-Wayback-Machine"
              target="_blank"
              rel="noreferrer"
            >
              How the Wayback Machine works ↗
            </a>
          </article>
        )}
      </div>
    </div>
  );
}
