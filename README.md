# Chrono

> **Don’t read history. Live it.**

Chrono is an AI-powered time machine that turns historical context into an immersive, interactive world. This OpenAI Build Week 2026 prototype sends visitors to **Austin, Texas, on Friday, December 4, 1998** to explore a reconstructed early web, open an evidence-aware time capsule, and talk with Sam, a fictional 17-year-old whose knowledge stops at the selected date.

The signature mechanic is the **Time Integrity Engine**. Period-appropriate questions leave the timeline stable; subtle future language raises a warning; definite anachronisms reduce integrity. Repeating the same future concept is still recognized, but it is not charged twice.

## What is in the 1998 vertical slice

- A cinematic destination selector and skippable, synthesized dial-up modem handshake with sound controls.
- A responsive, keyboard-accessible Windows 98-inspired desktop.
- An original **ChronoClip** desktop helper with contextual app tips and Time Integrity reactions.
- An interactive Time Capsule with **8 categories, 20 facts, and 10 curated sources**.
- Explicit **Documented**, **Representative**, and **Fictional** grounding labels, confidence labels, expandable fact cards, and a source drawer.
- A navigable ChronoNet reconstruction with a directory, Yahoo!-style index, Sam’s fictional GeoCities page, a representative Ask Jeeves search, and a documented NASA STS-88 page.
- A playable **Snake '98** desktop game with keyboard, touch, pause, scoring, increasing speed, and session-best tracking.
- A five-step **First Night in 1998** guided mission that tracks real exploration and awards a session certificate.
- An **Inbox ’98** reconstruction with five labeled messages and a fictional instant-messenger buddy list.
- **ChronoAmp**, an original browser-synthesized tracker player with three copyright-safe loops.
- A flying-clocks screen saver, clickable-clock secret, classic keyboard-code Easter egg, and unlockable Developer Vault.
- A session-aware conversation with Sam, powered by GPT-5.6 when configured and by a deterministic local reply system otherwise.
- A three-tier integrity engine—**harmless**, **probable**, and **definite**—with canonical concept IDs and repeat protection.
- Visible loading, initial readiness, live/demo mode, fallback, contamination, and retry states.

Chrono is a historical reconstruction. Source-backed context is separated from representative synthesis and invented atmosphere; Sam’s dialogue is never presented as a primary source.

## Fast demo path

1. Turn sound on, select **Enter December 1998**, and let the temporal modem connect. ChronoClip appears with a welcome tip on the desktop.
2. Open **Time Capsule**. Expand **Endeavour leaves Earth**, select **View 1 source**, and show the NASA source card. Close the drawer, then select **Games** to show the Documented, Representative, and Fictional labels together.
3. Open **The Internet**, then select **NASA Shuttle Mission — live today** to show a documented ChronoNet page.
4. Open **Snake '98**, select **Start**, and make a few moves with the arrow keys or on-screen direction pad.
5. Open **Time Missions** to see the actions already recorded, then explore **Inbox ’98**, **ChronoAmp**, or the **Buddy List**.
6. Open **Talk to Sam** and ask `What websites do you use?`
7. Ask `Can I connect this laptop to the Wi-Fi?` to trigger a probable-anachronism warning.
8. Select `Have you heard of an iPhone?` to trigger definite contamination, then select it again to show that the concept remains flagged without reducing integrity twice.

For presenter narration and timing, use the [three-minute demo script](docs/demo-script.md).

## Run locally

### Prerequisites

- Node.js 22 or newer
- npm
- An OpenAI API key only if you want live GPT-5.6 replies

### Install and start

```bash
git clone https://github.com/raybeecham/Chrono.git
cd Chrono
npm install
npm run dev
```

Open `http://localhost:3000`. No API key is required: Chrono starts with the complete deterministic demo path available.

### Optional live GPT-5.6 mode

Copy the example environment file:

```powershell
# Windows PowerShell
Copy-Item .env.example .env.local
```

```bash
# macOS or Linux
cp .env.example .env.local
```

Then set the server-side values in `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6
```

Restart the development server after changing environment variables. `.env.local` is gitignored. The browser sends conversation state only to Chrono’s own `/api/chat` route; the route reads `OPENAI_API_KEY` on the server and calls the OpenAI Responses API. The key is never included in client code or browser requests.

## Validate

```bash
npm test
npm run lint
npm run build
```

`npm test` uses Node 22’s built-in test runner. The automated suite covers period-appropriate language, obvious and subtle contamination, ambiguous terms, alias grouping, repeat accounting, deterministic no-key replies, Sam’s transcript continuity, and the period-safety guard.

## Historical grounding

- **Documented** means the core historical claim is directly supported by the linked source.
- **Representative** means the detail is a period-informed synthesis, not a claim about every household or one documented individual.
- **Fictional** means the detail was invented to make Sam’s world feel inhabited and is not presented as historical fact.

For documented and representative facts, **High confidence** denotes clear, dated support and **Medium confidence** denotes a careful but interpretive synthesis. Fictional cards instead say **Not a factual claim**. A fact’s **View source** control narrows the drawer to its supporting record, while the category **Sources** control shows every reference used in that section. Source cards identify the organization, date, title, summary, and external publisher or archive link.

## Reliability behavior

- **No key:** the server returns a useful deterministic Sam reply with the same integrity metadata and the interface displays **Demo fallback**.
- **OpenAI unavailable:** authentication, rate-limit, timeout, incomplete, invalid, mismatched, or period-unsafe model results fall back to the deterministic reply instead of breaking the conversation.
- **Browser-to-server failure:** the user’s message stays in the transcript and a **Retry** control resends it without adding a duplicate user message.
- **Repeat protection:** canonical IDs group related terms such as iPhone and Android phone. A repeated concept is flagged with a zero delta; if the same message introduces a different new concept, that new concept can still reduce integrity.

OpenAI failures do not show Retry because the server has already returned a successful deterministic reply. Retry is a deliberate user action shown only when the browser cannot complete its request to Chrono’s route; requests are not replayed automatically. Fallback replies are intentionally more constrained than live GPT-5.6 conversation, but the historical boundary and the signature integrity demo remain available.

## How GPT-5.6 and Codex are used

**GPT-5.6 is the runtime character layer.** The server first classifies the latest user message with Chrono’s deterministic Time Integrity Engine. It then sends the bounded transcript, Sam’s December 4, 1998 instructions, and that authoritative assessment to the OpenAI Responses API. GPT-5.6 returns strict structured output containing Sam’s natural-language reply and the assessment fields it was given. The server verifies the classification, delta, concept, and repeat fields, applies a period-safety guard to the reply, and returns its own authoritative assessment; otherwise it uses the deterministic fallback.

**Codex is the development collaborator, not a runtime dependency.** It was used to audit the existing prototype, implement and test the historical grounding and integrity systems, preserve Sam’s continuity, improve reliability and accessibility, and maintain the build log and demo documentation. The resulting application runs as one standard Next.js project without requiring Codex.

## Architecture

```text
Browser
  └── Next.js App Router UI
        ├── Landing, synthesized dial-up transition, and 1998 desktop
        ├── Context-aware fictional ChronoClip helper
        ├── Static curated history and ChronoNet reconstruction
        ├── Dependency-free Snake '98 game
        ├── Action-tracked guided mission and session certificate
        ├── Fictional mail, buddy list, media player, and system extras
        ├── Time Integrity Engine state and warnings
        └── POST /api/chat
              ├── Deterministic authoritative integrity assessment
              ├── OpenAI Responses API / GPT-5.6 (when configured)
              ├── Structured-output and period-safety verification
              └── Deterministic Sam fallback
```

## Deliberate scope and limitations

Chrono focuses on one polished era and one fictional character. Historical sources are a static curated set rather than a retrieval system, conversation memory lasts only for the current browser session, and the integrity detector covers a tested catalog of future concepts rather than every possible anachronism. Live responses also depend on API access and can vary within the server’s constraints.

See [the MVP brief](docs/mvp.md), [the Codex build log](docs/build-log.md), and [the demo script](docs/demo-script.md).

## License

MIT
