Implement the Focus Garden game in my existing React Native + TypeScript Expo project, so I can open it on my phone using Expo Go and continue editing it locally.

First inspect this project's current package.json, Expo SDK version, routes, components, app config, and any project instructions. Work within the existing project and preserve unrelated functionality. Read this handoff's README, shared/garden.ts, reference-web/page.tsx, reference-web/globals.css, assets/atlas-info.json, and preview.jpg. Use the supplied artwork and game rules instead of approximating them from the private website URL. The website is a visual reference; it is not the app runtime.

Implement the native version, do not stop at a plan. Reuse the pure TypeScript game logic. Adapt the browser interface using React Native components, native modals, ScrollView, Image/ImageBackground, and React Native Animated or an already installed Expo Go-compatible animation library. Keep dependencies compatible with this project's Expo SDK; install Expo packages with npx expo install. Avoid dependencies that require a custom development build for these prototype features.

Match the landscape pastel pixel garden, wooden HUD/panels, bundled font, and supplied sprites closely. Respect safe areas and touch targets on a real phone. Set landscape orientation in the existing app config. Use Expo Router screen orientation or Expo ScreenOrientation where needed and supported. Use the provided sprite grid information; crop atlas cells with an overflow-hidden View and appropriately scaled/offset Images, or preprocess the atlas into individual sprites. Do not use browser-only CSS, document, window, fullscreen, shadcn DOM components, or Sites authentication as the native app implementation.

Preserve all of these behaviors:
- One main growing plot and eight display spaces around it.
- Plant seed, run real focus timer, pause/resume, grow plant, then choose Harvest or Keep for display.
- Harvest awards coins and XP once. Keeping awards XP once, zero coins, and retains the plant in the collection. Display moves/storing/replacing never add rewards or destroy the replaced plant.
- 45 seed varieties and 45 levels. Unlock exactly one seed per level in vegetable → fruit → flower order. Start with Carrot; Strawberry at level 2; Daisy at level 3. Enforce purchase and planting locks.
- Seed shop with Flowers, Fruits, and Vegetables, durations, rarity, prices, inventory, coins, and XP rewards.
- Sunflower focus → break → focus sequence. No growth or focus credit during the break. Manual phase starts.
- Real deadline-based timers and Quick play demo mode. Catch up correctly when the app returns to the foreground; preserve paused time. Do not allow changing speed while a plant is active.
- Six garden outfits, level locks, coin purchases, free switching of owned outfits.
- Character walks around while idle, studies at a table during focus, periodically walks to water the plant, then returns. The empty table stays while the character is away. The supplied atlas includes seated poses with their table.
- Level-up celebration and a little celebratory character hop.
- Garden stats, next single seed unlock, focus time that excludes breaks, harvest count, and kept plant count.
- User wording: Growing, Plant seed, Ready to harvest, Focus session, Coins, Garden stats.

Keep the implementation understandable, split components where it improves readability, and match existing filename conventions. Do not deploy or publish the app or source publicly. Report save behavior accurately; this reference prototype currently resets on refresh.

Run the appropriate TypeScript checks and the supplied gameplay checks, fixing failures. Validate the native screens on an available Android emulator if present, and report what you actually tested. Then give me the exact command to launch it in Expo Go, list changed files, and explain how to make the next small edit. If no phone/emulator is available, say so and provide the phone verification steps instead of claiming native device validation.
