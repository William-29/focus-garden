# Focus Garden — Expo conversion handoff

This folder contains the exact game logic and artwork from the private Focus Garden prototype, plus the current web screen as a visual reference. It is a conversion kit for Codex, not a runnable Expo project.

## Use it in your existing app

1. Download the ZIP and extract it.
2. Put the `focus-garden-handoff` folder inside your existing Expo project, beside its `package.json`. Do not put it inside `app` or `src/app`, where Expo Router could interpret reference files as app routes.
3. Open that Expo project folder in VS Code and open Codex.
4. Paste: "Read focus-garden-handoff/PORTING_PROMPT.md and implement this Focus Garden game in my existing Expo project."
5. After Codex finishes and fixes any errors, run `npx expo start --go` in the project terminal. Scan the QR code with Expo Go. Keep your computer and phone on the same Wi-Fi network. Physical iOS devices may require Expo CLI and Expo Go to be signed in to the same Expo account.
6. Continue asking Codex to edit your app. Expo Go's Fast Refresh shows code changes while the development server is running.

## Included files

- `shared/garden.ts`: framework-independent TypeScript reducer, timers, economy, 45 seed unlocks, outfits, display collection, and gardener activity schedule. Reuse this logic.
- `assets/`: original PNG artwork, the font, and atlas grid information.
- `reference-web/page.tsx`: current browser interface and interactions, to adapt to native components.
- `reference-web/globals.css`: colors, layout, sprite positioning, and animation reference.
- `reference-web/preview.jpg`: screenshot of the current garden.
- `verification/check-gameplay.mjs`: the 175 gameplay checks used on this version. These check pure game logic, not the native UI. With a recent Node version, run `node --experimental-strip-types focus-garden-handoff/verification/check-gameplay.mjs` from the Expo project root.

The reference interface uses browser HTML/CSS, shadcn, and browser APIs. Codex should implement the phone interface using React Native. The kit deliberately has no web package.json to replace the Expo app's dependencies, and contains no hosting credentials or authentication configuration.

## Current behavior

Carrot unlocks at level 1, Strawberry at level 2, Daisy at level 3, then Potato at level 4. The cycle continues to Orchid at level 45. One seed unlocks per level. Multiple levels gained in one reward unlock one seed for each level crossed.

Keeping a finished plant gives focus XP and zero coins. Harvesting gives coins and focus XP. Both complete the focus session exactly once. Kept plants are safe in a collection, can fill eight display spaces, and can be moved, stored, or replaced without further rewards. Replaced plants stay in the collection.

Six outfits unlock at levels 1, 2, 6, 12, 24, and 36. Purchased outfits can be equipped for free.

The web prototype starts with Quick play enabled: one focus minute lasts one second. Normal mode uses real minutes. Mode changes are disabled during a session. Sunflower has focus 45 minutes, break 10 minutes, focus 45 minutes, with manual starts between phases.

The gardener walks when idle or on a break, studies during focus, and periodically walks to water the plant and back. The normalized sprite atlas has four poses across and six outfits down; all cells are 256 by 256 pixels.

The current prototype's progress resets on refresh. Persistence has not been implemented in this version. Preserve the existing game rules and clearly report the native version's save behavior.

## Documentation

- Codex local editor workflow: https://learn.chatgpt.com/docs/codex/ide
- Expo Go and live changes: https://docs.expo.dev/get-started/start-developing/
- Expo orientation: https://docs.expo.dev/versions/latest/config/app/
- Screen orientation module: https://docs.expo.dev/versions/latest/sdk/screen-orientation/
