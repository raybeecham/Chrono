# Chrono repository instructions

## Product goal

Build a memorable, runnable OpenAI Build Week prototype that lets a judge enter December 1998, explore an era-specific interface, converse with a period-aware character, and trigger the Time Integrity Engine by introducing future knowledge.

## Engineering rules

- Keep Chrono as one deployable Next.js application unless a separate service is clearly necessary.
- Use TypeScript with strict typing. Avoid `any` unless an external boundary makes it unavoidable and document the reason.
- Keep OpenAI API calls server-side. Never expose or commit API keys.
- Preserve deterministic demo fallback behavior so judges can test the core experience without configuring an API key.
- Prefer platform APIs and existing dependencies before adding a new production dependency.
- Keep the 1998 vertical slice polished before adding another era.
- Clearly distinguish documented historical context from AI-generated reconstruction.
- Maintain keyboard accessibility, visible focus states, responsive layouts, and reduced-motion support.

## Required validation

Before opening or updating a pull request, run:

```bash
npm run lint
npm run build
```

## OpenAI integration

- Use the Responses API.
- Default to `gpt-5.6`, configurable through `OPENAI_MODEL`.
- Use structured outputs for period-character replies and temporal-contamination metadata.
- Keep prompts concise, auditable, and scoped to the selected historical date.

## Hackathon evidence

Update `docs/build-log.md` after meaningful Codex work. Record the problem, the implementation decision, validation performed, and any remaining risk. Keep the primary Codex task active so the final `/feedback` session ID represents the majority of the core implementation.
