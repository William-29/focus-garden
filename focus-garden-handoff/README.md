# Shared game rules and artwork

This folder holds the original Focus Garden rules and the artwork still used by the Expo game. It is part of the running app.

- `shared/garden.ts`: focus sessions, timers, economy, 45 seed unlocks, outfits and display collection, extended by `src/game/garden.ts`.
- `assets/`: garden backdrop and flower, fruit and vegetable atlases. Grid information is in `atlas-info.json`. Characters, pets, the table and sprouts now use the pixel art in `src/game/`.
- `verification/check-gameplay.mjs`: original gameplay checks, run with `npm run check:gameplay` from the project root.
- `source-manifest.json`: original source provenance and hashes for retained files.

The superseded browser prototype and conversion instructions have been removed. See [the current game guide](../FOCUS_GARDEN.md) for behavior and verification.
