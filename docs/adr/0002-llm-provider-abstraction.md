# ADR-0002: Pluggable LLM provider with server-side key management

## Status
Accepted

## Context
The SRRO/CRRO register requires AI generation. The existing `api/hazard.ts` Vercel Edge function established the pattern of keeping the Anthropic key server-side. The project also anticipates AWS Bedrock as a future provider. Local development must work without a valid API key.

## Decision
`server/src/llm/index.ts` exports a single `callLLM()` function. Provider is selected at runtime via the `LLM_CLIENT` environment variable (`anthropic` | `bedrock` | `mock`). The Anthropic key (`ANTHROPIC_API_KEY`) and model (`ANTHROPIC_MODEL`) are read from the root `.env` file, never from the client. `mock` returns deterministic fixture data for offline development and testing. `bedrock` is stubbed and throws `NotImplemented`.

## Consequences
- Swapping from Anthropic to Bedrock requires only an env var change and implementing the bedrock branch in `llm/index.ts`
- No API key is ever exposed to the browser
- `mock` mode makes the SRRO generation testable without network calls or spend
- All AI routes are server-only; the client calls `/api/srro/generate` via the Vite proxy
