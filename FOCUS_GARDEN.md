# Focus Garden in Expo Go

This is the native port of `focus-garden-handoff`. It keeps the supplied garden
and plant artwork and pure focus rules, with original layered pixel characters,
walking animal pets, and a bundled pixel font. The existing Explore screen is available from
Garden settings (the `···` button at the end of the scrolling toolbar).

## Launch on your phone

Run these commands in PowerShell:

```powershell
cd C:\Users\willi\Documents\focus_garden\focus-garden
npx expo start --go
```

Open the QR code with an Expo Go version supporting this project's Expo SDK 57.
Keep the phone and computer on the same Wi-Fi. Turn the phone to landscape if
the host does not rotate automatically. The app also requests landscape at
runtime. The background fills the entire landscape viewport; buttons respect
safe areas. Android's navigation bar is hidden and iOS prefers a hidden home
indicator. The bottom toolbar scrolls horizontally
on smaller phones and the panels scroll vertically.

Quick play starts enabled: one focus minute takes one second. Turn it off before
planting for real minutes. The switch is locked until the current plant has been
harvested or kept. Sunflower always requires separate manual starts for its
45-minute focus, 10-minute break, and second 45-minute focus.

## Save behavior

Progress lives in memory. It survives route changes and backgrounding while the
app process remains alive. Foregrounding checks the current phase's deadline;
paused time stays paused. Reloading JavaScript or restarting the app process
resets all progress. Fast Refresh can also reset state when component signatures
or the root change. There is no persistent save, account, or server.

## Wardrobe and pets

Open **Wardrobe** to mix five independent slots: hats, tops, pants, glasses and
gear. Tap a piece to preview it; **Buy & wear** spends coins once, and **Wear**
switches owned pieces for free. Chef, wizard, astronaut and athlete pieces can
all be mixed. Gear includes a watering can, frying pan, spatula, basketball,
football, tennis racket, star wand and explorer backpack. The **Outfit sets**
tab keeps the original six sets; buying one also unlocks its individual parts.

Open **Pet cottage**, adopt the free Marmalade cat, select **Place in garden**,
then tap the highlighted grass. Pets roam around the growing fence, turn,
pause, and animate their tiny legs. More species unlock as you level up: bunny,
puppy, hen, duck, fox, piglet and turtle. Up to five can roam together. Tap a pet
or reopen the cottage to move it or let it **Rest in cottage**. Resting and
repositioning preserve ownership and cost no coins. Pets award no focus XP.

The gardener uses a 24 × 32 source pixel canvas with separate clothing layers
and four walking frames. Pets use a 24 × 22 canvas. Native rectangles render
the art at whole-number scales, so no custom native graphics module is needed.
Timers keep their original study, watering, pause and harvest behavior.

The bundled [Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans)
font is distributed under the SIL Open Font License; its license is included
in `assets/fonts/PixelifySans-OFL.txt`. `expo-navigation-bar` is included in Expo Go.

## Make the next small edit

For example, change `Your private garden` in `src/app/index.tsx` to another
subtitle, save the file, and watch Expo Go update through Fast Refresh.

- Main scene and HUD: `src/app/index.tsx`.
- Colors, font, wooden panels, and buttons: `src/components/garden/garden-ui.tsx`.
- Seed shop, wardrobe, display collection, and stats: `src/components/garden/garden-panels.tsx`.
- Timer and harvest controls: `src/components/garden/growing-panel.tsx`.
- Walking, study, watering, and hops: `src/components/garden/gardener.tsx`.
- Original pixel sprite layers and walking frames: `src/game/pixel-art.ts`.
- Pixel rendering: `src/components/garden/pixel-sprites.tsx`.
- Pet roaming: `src/components/garden/pets.tsx`.
- Fenced growing bed: `src/components/garden/growing-plot.tsx`.
- Full-screen geometry and pet paths: `src/game/garden-layout.ts`.
- Level-up card and confetti: `src/components/garden/level-celebration.tsx`.
- Atlas cropping and bundled image paths: `src/components/garden/sprites.tsx`.
- Timer lifecycle and shared in-memory state: `src/game/garden-provider.tsx`.
- Focus rules: `focus-garden-handoff/shared/garden.ts`.
- Clothing catalog, pet catalog, and guarded customization actions: `src/game/garden.ts`.

Do not remove the handoff's `shared` or `assets` directories: the native app
imports them directly. The browser reference is excluded from native typecheck
and lint; its browser libraries are not app dependencies.

## Checks

```powershell
npm run typecheck
npm run lint
npm run check:gameplay
npm run check:timers
npm run check:customization
npx expo install --check
```

`check:gameplay` runs the supplied 175 checks. `check:timers` covers long
background gaps, manual Sunflower transitions, late pause, paused breaks, and
real focus credit. Type stripping requires a recent Node version (this project
was checked with Node 22.13).

`check:customization` covers independent outfit slots, level/coin/ownership
guards, outfit set restoration, pet adoption and placement limits, storage,
retained harvest rewards, actual leg changes in animation frames, pixel
coordinates, and full-screen geometry at phone and tablet aspect ratios.

Validation performed for this port:

- TypeScript, Expo lint, all 175 supplied gameplay checks, and the added timer
  edge cases passed. Expo's package compatibility check passed for SDK 57.
- Local Android and iOS production bundles exported successfully. These are
  compilation checks, not signed native builds or store submissions.
- Expo Go ran on the configured `Medium_Phone_API_37.0` Android emulator. Native
  smoke tests covered landscape rendering, atlas crops, planting, keeping the
  first Carrot (40 coins / 60 XP), harvesting the second (69 coins / 120 XP),
  level 2 and Strawberry unlock, and the vegetable/fruit catalog, wardrobe,
  eight-space display collection, and stats panels. Stats showed one harvest,
  one kept plant, and 40 seconds of demo focus. Screenshots are in the ignored
  `.expo/garden-*.png` files.
- No physical phone or iOS simulator was tested. Sunflower phase behavior,
  outfit purchases, display replacements, pause/resume, and background gaps were
  verified with the gameplay checks; they were not all exercised through native
  taps. Use the phone checklist below for those device checks.

## Phone verification

1. Confirm the landscape garden, font, eight display spaces, main plot, and
   readable HUD. Open each panel and scroll the seed catalog and toolbar.
2. In Quick play, plant a starter Carrot. Pause, leave the app for a few seconds,
   and return: time should stay paused. Resume, then background past its deadline
   and return: it should be ready. Watch the gardener study, leave the empty
   table, water the plant, and return.
3. Keep the first Carrot: 40 coins, 60 XP, one kept plant, zero harvests. Harvest
   the second: 69 coins, 120 XP, one harvest, level 2, Strawberry unlock, and a
   level-up celebration. Repeated taps must not award another reward.
4. Move the kept plant, store it, and place it again. Coins and XP stay unchanged.
   Once two plants are kept, replace an occupied space and confirm both remain
   in the collection.
5. Check locked seed and outfit purchases. At level 2, Rainy day costs 40 coins;
   switch back to Meadow and then Rainy day for free.
6. Turn Quick play off with an empty plot and plant a Carrot: the timer starts at
   20:00. Changing speed is disabled throughout the session.
7. At level 9, buy Sunflower. In Quick play, its phases last 45s, 10s, and 45s.
   The first focus waits for Start break, the break holds growth at 50%, and the
   second focus waits for Start focus session. Completing it counts 90 seconds
   of demo focus, excluding the break. Normal mode counts 90 real minutes.
8. Reload the app to confirm the documented reset behavior.
9. Check the background reaches both sides of your phone while the buttons stay
   clear of the notch. Open Wardrobe, preview chef/wizard/space/athlete pieces,
   buy unlocked parts, mix slots, and restore an owned set without paying again.
10. Adopt the free cat, tap the grass to place it, and watch its legs and direction
    change as it roams. Rest it in the cottage and place it again. Try the next
    unlocked species and check that locked pets cannot be adopted.

## Files changed for the port

- `app.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.js`.
- `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/shop.tsx`, `src/app/settings.tsx`.
- `src/game/garden.ts`, `src/game/garden-provider.tsx`.
- All six files under `src/components/garden/` listed above.
- `src/hooks/use-color-scheme.web.ts` (starter hydration lint fix).
- `src/components/garden-plot.tsx`, `src/components/timer.tsx` (unused import cleanup).
- `scripts/check-native-timers.mjs`, `FOCUS_GARDEN.md`, and the README link.

The handoff's game logic, assets, reference, and supplied tests are unchanged.
Nothing is deployed or published by these commands.

## Pixel garden update (October 4, 2026)

Changed `src/app/index.tsx` and `_layout.tsx` for the viewport and system bars;
`garden-ui.tsx` for pixel fonts, stepped frames, bevels and switches;
`garden-panels.tsx` for the modular wardrobe and pet cottage;
`gardener.tsx`, `sprites.tsx` and `growing-panel.tsx` for the new art and layout;
and `garden-provider.tsx` / `level-celebration.tsx` to keep catalog previews
independent of the clock. New files are `pixel-art.ts`, `garden-layout.ts`,
`pixel-sprites.tsx`, `pets.tsx`, `growing-plot.tsx`, the font/license assets, and
`scripts/check-customization.mjs`. `garden.ts` adds catalogs and guarded actions
around the original focus reducer. Package files, `app.json`, `tsconfig.json`,
and the timer verification script also changed.

Typecheck, lint, the original 175 gameplay checks, timer checks, customization
checks, and SDK dependency compatibility pass. Android and iOS production
JavaScript bundles were exported locally. The Android emulator's Expo Go
session was checked for full-screen rendering, pixel font/frames, wardrobe
categories and scrolling, buying glasses for 8 coins (40 → 32) while preserving
other clothing slots, free cat adoption, grass placement, roaming, and the
customized gardener studying at the new table with the fenced growing plot,
and the timer reaching Ready to harvest. Harvesting awarded 29 coins and 60 XP
(32 → 61 coins) while keeping the glasses equipped.
Additional mixed sets, all animal leg frames, locks, pet limits/storage and
harvest preservation are covered by automated checks. Native screenshots are
in ignored `.expo/pixel-*.png` files. No physical phone or iOS simulator was
tested. A full reload was used after changing component exports during Fast
Refresh; final clean loading succeeded.
