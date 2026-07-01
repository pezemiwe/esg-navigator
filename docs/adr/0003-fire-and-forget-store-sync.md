# ADR-0003: Fire-and-forget Zustand-to-API synchronisation

## Status
Accepted

## Context
All application state lives in a single Zustand store with `persist` middleware (localStorage key `"sustainability-storage"`). Adding server persistence without rewriting every consumer would require either converting all actions to async (breaking every call site) or introducing a separate sync layer.

## Decision
Store actions remain synchronous from the caller's perspective. After each `set()` call that mutates persisted state, an async IIFE fires a corresponding API call in the background. localStorage is the primary cache and the source of truth for reads; the server is a durable backup. `loadProject` reads from localStorage only for now.

## Consequences
- No call-site changes required across the app — all existing components continue to work unchanged
- A user can lose server-side changes if they close the tab before the async call settles (acceptable for the current local/dev-only stage)
- Conflicts between tabs or devices are not resolved — last write wins at the API level
- Migrating to fully server-driven reads (e.g. `loadProject` from DB) is a future step that requires converting `loadProject` to async and updating call sites
