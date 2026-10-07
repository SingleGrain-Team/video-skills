---
name: liquid-logo-reveal
description: Builds a 6-8 second logo sting in which the brand mark rides inside a refracting liquid bead (distorted past legibility), the bead swells, holds still for a beat, then ruptures into droplets and leaves the logo lockup (mark plus wordmark) crisp and upright on screen. Delivered as a 1920x1080 H.264 MP4 plus the editable HyperFrames project, with no 3D model, stock footage or generation model. Use it for brand intros and outros, product-launch openers, channel stings and any "reveal our logo" moment, from an SVG or PNG logo (including raster-only logos), a wordmark string and a palette.
---

# Liquid logo reveal

A WebGL (Three.js) glass bead with physical transmission, noise-displaced surface and dispersion sits in front of the logo. The logo is refracted so heavily that it cannot be read. Pressure builds, everything freezes for a beat, the bead pops, 15 droplets fly off, and the mark slides left while the wordmark wipes out from behind it. Frames are pure functions of seek time, so renders are deterministic.

## Inputs

| Input | Notes |
| --- | --- |
| Logo mark | SVG or PNG. Mark only (symbol), square-ish, transparent background. |
| Wordmark | A text string typeset in Inter by default. If the brand has a real wordmark graphic, see "Wordmark as artwork". |
| Palette | Three colours: a strong accent, a soft tint, a muted neutral. They become blurred colour fields behind the glass; the glass is colourless and only shows what is behind it. Ink colour for the wordmark. |
| Duration | Default 7s. The hold after the lockup lands is the only part you should stretch. |

Only use assets the user supplied or that are in the brand kit. Never fetch logos from the web.

## Raster-only logos

- The template wants a PNG with alpha. If the logo has an opaque background (JPG, white box), remove it first (`npx hyperframes remove-background`, or ask the user for a transparent file). Do not ship a white square refracting inside the bead.
- A small PNG (under ~600px) is fine because the mark is shown at about 250px at rest, but it is scaled up to ~360px inside the bead. Keep the source at least 512px on the long side.
- Crop transparent padding so the visible mark fills the image; the code sizes the image box, not the ink.
- SVG: rasterise to a PNG about 1720px on the long side (headless Chrome screenshot, or `rsvg-convert -w 1720`), keep alpha, and point `data-logo-src` at it. Do not redraw or recolour the logo.
- If the brand logo is a combined lockup image (mark and text fused), you cannot split it cleanly. Use the whole lockup as the mark, set `data-wordmark=""`, and skip the wordmark wipe (set the wordmark clip to always hidden). The mark then docks to centre, not left.

## Build workflow

1. Scaffold: `npx --yes hyperframes init <dir> -e blank --non-interactive --skip-skills`, then replace its `index.html` with this skill's `template/index.html` and copy `template/js/`, `template/assets/logo.png` (overwrite with the brand mark). 
2. Vendor the runtime so rendering never touches the network. In a scratch dir (NOT inside another project, `npm i` walks up to the nearest package.json) run `npm i three@0.181.2 gsap@3.14.2 @fontsource-variable/inter`, then copy into the project:
   - `gsap/dist/gsap.min.js` to `vendor/gsap.min.js`
   - `three/build/three.module.js` and `three/build/three.core.js` to `vendor/three/build/`
   - `three/examples/jsm/environments/RoomEnvironment.js` to `vendor/three/examples/jsm/environments/`
   - `@fontsource-variable/inter/files/inter-latin-wght-normal.woff2` to `assets/fonts/`
3. Brand it with the data attributes on `#root` in `index.html`: `data-logo-src`, `data-wordmark`, `data-ink`, `data-fields` (three hex colours). Keep the fields saturated at the accent and soft elsewhere; never make the field behind the centre of the bead dark and flat.
4. Lint and check: `npx --yes hyperframes lint` then `npx --yes hyperframes check`. Both must be clean.
5. Frame review (below). Tune. Repeat.
6. Render: `npx --yes hyperframes render --workers 2 --output final.mp4`. Probe it: `ffprobe` should report h264, 1920x1080, 30fps, the expected duration.

## Motion rules (what makes the format work)

- **Illegible, not invisible.** Before the pop the viewer should see colour and warped shapes from the mark, never read it. If a frame shows the logo recognisably, raise `thickness` / displacement amplitude / spin; if the bead is a flat blob with no hint of the mark, lower them.
- **Mark sits behind the glass, in the opaque pass.** The pre-pop plane uses `alphaTest` (opaque queue) so Three's transmission pass can refract it. A plain `transparent: true` plane would not be refracted. The "revealed" copy is transparent and swapped in only after the shell has collapsed.
- **Phases, in order** (all constants in `T` at the top of `js/liquid-reveal.js`): establish (close crop to full bead, 0.7s) then liquid performance, pressure build (bead squashes wider and flatter, mark swells 1.00 to 1.06), comma (0.4s of total stillness: camera, mark, bead and shader clock frozen), rupture (shell collapses in 0.2s with a power-4 ease-in, droplets launch radially), dock (mark recoils then slides to its lockup slot while the wordmark wipes out from behind it), hold.
- **The stillness is the point.** The 0.4s freeze before the pop is what sells the rupture. No idle breathing, floating or looping glow anywhere.
- **Shader clock is gated.** The noise time advances only in authored windows and freezes on the comma and after the dock.
- **Wordmark emerges from the mark, never pops in.** Its clip left edge tracks the mark's right edge, so the text is never overdrawn by the mark mid-dock.
- **Droplets**: golden-angle fixed layout (no `Math.random`), radial launch, one gravity term, then shrink to nothing so the final frame is clean.
- **End on a still lockup.** Mark and wordmark upright, centred as a pair, no fade out. If the piece is an intro that will be cut into a longer video, shorten the hold instead of fading.
- **Determinism**: everything is computed from the `hf-seek` time. No `requestAnimationFrame`, `Date.now`, `Math.random`. The only DOM measurement is the wordmark width, taken once at load (canvas `measureText` with the shipped font).

## Tuning knobs

| Want | Change |
| --- | --- |
| Longer or shorter | `T` constants and `data-duration` on `#root` and on both `.clip` elements (keep them equal) |
| More abstract bead | raise `thickness` (3.2) or the displacement amplitude (0.15); lower for readability |
| Jelly vs. droplet look | `dispersion`, `attenuationColor` in `liquidMaterial()` |
| Bigger or smaller lockup | `L.markPx`, `L.fontPx`, `L.gap` |
| Calmer background | lower the three `* 0.50 / 0.80 / 0.35` field weights in the background shader |

## Wordmark as artwork

If the brand supplies a wordmark SVG/PNG, replace the `#wordmark` text with an `<img>` of the same position and width logic: measure its aspect, set its height to `L.fontPx * 0.8`, and keep the same `clip-path` logic. Never retype a stylised wordmark in a substitute font.

## Validation

- `lint` and `check` clean (a lint error silently disables the layout audits).
- Extract frames and look at them: `npx --yes hyperframes snapshot --at 0.3,1.5,3.3,3.55,3.9,6.5` and open `snapshots/contact-sheet.jpg`, or `ffmpeg -ss <t> -i final.mp4 -frames:v 1 f.png` on the render. Verify: (1) early frames show a bead where the mark cannot be read, (2) the frame just after the pop has no wordmark text overlapping the mark, (3) mid-dock text is clipped by the mark's edge, (4) final frame has crisp mark plus wordmark, centred, no droplets, no clipped glyphs.
- Common failures: blank canvas (importmap path wrong, or WebGL `three.core.js` not copied), wordmark off-centre (font not loaded before measuring), logo with a white box (opaque PNG).

## Delivery

Hand over `final.mp4` and the project folder (`index.html`, `js/`, `assets/`, `vendor/`) so it can be re-branded by editing the `data-*` attributes. Audio is optional; a short pop SFX at the rupture time `T.pop` is the only sound the piece needs. Source any sound through the `media-use` skill with a commercially licensed result, otherwise ship silent.
