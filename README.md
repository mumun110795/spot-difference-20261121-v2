# spot-difference-20261121-v2

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mumun110795/spot-difference-20261121-v2/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mumun110795/spot-difference-20261121-v2/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Double Take — Postcards from Anywhere.** An original spot-the-difference game in flat vector art, drawn entirely in code: no images, no libraries, no network. Three postcards arrive in pairs — an ORIGINAL print and a SPOT THE CHANGES print that is never quite right. Find every difference before the clock runs out.

## How to play

- Click a difference in **either** panel. A thick green ring marks it on both prints, the FOUND pips fill in, and the big counter ticks down.
- A find scores **+100**. A miss costs **−25 points and −5 seconds** and flashes a red cross.
- Each postcard allows **3 hints** (−40 points each): a golden pulse glimmers around one hidden difference.
- Clear a postcard to earn a time bonus (+2 per second left) and 1–3 stars; run out of time and the postcard keeps its secrets — retry it or pick another.
- Keyboard: arrow keys move the crosshair (Shift = fine), **Enter** spots, **Tab** swaps panel, **H** hint, **M** mute. Mouse and keyboard can be mixed freely.
- All sound is synthesised live with WebAudio — find chimes, miss buzzes, a little win arpeggio. Nothing is a file.

## The postcards

| # | Postcard | Scene | Differences | Time |
|---|----------|-------|-------------|------|
| 1 | Coral Cove | A reef at noon | 8 | 4:00 |
| 2 | Pinewood Cabin | First snow at dusk | 9 | 4:30 |
| 3 | Rooftop Garden | Evening above the city | 10 | 5:00 |

The differences are fair but not obvious — things vanish, change colour, change state, slip sideways, or wander in: a fish that swam away and a clam hiding its pearl; a moon gone crescent, a campfire gone out, an owl that moved in; a cat that slipped away, one pink bulb in a string of lights, a ladder missing from a water tower. Every scene's differences are data — small edits (remove / recolor / variant / move / add) applied to one shared prop list — so the two panels always agree about everything except the intended changes.

## Screenshots

Real renders of the game in a browser at 1280×800, taken from fixed mid-game states (`game/src/shots.js` parks the game exactly where a player could be; nothing is composited):

1. `1-cover-coral-cove.png` — Coral Cove mid-round: 3 differences found and ringed on both panels, 5 still to find.
2. `2-pinewood-cabin.png` — Pinewood Cabin mid-round: 4 found, the crescent moon and dark window among them.
3. `3-rooftop-garden.png` — Rooftop Garden late-round: 7 found, 3 to find, clock in the red at 0:24.
4. `4-you-win.png` — the win card over the finished rooftop, every difference ringed, all pips filled.

## Self-test

Open `game/index.html?selftest=1` (via the server below) and the game plays itself: for every scene it takes a deliberate miss, spends a hint, spots all 27 differences through the same code path a click uses, and checks the clear and win states arrive. It reports `SELFTEST: PASS 20/20` in the page.

## Code map

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library.
- `serve.ts` — a tiny static server for playing locally (not part of the graded hand-in).
- `shots.json` — the screenshot names and the game states they are captured from.
- `vendor/makefun-game.ts` — the kit's dossier library, byte for byte as shipped.
- `game/index.html` — the page; loads only `style.css` and `src/main.js`.
- `game/style.css` — the dark room around the postcards: top bar, panel headers, FOUND pips, the big counter, cards.
- `game/src/scenes.js` — the three postcards as data: palettes, prop lists, and every difference as an edit plus a hotspot.
- `game/src/paint.js` — flat-shape painters: one backdrop and one painter per prop kind, all solid fills.
- `game/src/render.js` — draws a panel: backdrop, props, found rings, hint pulse, miss crosses, keyboard crosshair.
- `game/src/play.js` — the game controller: state, scoring, timer, hints, input (mouse + keyboard), level flow.
- `game/src/ui.js` — the HUD and overlay cards (title, clear, time up, win).
- `game/src/sound.js` — WebAudio-synthesised effects; no audio files.
- `game/src/shots.js` — the fixed states the screenshots are taken from.
- `game/src/selftest.js` — the built-in play-through described above.
- `game/src/main.js` — boot: plain play, `?shot=`, or `?selftest=1`.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser

# hand-in, exactly as the grader runs it:
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=vdsf53gd&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
