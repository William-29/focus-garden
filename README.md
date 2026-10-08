# Focus Garden

A landscape pixel-art focus game built with React Native, Expo SDK 57 and TypeScript. Plant a seed to start a focus session, grow it while studying, and harvest for coins and XP or keep it for display. The garden includes seasons, a wardrobe, roaming pets and a seed shed.

## Run locally

```powershell
npm install
npx expo start --go
```

Open the QR code using a compatible Expo Go app. See [FOCUS_GARDEN.md](FOCUS_GARDEN.md) for the phone setup, save behavior and game controls.

## Project structure

- `src/app/`: garden, seed shed and settings routes.
- `src/components/garden/`: native game interface and scenery.
- `src/game/`: game extensions, navigation, pixel art and personalization.
- `focus-garden-handoff/`: shared focus rules, crop artwork and original gameplay checks.
- `assets/`: app icons and bundled pixel font with its source and licenses.
- `scripts/`: game checks, font generator and pet-art review tool.

## Verify changes

```powershell
npm run lint
npm run typecheck
npm run check:gameplay
```

The other `check:*` scripts in `package.json` cover timers, customization, names, scene controls, navigation, the crop wheel and pets.
