# Chrono

> **Don’t read history. Live it.**

Chrono is an AI-powered time machine that turns historical knowledge into an immersive, interactive experience. The OpenAI Build Week prototype sends visitors to **December 4, 1998**, where they can browse a reconstructed early web, explore everyday technology, and talk with a period-aware AI character.

The signature mechanic is the **Time Integrity Engine**. Mention an iPhone, YouTube, Bitcoin, or another future concept to someone in 1998 and the timeline reacts.

## What is working now

- Cinematic destination selector and temporal modem transition.
- Responsive Windows 98-inspired interactive desktop.
- Early-web and time-capsule experiences.
- Period-aware character conversation powered by GPT-5.6.
- Structured detection of temporal contamination.
- Deterministic demo fallback when no OpenAI API key is configured.
- Server-side API integration so credentials never reach the browser.

## Architecture

```text
Browser
  └── Next.js App Router UI
        ├── Landing page and era transition
        ├── 1998 desktop experience
        ├── Time Integrity Engine UI
        └── POST /api/chat
              ├── OpenAI Responses API, GPT-5.6
              ├── Structured JSON schema output
              └── Local deterministic fallback
```

## Run locally

### Prerequisites

- Node.js 22 or newer
- npm
- Optional OpenAI API key

### Setup

```bash
git clone https://github.com/raybeecham/Chrono.git
cd Chrono
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Chrono works immediately in demo mode. To enable live GPT-5.6 character responses, add your key to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6
```

Never commit `.env.local` or an API key.

## Validate

```bash
npm run lint
npm run build
```

## Fast demo path

1. Select **Enter December 1998**.
2. Open **The Internet**.
3. Open **Talk to Sam**.
4. Ask: `What websites do you use?`
5. Ask: `Have you heard of an iPhone?`
6. Watch the temporal contamination warning and integrity score.

## Build Week scope

Chrono deliberately prioritizes one coherent era over many shallow demos. Planned expansions include multi-perspective historical events, primary-source citations, additional eras, and controlled alternate-history branches.

See [`docs/mvp.md`](docs/mvp.md) for the submission scope and [`docs/build-log.md`](docs/build-log.md) for the Codex implementation record.

## Historical-use note

Chrono combines curated historical context with clearly labeled AI-generated dialogue. It is an interactive reconstruction, not a substitute for primary sources.

## License

MIT
