---
name: one-prompt-reel
description: Make a 20-30 second launch film for a product that is not tied to one interface, such as a CLI, package, plugin or agent skill. The identical prompt or command is typed into four visually different surfaces in turn (a wide terminal, a tall chat card, a floating palette, an editor cell), the film then hard-cuts into a fast reel of real outputs on a beat or fixed tempo grid, and it closes on the command in a large pill. Delivered as a rendered 1920x1080 MP4 plus the editable HyperFrames project. Music is optional - with a track the cuts land on detected beats, without one they land on a 120 bpm grid.
---

# one-prompt-reel

The claim this film makes: "it works the same wherever you type it." The proof is repetition. One string, four unrelated-looking surfaces, then a burst of what it produced, then the string again.

## Inputs

| Input | Required | Notes |
|---|---|---|
| `prompt` | yes | The exact command or sentence. Under about 50 characters reads best; it is typed four times plus once more at the close. |
| `reel` images | yes | 16-24 real outputs: screenshots, product screens, stills pulled from earlier renders. Your own material only. |
| brand name, tagline, url | yes | Used on the closing card. |
| logo | no | Square PNG with alpha. Omit for a text-only close. |
| music | no | A track you are licensed to use commercially. If you are unsure of the licence, ship silent. |

## Workflow

1. **Scaffold.** Make a project folder, copy `template/` into it (`index.html` plus `assets/gsap.min.js`) and put the reel images in `assets/reel/`. Then:
   `npx --yes hyperframes check`
2. **Fill the CONFIG block** at the top of the `<script>` in `index.html`. Everything project-specific is there: `prompt`, `bpm`, `reel` file list, `brand`, `tagline`, `url`, `logo`. Do not restructure the rest unless a rule below forces it.
3. **Pick the cut grid.**
   - *No music:* keep `cuts: null`. Cuts come from `bpm` and `reelPattern` (default: 8 cuts of one beat, then 16 cuts of half a beat, at 120 bpm = 4 s + 4 s). Surfaces last `surfaceBeats` beats each, so the whole film stays on the grid.
   - *With music:* add the track as `<audio id="music" data-timeline-role="music" src="assets/music.mp3" data-start="0" data-duration="24" data-track-index="5">`, run `npx hyperframes beats`, open `beats/assets/music.mp3.json`, and copy the beat times (in seconds) that fall at or after the reel start into `CONFIG.cuts` (one extra entry marks the end of the last cut, which is when the close begins). Set `bpm` to the track's tempo so the typing section lines up too. If the beats are denser than 0.2 s, take every second one. Fade the music out over the final second (`/hyperframes-audio`).
4. **Look before rendering.** `npx --yes hyperframes snapshot --at 1.8,4.3,6.8,9.2,11,15,20,23` and open the PNGs. Check each surface mid-typing, a reel cut and the close.
5. **Render.** `npx --yes hyperframes render --workers 2 -o final.mp4`.
6. **Extract 4-6 frames** from the MP4 with ffmpeg (one per surface, one reel cut, the close) and look at them. Fix and re-render if anything is clipped, unreadable or blank.

## Shape of the film (24 s at defaults)

| Time | Beat |
|---|---|
| 0-10 s | Four surfaces, 2.5 s each. Slide in from the right, type for roughly 1.5 s, press ENTER, slide out left. A small label names the surface and its position (1/4). |
| 10-18 s | Hard cut with a white flash. 24 full-bleed output images, each with a slow push-in. The command sits in a pill bottom-left for the whole reel; a counter sits bottom-right. |
| 18-24 s | Dark close: logo, name, tagline, the command typed once more inside an ember-edged pill, url, a single glow pulse. |

## Rules that make it work

- **The four surfaces must differ in silhouette, not just colour.** Wide and low, tall and narrow, floating over a gradient, dark with a side tree. If you can squint and confuse two of them, redraw one. Build them from plain HTML and CSS; never imitate any real product's chrome, logo or palette.
- **Same string, same typing speed.** Every surface types the identical `prompt` over the same duration. That sameness is the point.
- **Type with a timeline tween**, not a timer. A tween over a `{n}` counter whose `onUpdate` slices the string is seek-safe; `setInterval` is not.
- **Blink carets with `tl.set` on a half-beat loop**, never CSS animation or `repeat: -1`.
- **Cut on the grid.** Every surface boundary, cut and close entrance lands on a beat, whether the grid is musical or a plain tempo. Off-grid edits are the first thing that reads as sloppy.
- **Speed up once.** Slow cuts first, then half-length cuts. Do not accelerate repeatedly.
- **Reel images are evidence.** Real output, not decoration. Prefer 1920x1080 stills; scale odd sizes with `object-fit: cover`. Alternate dark and light neighbours so each cut registers.
- **No third-party media.** No logos, UI screenshots of other products, stock footage or fonts you cannot ship. Fonts: name one family explicitly (for monospace use `"JetBrains Mono"`, which the CLI resolves itself); the generic `ui-monospace` stack rendered proportionally in testing.
- **Keep captions readable.** Check contrast; `hyperframes check` enforces WCAG AA on text, so labels need a mid-dark ink on the cream stage.
- **Silence is acceptable.** Do not add music of unknown licence; AI-generated tracks with non-commercial terms are out.
- Keep the flash tween `immediateRender: false`, otherwise the layout audit sees a white overlay at t=0.

## Validation

- `npx --yes hyperframes check` must end with "Check passed" (lint, layout, contrast).
- Snapshot frames show all four surfaces fully typed before their exit, no label overlapping a surface, no empty or half-loaded reel image.
- `ffprobe` reports 1920x1080, h264, duration within the 20-30 s window.

## Delivery

Put `final.mp4` beside the project (`index.html`, `assets/`). If the repo's convention asks for a short note, list: prompt, tempo or beat source, reel image sources, music licence (or "silent"), and the render command. Mention that Studio (`npx hyperframes preview`) can re-time anything.

See `references/surfaces.md` for the four surface specs and `references/grid.md` for the timing arithmetic.
