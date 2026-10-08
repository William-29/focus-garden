# Focus Garden in Expo Go

This is the native port of `focus-garden-handoff`. It keeps the supplied garden
and plant artwork and pure focus rules, with original layered pixel characters,
walking animal pets, and a bundled pixel font. Garden settings opens from the
`···` button at the end of the scrolling toolbar.

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
indicator. The bottom toolbar scrolls horizontally on smaller phones and the
panels scroll vertically. Both bottom panels start folded. Tap **Tools** to
unfold the toolbar, or its down arrow to fold it into the selected seed again.
Each panel folds after five seconds without interaction; touching or scrolling
one resets only its own timer. A held touch keeps it open until released.
The focus timer remains available while the tools are folded. A compact ring
above the crop and inside the growing controls fills green as the plant grows,
with the remaining phase time in its center. It reads 00:00 and is fully green
when ready to harvest. Sunflower still waits for its manual phase starts.

The minus button on the growing panel minimizes it to a crop tile. During focus
the tile keeps the remaining time visible, and it shows Harvest ready at the
end. Tap it to restore all growing controls. The toolbar and growing panel fold
independently.

The top-left clock and date use your device's local time, beside the coin balance.
The garden name appears on a small wooden sign below the shed; tap it to rename.
Tap the season badge (or open Garden settings) to choose Spring, Summer, Autumn,
or Winter. Each choice changes the whole map: Spring's fresh green lawn and pink
tree, Summer's sunny green foliage and blooms, Autumn's golden lawn and copper
leaves, or Winter's snowy ground, trees, bushes, fences, shed and well roofs.
Winter turns the growing bed into a glass greenhouse with its crop still visible.
Five cherry petals, autumn leaves or snowflakes drift across the view; Summer
has clear skies. Effects pause in the background and keep their gentle falling
motion with the device's Reduce Motion setting. The season is your choice, independent of
the real date, and starts at Spring on a new install.

Choosing a season closes the chooser and shows a full-screen illustrated
cottage path until the new scenery has actually displayed. Weather and buildings
appear together when the cover clears. A failed load offers **Try again** and,
when available, a return to the previous season. Focus timing continues while
the scenery loads.

Tap the character's body for the wardrobe; its name tag still opens renaming.
Tap an empty main growing plot for a small crop wheel. Turn the wheel or use its
arrows to browse every crop in level order. The filters show All plants, Owned
seeds, Flowers, Vegetables, or Fruits. Swipe the filter row for the later tabs.
Unowned seeds show x0 with a gray tile and plant; locked seeds are also disabled.
Tap an owned, unlocked crop icon to plant it directly.
Each icon shows its seed quantity; large bags scroll through the wheel so every
crop remains reachable. Tap outside the wheel, its X, or Android Back to dismiss.
An empty bag offers a shortcut to the seed shed. The bottom-right planting controls
remain available. Tap any greenhouse bay for your displays, and the top-right
level/XP panel for the gardener profile. The profile
shows names, level progress, focus time, completed sessions, seeds, wardrobe
pieces, kept plants, and pets. The redundant display-house toolbar button is
removed. Action messages disappear after 2.5 seconds, including panel receipts.
Tap a ripe crop on the main plot to harvest it with the same rewards and crop
animation as the growing panel's **Harvest** button. Growing crops cannot be
harvested early; **Keep for display** remains in the growing panel.

Quick play starts enabled: one focus minute takes one second. Turn it off before
planting for real minutes. The switch is locked until the current plant has been
harvested or kept. Sunflower always requires separate manual starts for its
45-minute focus, 10-minute break, and second 45-minute focus.

## Save behavior

Progress lives in memory. It survives route changes and backgrounding while the
app process remains alive. Foregrounding checks the current phase's deadline;
paused time stays paused. Reloading JavaScript or restarting the app process
resets game progress. Fast Refresh can also reset state when component signatures
or the root change. The character and garden names, farmer choice and chosen season save separately on this device
using Expo Go's bundled AsyncStorage. There is no account or server.

Tap the wooden garden sign or the character's name tag to edit both names, then
choose **Save names**. You can also rename them from Garden settings. Names may
contain up to 24 characters for the gardener and 32 for the garden. Blank names
cannot be saved. Garden settings explains which data survives a reload.

The eight display spaces now share a glass greenhouse above the growing bed.
Tap any numbered bay to arrange kept plants. On narrow screens the bays scroll
horizontally; the collection panel also lists all eight. Growing crops draw an
immediate pixel sprout, gain leaves, and become mature plants. Atlas images use
Expo Image caching and retain a pixel plant fallback while loading or on failure.

## Wardrobe and pets

Open **Wardrobe** to mix nine independent slots: hats, hair, hair color, tops,
bottoms, glasses, masks, beards and gear. Tap a piece to preview it; **Buy & wear** spends coins once, and **Wear**
switches owned pieces for free. Chef, wizard, astronaut and athlete pieces can
all be mixed. Gear includes a watering can, frying pan, spatula, basketball,
football, tennis racket, star wand and explorer backpack. The **Outfit sets**
tab keeps the original six sets; buying one also unlocks its individual parts.
Sets preserve your hairstyle, hair color, mask and beard. **Preview without hat**
hides the hat only in the preview so hair is easy to compare; use **No hat** in
the Hats tab to remove it from the actual character.

Hair includes a tousled crop, soft bob, long waves, high ponytail, twin braids,
cloud curls, shaved head and the farmer's starter style. Seven hair colors also
color facial hair. Choose clean shaven, a short beard, full beard or moustache.
These choices and the mint/rose face masks are free from level 1. The trail
bandana costs 10 coins at level 2. Masks and glasses can be worn together.

Choose **Girl** or **Boy** at the top of the wardrobe, free at any level. The
choice saves locally. Both share the same head, clothing and animation anchors;
the starter hairstyle is long for the girl and short for the boy; a chosen
hairstyle and color remain equipped on either farmer. Starter bottoms switch
between skirt and trousers with the choice, while customized bottoms and all
other clothing remain equipped. Both free starter bottoms are also selectable
independently. Hat crowns, brims, hoods and helmets align to the shared head.

Open **Pet cottage**, adopt the free adult Clover dog, select **Place in garden**,
then tap the highlighted grass. Pets pick fresh reachable destinations on the grass or snow, walk around
buildings and scenery, turn, pause, and animate their tiny legs. The cat unlocks at level 2 and bunny at 3,
followed by hen, duck, fox, pig and turtle. Smaller puppies, kittens, baby bunnies,
chicks, ducklings, fox kits, piglets and turtle hatchlings unlock from level 10
through 36, always after their adult species. Up to five can roam together. Tap a pet
or reopen the cottage to move it or let it **Rest in cottage**. Resting and
repositioning preserve ownership and cost no coins. Pets award no focus XP.

The gardener uses a 32 × 36 source pixel canvas with a broad rounded head,
compact body, sloped shoulders, shaded hair, distinct clothing details and tiny
alternating feet. The world sprite is smaller than before, with source pixels
aligned to whole device pixels. All hats, clothing, glasses and gear use the
same anchors across idle, walking, studying and watering poses. The starter
look retains chestnut hair, a straw hat, blue blouse, denim skirt and boots.
Adult pets use a 32 × 32 canvas; babies use 24 × 24. Their detailed
front and side sprites follow the supplied farm-animal reference. Native rectangles render
the art, so no custom native graphics module is needed.
Timers keep their original study, watering, pause and harvest behavior.

The bundled Focus Garden Pixel font derives from
[Pixelify Sans](https://github.com/google/fonts/tree/main/ofl/pixelifysans).
It preserves the regular-weight letter shapes and spacing and redraws just the
digit **5** with a straight top bar and clear left stem. The original font,
SIL Open Font License (`assets/fonts/PixelifySans-OFL.txt`), and derivative notice
remain bundled. `scripts/build-garden-font.py` reproduces the derivative; the
app needs no Python or font tools at runtime. Reload Expo Go fully after a font
asset change because a loaded font alias does not refresh dynamically.
`expo-navigation-bar` is included in Expo Go.

## Make the next small edit

For example, edit the defaults in `src/game/personalization.ts`, save the file,
and watch Expo Go update through Fast Refresh. Previously saved names take
precedence over defaults.

- Main scene and HUD: `src/app/index.tsx`.
- Local clock, coins, season badge, XP and wooden sign: `src/components/garden/garden-hud.tsx`.
- Chosen seasons and decorative petals/leaves/snow: `src/game/seasons.ts`, `src/components/garden/season-weather.tsx`.
- Seasonal background images and generation prompts: `assets/images/seasons/README.md`.
- Scenery loading cover and readiness: `src/components/garden/season-loading.tsx`, `src/game/scene-transition.ts`.
- Original loading illustration and exact prompt: `assets/images/loading-cottage.png`, `assets/images/loading-cottage.md`.
- Saved farmer choice validation: `src/game/farmer.ts`.
- Foldable toolbar and seed pocket: `src/components/garden/garden-toolbar.tsx`.
- Independent panel inactivity timers: `src/hooks/use-idle-panel.ts`, `src/game/panel-idle.ts`.
- Transient feedback and expiration: `src/components/garden/garden-notice.tsx`, `src/game/notices.ts`.
- Colors, font, wooden panels, and buttons: `src/components/garden/garden-ui.tsx`.
- Seed shop, wardrobe, display collection, and stats: `src/components/garden/garden-panels.tsx`.
- Timer and harvest controls: `src/components/garden/growing-panel.tsx`.
- Walking, study, watering, and hops: `src/components/garden/gardener.tsx`.
- Original gardener layers and poses: `src/game/character-art.ts`.
- Gardener source dimensions and physical-pixel sizing: `src/game/character-metrics.ts`.
- Shared rectangle composer: `src/game/pixel-canvas.ts`; pets and other pixel art: `src/game/pixel-art.ts`.
- Pixel rendering: `src/components/garden/pixel-sprites.tsx`.
- Pet roaming: `src/components/garden/pets.tsx`.
- Fenced growing bed and winter greenhouse: `src/components/garden/growing-plot.tsx`.
- Direct planting wheel and rotation/inventory helpers: `src/components/garden/crop-wheel.tsx`, `src/game/crop-wheel.ts`.
- Display greenhouse and its numbered bays: `src/components/garden/display-greenhouse.tsx`.
- Gold coin and image-independent crop art: `src/components/garden/pixel-garden-art.tsx`.
- Name defaults and saved-data validation: `src/game/personalization.ts`.
- Full-screen controls: `src/game/garden-layout.ts`.
- Shared obstacle map and pathfinding: `src/game/garden-navigation.ts`.
- Interruptible farmer/pet walking: `src/hooks/use-garden-walker.ts`.
- Crop pop, sparkles and rewards: `src/components/garden/harvest-celebration.tsx`.
- Level-up card and confetti: `src/components/garden/level-celebration.tsx`.
- Atlas cropping and bundled image paths: `src/components/garden/sprites.tsx`.
- Visible plant bounds and centered placement: `src/game/plant-placement.ts`.
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
npm run check:personalization
npm run check:feedback
npm run check:seasons
npm run check:motion
npm run check:scene-ui
npm run check:character
npm run check:crop-wheel
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

`check:scene-ui` covers independent five-second panel timers, held touches,
scrolling, stale expiry callbacks and foreground expiry; scene readiness,
slow and failed loads, retries and rapid season changes; and uninterrupted
focus sessions with exactly-once harvest rewards during transitions.

`check:character` covers nine-slot independence, outfit previews matching worn
outfits while preserving personal features, distinct hair/mask/beard choices,
all 2,176 item/pose/farmer frames, short moving feet, and physical-pixel sizing.

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
10. Adopt the free adult dog, tap the grass to place it, and watch its legs and direction
    change as it roams. Rest it in the cottage and place it again. Try the next
    unlocked species and check that locked pets cannot be adopted.
11. Tap the garden sign or gardener's name tag, edit both names, and save.
    Check that blank names disable Save and that a process restart retains the
    names while resetting game progress. Check typing with the landscape keyboard.
12. Plant a carrot and watch its immediate two-leaf sprout, four-leaf stage,
    growing mature plant, and ripe plant. Keep it and confirm that it appears in
    greenhouse bay 1; tap a numbered bay to move or store it through the collection.
13. Buy a seed and check that the feedback disappears after 2.5 seconds without
    leaving a blank banner. Repeat the same purchase to get a fresh message.
14. Fold the bottom toolbar with its down arrow. Tap the character's body for the
    wardrobe, its name tag for names, an empty growing bed for the seed shed,
    a greenhouse bay for displays, and XP for the gardener profile. Close each
    panel and check the toolbar stays folded. Tap the Tools seed to unfold it.
15. In the profile, scroll through level, XP, completed sessions, focus time,
    inventory, wardrobe, and pets. Check the corrected 5 in the 45-level total.
16. Minimize the growing panel before planting and during focus. The compact
    timer should keep counting, show ready at completion, and restore the
    harvest/keep buttons when tapped. It must not change the toolbar's fold state.
17. Choose Spring, Winter, Summer and Autumn using the season badge. Check the
    petals, snow, and clear skies respectively, and reload to confirm the choice
    persists. The date/time stays real, and an active focus timer stays intact.
18. Open both bottom panels at different times and leave them alone: each folds
    five seconds after its own last interaction. Touch and hold a panel beyond
    five seconds, then release; it should stay open for another five seconds.
19. Harvest a ripe crop by tapping it, then harvest another through the original
    panel button. Both show the crop/reward animation and award rewards once.
20. Switch seasons while a crop grows. The cottage loading illustration should
    cover the change until the complete new map is visible. The timer continues
    and the weather matches the revealed season.

## Files changed for the port

- `app.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.js`.
- `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/shop.tsx`, `src/app/settings.tsx`.
- `src/game/garden.ts`, `src/game/garden-provider.tsx`.
- All six files under `src/components/garden/` listed above.
- `scripts/check-native-timers.mjs`, `FOCUS_GARDEN.md`, and the README link.

The shared focus rules, active crop artwork and supplied gameplay checks are retained.
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

## Names, greenhouse, and crop visibility update (October 4, 2026)

The garden subtitle and character tag now open a compact, keyboard-aware name
editor. Settings has the same editor. Only names persist through AsyncStorage;
late startup reads cannot overwrite a newly entered name. The coin icon is
original shaded gold pixel art, shared by the HUD and catalog balances. The
eight display slots use matching glass greenhouse bays with wooden shelves and
pots. Narrow displays can scroll the bays horizontally.

Growing crops draw without waiting for an atlas: two-leaf sprout, four-leaf
sprout, then a progressively larger plant. Expo Image uses memory/disk caching,
keeps a native pixel fallback until its atlas displays, and restores the fallback
on image errors. Native growth and sway animations stop when focus is paused or
between phases. Focus timing and harvest rewards are unchanged.

Typecheck, lint, all 175 supplied gameplay checks, timer/customization checks,
the new personalization/fallback checks, and Expo dependency compatibility pass.
Android, iOS, and web production JavaScript exports succeeded. Android Expo Go
was checked for both tap-to-rename entry points, readable text fields above the
landscape keyboard, saving George / Clover Corner, and retaining both names
after force-stopping and reopening the app. Carrot screenshots show a sprout at
5%, extra leaves at 20%, a mature plant at 58%, a ripe plant, and a kept carrot
in greenhouse bay 1 with +60 XP and no coins. Screenshots are ignored local
artifacts under `.expo/names-*.png`. No physical phone or iOS simulator was tested.

## Toolbar and gardener profile update (October 4, 2026)

Feedback now lasts 2.5 seconds and fades before its banner is removed. Repeating
the same purchase restarts the notice; seed selection, name hydration, and quiet
timer ticks do not replay old messages. Expiry IDs prevent an older timeout from
clearing a newer notice, and foreground time checks hide notices that expired
while the app was in the background.

The bottom toolbar slides down into a Tools button showing the selected seed.
Its duplicate Display house button was removed. Character bodies open the
wardrobe, name tags retain the name editor, empty growing beds open the seed
shed, and greenhouse bays retain display access. The XP panel opens a gardener
profile with the existing progress and inventory statistics. The local font
derivative corrects the digit 5 while preserving the other regular glyphs.

Typecheck, lint, all 175 supplied gameplay checks, timer/customization and
personalization checks, and the new feedback reducer checks pass. Android,
iOS, and web production exports succeeded. Android Expo Go was checked for
folding and unfolding, folded-state persistence while visiting panels, each
scene shortcut, the name editor, purchase feedback appearing and disappearing,
and the corrected digit in seed and profile screens. Native screenshots are
ignored local artifacts under `.expo/toolbar-*.png`. No physical phone or iOS
simulator was tested.

## Study-garden scenery update (October 5, 2026)

The large title card is replaced by a small wooden garden-name sign below the
shed. A compact top-left HUD shows device-local time, weekday/date and coins;
XP stays clickable at the top right. The season badge opens a chooser, also
available in settings. Spring petals and Winter snow use native-driven,
non-interactive animations. Summer and Autumn leave the air clear. Only names
and the chosen season persist; the existing focus-progress save behavior stays
the same.

The gardener has long chestnut hair, a slimmer silhouette, a blue blouse, denim
skirt and boots. All hats, tops, bottoms and gear fit the redesigned walking,
watering and study poses. Adult and baby animal drawings have distinct species
features and moving feet. The free starter is an adult dog; cats and bunnies
unlock next, followed by other adults and eight later baby variants.

Growing crops use measured visible alpha bounds to center their artwork inside
the soil bed, preserving the center while scaling and swaying. The growing
panel independently minimizes to a crop tile with remaining time, paused/phase
status or harvest readiness; tapping it restores the controls.

Lint and typecheck pass. The 175 supplied gameplay checks, timer checks,
customization/personalization/feedback checks, and new season, local-midnight,
baby-pet progression and all-crop centering checks pass. A rendered sprite
catalog was visually reviewed. Android Expo Go was checked for the smaller HUD,
wooden-sign name editor, season chooser, Spring petals, Winter snow, clear
Summer skies, saved Winter after a process restart, both panels folded,
the running minimized timer, a centered mature carrot, restored harvest
controls and unchanged +29 coins / +60 XP rewards, and free adult-dog adoption
and placement. Screenshots are ignored `.expo/season-*.png` artifacts.
Android, iOS, and web production exports succeeded in `.expo/season-export`.
No physical phone or iOS simulator was tested.

## Full seasonal scenery and farmer choice (October 5, 2026)

The garden now swaps complete bundled scenery for each chosen season. The
original cherry-blossom map is Spring; matching Summer, Autumn and Winter
edits, their filenames and built-in imagegen prompts are recorded in
`assets/images/seasons/README.md`. Winter replaces the growing fence with a
snow-capped glass greenhouse and adds snow to the display-house roof. Growing
sprouts and mature crops stay visible and centered inside the greenhouse.

Weather uses five phased particles driven by one Reanimated UI-thread frame
clock. Autumn uses the pixel leaf drawing, Spring the cherry-blossom drawing,
and Winter small outlined snowflakes readable against the snow. They fall
continuously, drifting sideways and wrapping above the top after exiting below
the screen. Effects pause in the background. The slow falling motion remains
active with Reduce Motion enabled, as requested; there is no static-weather branch.

Girl and Boy choices live in the wardrobe, save via AsyncStorage, and share
clothing/head anchors. Every hat style was redrawn to sit on that head anchor.
The choice appears consistently in the garden, wardrobe, profile and settings.
Saved values are validated and late hydration cannot overwrite a new selection.

Validation: lint and TypeScript pass. Gameplay (175 checks), timer,
personalization, feedback, customization and season checks pass, including
both farmers' moving legs/all clothing poses, guarded farmer preferences,
custom-outfit preservation, immediate/sparse weather and unchanged focus state.
Android, iOS and web production exports succeeded in `.expo/scenery-export`.
Android Expo Go was visually checked for all four backgrounds, continuing
snowfall, final leaf/blossom art, both farmer previews, saved Boy after process
restart, and a visible winter sprout/mature carrot with the original +29 coins
and +60 XP harvest. Screenshots and the farmer contact sheet are ignored
`.expo/scenery-*.png` artifacts. No physical phone or iOS simulator was tested.

## Continuous weather, garden walking and harvesting (October 5, 2026)

Tap open grass or snow to send the farmer there. Another tap interrupts the
current walk and replans from the current position. After arriving, the farmer
pauses briefly and resumes wandering or the active focus-session activity.
Tapping a character, sign, empty plot, pet or display still opens its existing
control. Pets and the farmer choose random reachable destinations and variable
pauses, using a shared obstacle map for the shed, display greenhouse, growing
fence/winter greenhouse, well, trees and borders. Collision clearance includes
the whole sprite; routes do not cut diagonally through corners. Leaving the app
pauses walks, and returning resumes from their last position.

Harvesting or keeping a ripe crop produces a 1.7-second crop pop with pixel
sparkles, floating rewards and gold coins when harvested. The reward is applied
once, immediately; animation cleanup never changes progress.

`check:motion` verifies 1,728 routes at six viewport sizes, all four seasons,
adult/baby pet and farmer sizes, mid-walk rerouting, unreachable destinations,
varied wandering, ten-minute weather cycles and exactly-once harvest/keep
rewards. Lint, typecheck and the existing gameplay, timer, customization,
personalization, feedback and season checks also pass.

Android Expo Go checks confirmed moving/repeating Autumn leaves, Winter snow
and Spring blossoms, tap-to-walk on open ground, the adult dog roaming on
clear ground, and the harvest crop/coin/reward burst. Two carrot harvests
changed coins from 40 to 69 to 98 and XP from 0 to 60 to 120. A level-up
card now waits until the harvest burst has finished. Native screenshots are
ignored `.expo/motion-*.png` artifacts. The iOS production JavaScript bundle
exported successfully to `.expo/motion-export-ios`; no physical phone or iOS
simulator was tested.

## Tap harvesting, quiet panels and season loading (October 5, 2026)

Ripe main-plot crops now accept a tap to harvest, sharing the existing guarded
harvest action and celebration. Empty plots retain their seed-shed shortcut.
The original Harvest and Keep for display controls remain available.

The toolbar and growing panel start folded and each have an independent
five-second inactivity deadline. Touches, actions and scrolling refresh the
deadline; a held gesture cannot be interrupted by auto-folding. Expired panels
fold on returning from the background. Minimized timers continue to count.

Season changes show original bundled cottage-path artwork, generated with the
built-in imagegen tool; its exact prompt is in `assets/images/loading-cottage.md`.
The shared Expo Image background reports actual display readiness. A short
minimum presentation avoids flashes; slow loads retain the cover, and failures
offer retry or the last ready season. Request IDs discard old callbacks from
rapid changes. No new dependencies or custom native modules were added.

Validation: lint, typecheck, scene UI, feedback, motion, season, timer and all
175 supplied gameplay checks pass. An iOS production JavaScript export succeeded
in `.expo/scene-ui-ios`. Android Expo Go was checked for folded initial controls,
five-second growing-panel expiry while the focus timer continues, tap harvesting
with +29 coins / +60 XP, the original Harvest button bringing totals to 98 coins
and 120 XP, and the illustrated Winter-to-Summer transition revealing the
completed Summer map. The native JavaScript error log was clear. Screenshots are ignored `.expo/scene-*.png` artifacts.
No physical phone or iOS simulator was tested.

## Seasonal scenery visibility fix (October 5, 2026)

The seasonal background now mounts inside the garden screen, behind its world
objects and loading cover. It must not sit behind the root navigation stack:
the native navigator can cover that sibling image with its own background even
after the image reports that it displayed. The stack now uses an opaque base
color, so scenery no longer depends on navigator transparency. Only the image
inside the garden reports readiness to the existing loading state.

The garden is the router's anchor, keeping it mounted underneath directly
opened shop/settings modals. Reload Expo Go fully after this root-layout change.
Lint, typecheck and scene UI checks passed; the iOS production JavaScript
export succeeded in `.expo/scenery-layer-ios`. Android Expo Go checks confirmed
all four backgrounds with the opaque navigator base, the loading illustration,
and a cold settings deep link with the saved Autumn garden underneath. The
native JavaScript error log was clear. Screenshots are saved as ignored
`.expo/scenery-layer-*.png` artifacts. No physical iPhone was tested.

## Compact gardener and expanded customization (October 7, 2026)

The gardener is redrawn on a 32 by 36 source canvas with a wider rounded head,
shorter body, sloped shoulders, layered hair, small alternating boots, and clear
clothing details. It occupies less space in the garden, while the wardrobe
shows larger previews. Existing headwear and gear now fit shared head and hand
anchors in idle, walking, watering and studying poses. Collision geometry uses
the new visible dimensions, and the character retains a minimum 44-point touch
target for opening the wardrobe.

Hair, hair color, masks and beards are separate wardrobe categories alongside
hats, tops, bottoms, glasses and gear. Personal features remain equipped when
switching outfit sets or farmer styles. The preview can temporarily hide a hat
without changing the worn outfit. No new dependencies or image downloads are
required; the art is composed locally from colored pixel rectangles.

Typecheck, lint, character and customization checks passed again after resuming.
The character checks exercise 2,176 item/pose/farmer frames, separate clothing
slots, outfit preservation, distinct personal features and physical-pixel sizing.
The motion checks passed 1,728 routes using the new gardener dimensions; gameplay,
season, timer and scene UI checks also passed. The iOS JavaScript export completed
in `.expo/character-ios`. A sprite contact sheet and native garden preview are
available in ignored `.expo/character-preview.png` and `.expo/character-garden.png`.

The Android Expo Go emulator also verified the garden character, wardrobe opening,
the preview-only hat toggle, and equipping Soft bob while retaining the hat and
clothing. The final wardrobe screenshot is `.expo/character-final.png`. A physical
iPhone was not tested.

## Hat coverage, direct planting and grounded sign (October 7, 2026)

Headwear now clips the hair silhouette above its brim and along covered sides.
Hoods and helmets expose hair through their face opening and below the lower
edge. Front bangs and ear-level locks remain visible where appropriate; removing
the hat restores the full chosen hairstyle. The chef hat has a wider fitted band.

An empty growing plot opens a compact rotating crop wheel. It lists owned,
unlocked crops with quantities; swiping or using the arrows rotates through all
available types. A crop tap selects and plants it in one guarded action. Repeated
taps, unavailable seeds and occupied plots cannot spend an extra seed or change
an active focus session. An empty bag provides a seed-shed shortcut.

The wooden sign has inset edges, grain, knots, highlighted nails, a shaded post,
support brace, soil mound, stones and grass at its foot. Winter adds snow around
the base. The movement obstacle covers the taller sign and its grounded base.

Validation includes typecheck, lint, 2,176 character frames, 640 composited
hat/hair/pose/farmer combinations, all 45 crops reachable on the wheel, atomic
planting guards, existing customization and scene UI checks, and 1,728 movement
routes. Android Expo Go verified plot-to-wheel opening, direct carrot planting
and ripening, and swiping from Carrot to Strawberry in a stocked test garden
without accidental planting. The temporary inventory fixture was restored.
Screenshots are in ignored `.expo/crop-wheel.png`, `.expo/wheel-planted-now.png`,
and `.expo/wheel-rotated.png`. A physical iPhone was not tested.

## Compact sign, pet proportions and wardrobe naming (October 7, 2026)

The garden sign is now a small wooden board at the top fence opening above the
display houses. Rendering and navigation share its geometry. The former sign
obstacle is removed, so the farmer and pets can walk through the cleared space.

All sixteen adult and baby pets use new pixel sprites with larger rounded heads,
short torsos and identifiable ears, faces, tails, bills and shells. Separate feet
still animate through four walking frames. Their actual 48/40-point dimensions
are used by navigation, including collision checks around buildings.

The growing bed has raised timber edging, wood grain, stones, textured furrows,
soil crumbs, fence fasteners and a small seasonal flower. The winter greenhouse
adds a vent, framed door and handle. Crops remain centered and harvest/plant
interactions are preserved.

The wardrobe includes a character-name input and Save name button, using the
existing local name storage and validation. It preserves the garden name and
focus session. The following character label is now small gold pixel text with
a dark shadow and no box; its touch target remains at least 44 points.

Typecheck, lint, customization, personalization and crop-wheel checks passed.
Movement checks passed 1,728 routes with the updated pet sizes, including explicit
checks that the former sign space is reachable across seasons and screen sizes.
All sixteen sprites were visually reviewed together with the farmer in ignored
`.expo/pet-proportions.png`. Android Expo Go bundled successfully and the garden
preview confirmed the top sign, detailed plot and smaller floating name.
The Android wardrobe preview also confirmed the new Character name field and
Save name button. Existing saved names were left unchanged. A physical iPhone
was not tested. Native screenshots are in ignored `.expo/compact-scene.png` and
`.expo/wardrobe-name.png`.

## Seed filters, four-direction walking, and timer rings

The main crop wheel now includes all 45 plants in unlock-level order. Owned
shows all positive seed quantities; each category shows its full catalog. Empty
quantities render as x0, and gray entries cannot consume a seed. Planting still
uses the existing level, inventory and active-session guards.

The gardener uses a small ground footprint instead of reserving its entire
head height as blocked ground. More grass below the plot is reachable at
different heights. Tap walking, wandering and focus workstation routes use
only north, south, east and west segments, including after interruption.
The existing pet navigation and animation remain available.

The percentage label and plant growth bar are replaced by a 54-point timer ring
over the plot and compact rings in the expanded and folded growing panel.
Paused growth stays frozen and Sunflower break time still counts down without
growing the ring. Harvesting and keeping retain their existing rewards.

## Reference animal artwork

The sixteen existing pets now use new hand-pixelled sprites following the
provided farm-animal reference: tan floppy-eared dogs, gray/brown tabby cats,
warm brown rabbits, rust-colored hens, green-headed mallards, orange foxes,
rosy pigs and patterned green turtles. Babies use smaller canvases and softer
coats; chicks and ducklings stay yellow.

The pet cottage shows the front view. Roaming animals use the right-facing
profile or its left-facing mirror when walking horizontally, and the front
view for vertical movement and resting. Both views have four walking frames.
The adult/baby garden footprints remain 48/40 points, so existing placement
and obstacle handling still apply. Adoption costs, unlocks and owned pets
retain their existing behavior.

Art: src/game/pet-art.ts. Verification: npm run check:pets. The checks cover
all 128 front/side frames, pixel bounds, distinct babies, animated feet, world
sizes, and adoption/storage. A rendered sprite review sheet is saved in the
ignored .expo/pets-reference-preview.png.

The follow-up anatomy pass rounds the bodies and faces, shortens the paws,
widens the cat/fox ears and keeps necks, tails and feet joined in every pose.
Baby shapes are drawn directly on their own grid. Drawing guards reject any
shape reaching the canvas border before the pixel canvas can silently clip it.
The sprite checks now require a completely edge-connected silhouette and a
transparent border in all 128 frames, catching floating fragments as well as
clipping.

Regenerate both visual review sheets with:
node --experimental-strip-types scripts/render-pet-review.mjs
The reference sheet shows front, left and right adults/babies;
.expo/pets-all-frames.png shows every walking frame. Both were visually reviewed.
TypeScript, lint, pet art, customization and movement checks passed. Android
and iOS exports passed in .expo/pets-recheck-validation. This follow-up did not
run on a physical device.


## Pet movement matches the gardener

Roaming pets now use the gardener's cardinal pathfinding: each segment moves
north, south, east or west, with right-angle turns around obstacles. They also
use the same ten-source-pixel ground footprint rule, opening more walking rows
below the growing plot. Existing species speeds, pauses, directional art and
adoption/placement remain intact.

TypeScript and lint passed. Movement checks cover 3,096 cardinal routes for
the gardener, adult pets and baby pets across six viewport sizes and four
seasons, including interrupted routes and three reachable rows below each plot.
The existing 1,728 motion routes and gameplay checks also pass.


## Tap to stop and name a pet

Tapping a roaming animal now opens that pet's compact name editor instead of
the pet cottage. The selected walker stops at its native animation position,
its walking frames freeze, and the other animals keep roaming. Saving or
closing resumes cardinal wandering from the held position. The pet cottage
remains available from the toolbar, and adopted pets also have a Name pet button.

Custom pet names appear above roaming pets, in cottage cards, placement copy
and accessibility labels. Names accept up to 24 characters, normalize whitespace,
and reject empty values. Renaming preserves ownership, placement, coins, XP and
an active focus session. Pet names save in the existing device storage system
under focus-garden:pet-names:v1, independently of visit-only garden progress.
Delayed hydration merges saved names while preserving newer local edits.

Run npm run check:pet-naming for name validation, storage round trips, delayed
hydration, economy/focus preservation and the real walking hook exercised with
controlled native animation callbacks and timers. The checks cover stopped
positions, frozen frames, background/foreground, independent animals and
four-direction resume. TypeScript, lint, personalization, customization,
movement and feedback checks passed. Android and iOS exports passed in
.expo/pet-naming-validation. A physical-device interaction test was not run.


## Backdrop-only pet placement and no name tags

Floating pet name tags are removed. Tapping a pet still stops it and opens
the saved-name editor; cottage cards and accessibility labels retain its name.

Placing or moving a pet now hides the entire regular garden layer, including
controls, sign, plot, display houses, gardener, roaming pets, weather and
notifications. Only the seasonal backdrop remains. The hidden layer stays
mounted, with touches and accessibility disabled, so returning does not reset
working timers, walking or panel state. A transparent full-viewport touch
surface replaces the restricted rectangle and its placement help box.

A valid open-ground tap stores the chosen coordinates exactly and restores
the normal screen. Placement shares the roaming navigation footprint so a
newly placed pet does not snap elsewhere when the screen returns. Trees,
buildings, the growing plot and off-screen points remain blocked ground;
invalid taps leave placement active. The old normalized-coordinate clamp is
removed. Android Back and accessibility escape cancel without moving the pet.

Run npm run check:pet-placement. It verifies 31,824 ground spots across six
viewport sizes, four seasons and sixteen pets, plus screen callbacks for
backdrop-only placement, hidden input, automatic restoration and cancellation.
Naming, customization, movement, TypeScript and lint checks passed. Android
and iOS exports passed in .expo/pet-placement-validation. Screen behavior was
checked with controlled native component mocks, without a physical device.


## Vegetable-first seed shed and five-per-row option

Seed shed category buttons now read Vegetables, Fruits, Flowers. This is a
local display order; catalog IDs, prices and level progression are unchanged.
A 5 per row button switches between the original three-column view and a
compact five-column view. The choice remains while switching categories.

Card widths use the measured grid space with explicit gaps, so five cards
fit exactly on each row. Compact cards have smaller art and padding, shorter
purchase labels and the same seed quantities, focus times, harvest rewards,
prices, level locks and buying/selection actions. Other panel grids are unchanged.

TypeScript and lint passed. An in-memory rendering check exercised six grid
widths (340–760 points), both layout modes, category changes, carrot selection
and purchase, and locked flower seeds using the actual catalog. A physical
device appearance check was not run for this UI change.

## Project cleanup (October 8, 2026)

Removed the Expo Explore demo and its settings shortcut, unused starter components,
the old standalone garden prototype, superseded browser reference and character/
table/sprout assets, and the destructive starter reset script. The crop wheel now
keeps only the active catalog filters and planting checks. App icons, original
crop atlases, source font and licenses, game rules and verification tools remain.

Historical screenshots, temporary review scripts and exported bundles previously
mentioned in this guide were removed from `.expo/`; those earlier validation
notes describe past checks. Current Expo state and the font build tools remain.

Cleanup verification passed: lint, TypeScript, all 13 `check:*` scripts and local
Android, iOS and web production exports. The import audit found no missing local
imports or unreachable source files. Temporary verification exports were removed
after the checks. Approximately 612 MiB of obsolete files were deleted, mostly
past build bundles and previews. No device UI check was performed for this cleanup.

## Responsive garden controls (October 8, 2026)

The toolbar, growing controls and top HUD now use a shared scale based on both
viewport dimensions and safe areas. Buttons, labels, icons, timer rings, spacing
and wooden frames grow together, up to twice their phone size. The growing
panel has a readable minimum width and a capped maximum; the toolbar caps its
width and shares spare room between tool buttons. Short landscape windows keep
44-point button targets and scrolling. Resizing the browser updates the layout.

Verification: rendered button/font/frame dimensions and panel bounds passed
checks at six viewport sizes from 640×300 to 3440×1440, including phone safe
areas. Lint, TypeScript, all 13 game checks and Android/iOS/web production
exports passed. Live browser visual review was unavailable in this session.
Temporary check files and exports were removed after verification.

## Harvest-ready bell (October 8, 2026)

A short, original soft bell rings once when a crop becomes ready to harvest.
Ordinary ticks, panel changes and harvesting do not replay it; each subsequent
crop gets a new alert. Paused sessions and Sunflower intermediate phases stay
silent. The reducer retains the event through immediately harvesting a ready
plant. Rewards and manual phase starts are unchanged.

Native playback uses the bundled `assets/audio/harvest-ding.wav` with Expo Audio,
mixing with other audio. The plugin disables microphone permissions and
background playback. Web uses the matching generated bell and activates its
audio context from the planting click/tap. Hidden web tabs keep checking the
deadline, though browser timer throttling can delay the alert. On phones the
clock catches up, and the bell plays, when returning from the background; this
is an in-app cue rather than a scheduled system notification.

Lint, TypeScript, all 14 game-check scripts and Android/iOS/web exports passed.
`npm run check:completion-sound` covers all crops in both timer modes, pause/
resume, late completion, background catch-up, intermediate phases, repeated
ticks, immediate harvest/keep and bell asset integrity. Actual speaker playback
was not reviewed on a device. To check it, plant a Quick play Carrot, wait for
the timer to finish and listen for one bell, then switch panels and harvest to
confirm it stays silent until another crop completes.
