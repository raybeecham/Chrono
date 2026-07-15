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
