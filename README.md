# Teyvat Reset Countdown

A real-time, full-screen countdown to the Genshin Impact 7.2 reset on
**16 December 2026, 10:00 WIB (UTC+7)** — 42 days after 7.1. No HUD, no
settings, no pause, no reset: just the teaser backdrop, the digits, the
dissolving vapor and the only background music, the Genshin Impact 7.2 trailer
theme on YouTube.

## What it does

- **Cinematic canvas** — the original teaser backdrop behind the digits
  (firmament gradient, stars, emblem, light pillars), the upward vapor from
  every changed digit and the zero-point erase. No HUD, no labels, no prompts.
- **Real-time deadline** — the target is an absolute instant, so closing the
  tab, switching tabs or opening it in another country never changes the
  remaining time. It is simply rendered on each visitor's own clock.
- **YouTube score** — `72sAni41XTg` is loaded through the YouTube IFrame player
  and looped. It is the only audio source; there is no local fallback track.
  Browsers block audible autoplay, so the first click, tap or key press starts
  it silently.
- **Second tick** — every displayed second produces a tick that hardens as the
  clock runs down: soft blip, metallic click, sub-bass heartbeat, final
  double-beep inside the last minute.
- **Zero point** — at zero the digits dissolve and the screen whites out.
- **Auto-hiding control** — move the mouse (or tap) to reveal the mute button
  for a few seconds.
- **Forced fullscreen** — the page requests fullscreen on load and again on the
  first click, tap or key press. Browsers only grant fullscreen from a user
  gesture, so that first interaction is what actually enters it. iOS Safari
  does not support page fullscreen at all.

## Deadline

The anchor is `2026-12-16T10:00:00+07:00`, the end of the Asia maintenance
window (11:00 UTC+8) for the 7.2 reset. Because it is stored as an absolute
instant, every visitor counts to the same moment in their own clock.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run lint     # tsc --noEmit
npm run test     # node test runner via tsx
npm run build    # production build
npm run preview  # preview the production build
```

No API keys are needed.

## Controls

| Key | Action |
| --- | --- |
| `M` | Mute / unmute |
| `H` | Hide the controls |

The deadline, theme, vapor density, video id and tick are fixed in code:
`DEFAULT_TARGET_TIMESTAMP` in `src/utils/time.ts`, plus the constants in
`App.tsx`. There is no settings panel to change them at runtime.

## Project layout

```
src/
  App.tsx                         state, controls, audio unlock
  components/
    HoyoverseCountdownCanvas.tsx  canvas countdown and zero-point climax
  utils/
    sound.ts                      tick, glitch and zero-point synth
    music.ts                      YouTube player (only audio source)
    time.ts                       time math and presets
```

## Credits

Fan project. Genshin Impact and Teyvat belong to HoYoverse / miHoYo. The score
links to the official trailer theme on YouTube; the countdown is not affiliated
with or endorsed by HoYoverse.
