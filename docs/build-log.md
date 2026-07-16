# Codex build log

Use this file to preserve evidence for the Devpost submission. Add an entry after each meaningful implementation session.

## 2026-07-15: Initial vertical slice

**Goal:** Convert the Chrono concept into a single deployable project with a memorable 1998 demo path.

**Decisions:**

- Selected Next.js and TypeScript to keep the user interface and server-side OpenAI integration in one application.
- Scoped the first release to December 4, 1998 rather than building several shallow eras.
- Added a deterministic demo mode so the project remains runnable without an API key.
- Designed the Time Integrity Engine as structured model output rather than a purely visual gimmick.

**Implemented:**

- Cinematic landing page and era selector.
- Temporal dial-up transition.
- Windows 98-inspired interactive desktop.
- Early-web reconstruction, time capsule, and period-aware chat experience.
- Server-side Responses API route using GPT-5.6 and JSON schema output.
- Timeline-integrity warning and score changes when future knowledge is introduced.
- Accessibility, responsive behavior, reduced-motion support, CI, and setup documentation.

**Validation:**

- `npm run lint`
- `npm run build`

**Next:**

- Deploy a public preview.
- Add primary-source citations to historical facts.
- Improve the character prompt through adversarial testing.
- Capture the primary Codex `/feedback` session ID before submission.

## 2026-07-15: Phase two — hackathon-ready 1998 experience

**Goal:** Turn the initial vertical slice into a grounded, reliable three-minute demo without changing Chrono’s stack, visual identity, or single-era scope.

**Baseline audit:**

- Read the repository instructions, product documentation, application UI, styling, API route, package scripts, and CI workflow before implementation.
- Inspected the repository state and walked through the landing page, temporal transition, desktop, Time Capsule, ChronoNet, Sam conversation, and integrity warning path.
- Confirmed the pre-phase baseline with `npm run lint` and `npm run build` before making the phase-two changes.

**Historical experience and grounding:**

- Reworked the Time Capsule into a keyboard-navigable explorer with eight categories: Snapshot, Technology, Games, Music, Movies, Prices, Communication, and Daily Life.
- Added 20 expandable facts anchored to December 4, 1998 and 10 static, curated source records. The source set includes government and institutional records, contemporary publications, official corporate history, and clearly identified archives; no citation is synthesized by the model.
- Added separate Documented, Representative, and Fictional grounding labels plus High and Medium confidence labels for evidence-based facts; fictional cards explicitly say Not a factual claim. Fact-level and category-level source controls open a focus-managed drawer with publisher, date, summary, and external source link.
- Audited facts from the traveler’s selected-date perspective: the movie card does not reveal a weekend result that was not complete on Friday, and the gas card uses the latest national observation available before December 4 rather than a later weekly value.
- Expanded ChronoNet into navigable home, Yahoo!, GeoCities, Ask Jeeves, and NASA STS-88 pages with back/forward/home controls, a small period-specific search index, a guestbook interaction, and page-level reconstruction labels. The NASA page links to the mission record; Sam’s homepage is explicitly fictional.

**Time integrity and Sam continuity:**

- Made the deterministic engine authoritative for integrity decisions. It distinguishes harmless ambiguity, probable future language, and definite contamination, with severity-based deltas and concise explanations.
- Added canonical concept IDs so aliases such as iPhone and Android phone share repeat accounting. A repeated concept remains contamination but receives a zero delta; a new concept in the same message can still be charged.
- Kept GPT-5.6 focused on Sam’s conversational phrasing. The server supplies the authoritative assessment through the Responses API, requires strict structured output, checks the returned decision fields against its own assessment, and rejects replies that fail the period-safety guard.
- Preserved the bounded transcript as Sam’s current-session memory and strengthened his consistent Austin teenager voice, interests, and natural confusion around unfamiliar future ideas. The deterministic fallback also handles common period questions and a transcript-memory prompt.

**Reliability, interface, and accessibility decisions:**

- Preserved server-only key handling and the no-key demo path. OpenAI authentication, rate-limit, service, timeout, incomplete, invalid-output, assessment-mismatch, and period-guard failures return a useful deterministic response instead of ending the conversation.
- Added a neutral Live + demo ready state before the first reply, kept the eventual live/demo mode visible, clarified fallback and transport-error notices, and made Retry resend a failed prompt without duplicating the user’s transcript entry.
- Preserved responsive desktop and mobile layouts, visible focus states, reduced-motion behavior, keyboard window access, Escape handling, live-region status updates, arrow/Home/End category navigation, source-drawer focus entry, and focus return on close.

**Automated coverage:**

- Added 12 Node test cases for period-appropriate prompts, definite and probable contamination, contextual false-positive resistance, alias grouping, repeat protection, new concepts following repeats, no-key deterministic output, Sam continuity, and the period-safety guard.
- Added `npm test` to the local validation workflow and CI alongside lint and production build checks.

**Validation status for this entry:**

- Baseline lint, production build, and full browser walkthrough: confirmed before phase-two implementation.
- Final `npm test`: passed all 12 tests. Final `npm run lint`, TypeScript no-emit check, `npm run build`, and `git diff --check`: passed.
- No-key route smoke: returned `mode: demo`, `fallbackReason: missing_api_key`, definite iPhone contamination at `-8`, and a zero-delta repeat on the same canonical concept.
- Configured-key smoke: the credential reached OpenAI successfully, but the account returned `429 insufficient_quota`; live generation therefore could not be confirmed in this session. Chrono returned its deterministic fallback instead of breaking. Re-test **GPT-5.6 live** after adding API quota.
- Desktop Chrome pass at 1440 × 1000: confirmed all eight capsule categories, scoped source dialog and focus handling, functional ChronoNet search, state-preserving minimize/restore, fallback chat, and the integrity sequence `100 → 97 → 89 → 89` for Wi-Fi, iPhone, and repeated iPhone.
- Mobile Chrome pass at 375 × 812: confirmed no horizontal page overflow, a visible fixed integrity/Exit taskbar, keyboard-managed source dialog, and a working return to the landing page.
- Simulated browser network loss: confirmed the error notice and manual Retry; retry preserved one user transcript entry and added the recovered assistant reply without duplication.
- The Austin Chronicle issue and World Radio History Billboard PDF, which resisted earlier automated checks, both loaded successfully in Chrome. The remaining curated links had already resolved during the source audit.

**Known limitations:**

- The experience covers one date, one city, and one fictional character; it is not a general historical simulator.
- The 10-source collection is deliberately static. Chrono does not perform retrieval, independently archive external pages, or treat generated dialogue as evidence.
- The deterministic integrity catalog and reply safety checks are tested but finite; novel or highly indirect anachronisms can escape detection.
- Conversation state is in memory for the current browser session and resets on reload. There is no account, database, or cross-session memory.
- Deterministic fallback keeps the demo functional but is less flexible than a successful live GPT-5.6 response. Live mode depends on valid OpenAI access, available quota, and network availability; the configured credential used for this validation currently has no remaining API quota.
- Unit tests cover the integrity core and fallback behavior, while the end-to-end visual path remains a manual smoke test rather than a committed browser-automation suite.

**Submission follow-through:**

- Add API quota, re-run one live GPT-5.6 reply, then deploy or verify the public preview and rehearse `docs/demo-script.md` against it.
- Run `/feedback` in the primary Codex session and save the session ID required for the Devpost submission.

## 2026-07-15: Snake '98 desktop game

**Goal:** Add a recognizable, immediately playable retro-game moment without introducing a dependency, another era, or copyrighted art.

**Decision:** Built a clearly labeled period-style Snake recreation that lives as a normal Chrono desktop application. The small grid, score chase, keyboard controls, and on-screen direction pad make it useful both as a quick demo flourish and as a real mobile interaction.

**Implemented:**

- Added a responsive 18 × 13 Snake board with scoring, increasing speed, session-best tracking, pause/resume, reset, win/game-over states, and deterministic food placement.
- Added arrow-key and W/A/S/D controls, a touch-friendly direction pad, visible focus, live status text, and automatic pause when the game is minimized or the document is hidden.
- Added the game to the desktop, welcome actions, About window, README, and optional demo-script path.
- Kept the movement and collision rules in a standalone module and added five focused tests for direction safety, movement, growth, collision, and food placement.

**Validation:**

- `npm test`: 17 tests passed, including the five Snake rules.
- `npm run lint`: passed.
- TypeScript no-emit check: passed.
- `npm run build`: passed with the static app and dynamic chat route generated successfully.
- Desktop Chrome at 1440 × 1000: confirmed 234 board cells, keyboard focus, the first food increasing the score to 10, and state-preserving automatic pause after minimize/restore.
- Mobile Chrome at 375 × 812: confirmed five non-overlapping desktop icons, a 295 × 213 playable board, four visible direction buttons, a visible Exit action, and no horizontal page overflow.
- Growth follow-up: fixed a React development-mode double-invocation issue caused by side effects inside the snake state updater. A rendered-board regression check now confirms the initial three segments become four after the first red pixel and remain four on later movement; the visible Length counter reports the same change.

**Remaining risk:** The game state is intentionally session-local and resets when its desktop application is replaced or the page reloads. It is a period-style recreation, not a claim that this exact visual edition existed in December 1998.

## 2026-07-15: Dial-up handshake and ChronoClip helper

**Goal:** Make arrival in 1998 more sensory and give the desktop a recognizable, useful late-1990s assistant interaction without copying proprietary character artwork or audio.

**Decision:** Expanded the existing user-triggered Web Audio tones into an original synthesized modem handshake and created ChronoClip, a fictional CSS-drawn paperclip helper. The helper reinforces Chrono’s actual navigation, evidence, game, and integrity mechanics instead of operating as a decorative pop-up.

**Implemented:**

- Added a seven-second connection sequence with dial tone, DTMF dialing, carrier exchange, filtered line noise, 56k negotiation, and connection confirmation. The audio uses browser synthesis rather than a copied recording.
- Added visible connection progress plus **Skip connection**, **Mute modem**, and **Cancel transmission** controls. Reduced-motion visitors continue directly to the desktop, and every audio path closes its `AudioContext` on completion, cancellation, skip, mute, or unmount.
- Added ChronoClip with contextual tips for the welcome screen, Time Capsule, ChronoNet, Sam, Snake '98, and About window.
- Connected definite and probable Time Integrity alerts to ChronoClip, reopening the helper with a warning-specific explanation while keeping the existing alert visible and non-overlapping.
- Added a taskbar control to hide and reopen the helper, an original CSS-drawn character, an explicit fictional label, responsive layout, live-region semantics, and reduced-motion behavior.
- Added three focused tests for contextual tips, alert priority, and changed-integrity guidance; the full suite now contains 20 tests.

**Validation:**

- `npm test`: 20 tests passed.
- `npm run lint`: passed.
- TypeScript no-emit check: passed.
- `npm run build`: passed with the static experience and dynamic chat route generated successfully.
- Desktop Chrome at 1440 × 1000: confirmed the staged unskipped connection, automatic desktop arrival, contextual welcome and Snake tips, taskbar hide/reopen behavior, and the definite-iPhone alert reaction at 92% integrity.
- Mobile Chrome at 375 × 812: confirmed the helper and taskbar remain inside the viewport with zero horizontal overflow.
- Alert geometry check confirmed the temporal warning and raised ChronoClip do not overlap.

**Remaining risk:** Browser and speaker differences affect the exact sound of synthesized Web Audio. Playback is deliberately tied to the visitor’s **Enter December 1998** gesture, but visitors can keep sound off, mute during negotiation, or skip the transition entirely.

## 2026-07-15: Expanded 1998 desktop and guided mission

**Goal:** Add the full set of playful late-1990s staples while turning Chrono’s existing evidence, character, integrity, and game mechanics into one coherent guided experience.

**Decision:** Made Mission Control the connective layer. Its five tasks complete only when the visitor performs the associated action in ChronoNet, Sam’s chat, or Snake ’98. The surrounding mail, music, buddy-list, screensaver, and Easter-egg features are dependency-free reconstructions with original content and explicit fictional or representative labels.

**Implemented:**

- Added **First Night in 1998**, a five-step mission spanning the NASA STS-88 page, Sam’s GeoCities page, a message to Sam, one collected Snake pixel, and one Time Integrity event. Progress is session-local, duplicate-safe, and ends with a Certified Time Traveler badge.
- Added **Inbox ’98** with five selectable messages covering fictional social atmosphere, a representative ISP welcome, chain mail, Y2K concern, and period spam.
- Added **ChronoAmp** with three original Web Audio tracker loops, track switching, stop/play controls, volume, playlist labels, and a synthesized visualizer.
- Added a four-person fictional **Buddy List** with away messages, profiles, and a direct route into Sam’s existing conversation.
- Added an original flying-clocks screensaver that exits on click or keypress.
- Added two discoverable Easter-egg paths: five taskbar-clock clicks and the classic keyboard sequence. Either unlocks a Developer Vault icon and secret system message.
- Expanded ChronoClip with mission, inbox, player, buddy-list, and secret-vault tips; expanded the desktop to a responsive two-column icon layout and compact mobile grid.
- Added a standalone mission model and two focused progress tests. The full suite now contains 22 tests.

**Validation:**

- `npm test`: 22 tests passed.
- `npm run lint`: passed.
- TypeScript no-emit check: passed.
- `npm run build`: passed with the static experience and dynamic chat route generated successfully.
- Rendered desktop flow completed all five missions from their actual app interactions and displayed the certificate at 5/5. Snake reported score 10 and length 4.
- Rendered app checks confirmed five inbox messages, three playable ChronoAmp tracks, four fictional buddies, 14 screensaver flyers, screensaver exit behavior, both the tenth normal app icon and unlocked eleventh Developer Vault icon, and no browser exceptions.
- Desktop and 375 × 812 mobile checks found no horizontal overflow. Mobile-specific single-column Inbox and Buddy List layouts, compact icon grid, fixed taskbar, scrollable mission panel, and viewport-fixed screensaver were verified.

**Remaining risk:** These additions deliberately favor a dense, playful desktop. On small screens the app grid uses two rows (three after the secret is unlocked), and longer app content scrolls inside its window. Mission and Easter-egg state remain session-local and reset on reload.

## 2026-07-15: Archive Lens and free-tier live character path

**Goal:** Connect Chrono’s reconstruction to surviving web captures and provide a useful live character option when the OpenAI account has no API quota.

**Decision:** Added the Wayback Machine as an explicitly modern research layer rather than placing it inside the fictional 1998 world. Added Gemini as a server-only provider with explicit selection; `gemini` and `openai` modes never silently fall through to one another, while `auto` prefers Gemini. The deterministic engine remains authoritative and is always the final fallback.

**Implemented:**

- Added an Archive Lens page to ChronoNet with four curated starting points, one exact verified Yahoo! capture from February 10, 1998, a validated arbitrary-URL explorer, third-party attribution, and capture-completeness warnings.
- Avoided a runtime dependency on the Internet Archive API; the archive index was slow during validation, while direct links keep Chrono responsive and its local reconstruction available.
- Added Gemini REST generation with JSON Schema output, bounded transcripts, a 20-second timeout, provider-specific failure classification, server-side key handling, deterministic assessment matching, and the existing period-safety guard.
- Added explicit provider selection and documented the no-billing-required Gemini free tier, its rate limits, and its free-tier data-use tradeoff.
- Added focused tests for provider choice and Archive Lens URL validation without adding a production dependency.

**Validation:**

- `npm test`: 29 tests passed, including four provider-selection checks and three Archive Lens URL checks.
- `npm run lint`: passed.
- TypeScript no-emit check: passed.
- `npm run build`: passed; the static experience and dynamic chat route compiled successfully.
- Secret handling review confirmed both provider credentials are read only inside the server route, `.env.local` remains gitignored, and no credential value appears in the patch.

**Remaining risk:** Wayback captures are externally hosted and may be incomplete or unavailable. Gemini free-tier capacity and model availability can change, and Google states free-tier content may be used to improve its products. Deterministic Sam preserves the core demo in both cases.

## 2026-07-16: Sam dialogue calibration pass

**Goal:** Correct dialogue that guessed invented meanings for future terms, overlooked pre-1998 source material, denied real 1998 research, or lost the conversational topic after a future-dated correction.

**Decision:** Treat historical calibration as a server-verified constraint rather than relying on prompting alone. The live model may phrase Sam naturally, but Chrono rejects speculative categorization and known misreadings, then uses a topic-aware deterministic response.

**Implemented:**

- Instructed Sam not to invent categories for unknown names and not to repeat internal assessment labels as dialogue.
- Added explicit calibration anchors for the 1996 novel *A Game of Thrones*, its distinction from a future television adaptation, and the real but experimental state of quantum computing in 1998.
- Added a definite `future-dated-claim` integrity concept for statements such as “It’s a new show in 2019,” while leaving ordinary questions about a future year harmless.
- Added contextual fallback replies that preserve the active topic and use the traveler’s wording rather than labels such as “modern generative AI” or “modern smartphone.”
- Added a dialogue-calibration guard that rejects invented guesses about contaminated terms, misclassifying *A Game of Thrones* as a game, denying that quantum computing was real, or dropping the novel context during the 2019 follow-up.
- Added five regression areas based directly on the reported conversation.

**Validation:**

- `npm test`: 34 tests passed.
- `npm run lint`: passed.
- TypeScript no-emit check: passed.
- Live Gemini replay of the six supplied prompts kept all historical distinctions and conversational context intact. Calibration-rejected ChatGPT and iPhone guesses safely used neutral deterministic responses.

**Remaining risk:** An open-ended fictional character can still vary stylistically. The guard targets factual and conversational failure modes rather than forcing every response into one script, and the deterministic fallback remains intentionally concise.

## 2026-07-16: Technical knowledge and achievement specificity

**Goal:** Stop Sam from inventing family anecdotes or personal coding experience, treating established languages as new, using Y2K anxiety as an achievement, and describing later STS-88 mission events as already complete.

**Decision:** Added a small set of date-specific technical anchors and reusable achievement-topic checks. Broad achievement answers must name multiple concrete examples, respect the exact December 4 mission state, and introduce at least one new topic when the traveler asks again.

**Implemented:**

- Calibrated COBOL as an established business/mainframe language relevant to Y2K remediation without calling it dead, ancient, or something Sam knows through an invented relative.
- Distinguished established C++ and 1991-era Python from the newer Java and JavaScript options a 1998 teenager could plausibly recommend.
- Prevented technical recommendations from inventing personal projects or experience not established in the transcript.
- Anchored STS-88 to the selected date: Zarya is already in orbit and Endeavour launched Unity on December 4, but their orbital mating remains in the future.
- Added concrete, additive achievement sets spanning the early ISS, the Web, Human Genome Project, Mars Pathfinder, Deep Blue, and Dolly.
- Added regression tests based directly on the four reported prompts and their repeated-achievement flow.

**Validation:**

- `npm test`: 37 tests passed.
- `npm run lint`: passed.
- TypeScript no-emit check: passed.
- Live Gemini replay returned grounded COBOL and Java/JavaScript answers; both achievement prompts used safe deterministic responses with distinct named examples.

**Remaining risk:** Sam's broad historical answers remain a curated conversational sample rather than an exhaustive history of the 1990s. The source-backed Time Capsule remains the authoritative path for deeper factual detail.
