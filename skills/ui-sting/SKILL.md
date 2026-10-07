---
name: ui-sting
description: Builds a 10-14 second product sting out of a short run of UI moments (an entry screen, a single counting metric, a navigation list, one click that opens a menu, then an endcard) cut together so every cut carries the previous motion forward and the piece reads as one continuous camera move. Delivered as a 1920x1080 H.264 MP4 plus an editable single-file HyperFrames project. Use it for app launches, feature teasers, social bumpers and site intros when you have a product's logo, a couple of screenshots, one headline number and its real nav labels, and want polished UI motion without narration.
---

# ui-sting

A short, silent-by-default film made of UI beats. The look comes from two things only: one ease
family, and matched motion vectors at every cut. Do not add idle motion or decoration.

## Inputs to collect

- Brand: name, logo (PNG with alpha or SVG), 2-3 colors (ground, ink, one accent), a font that is
  legal to render (an open face is fine; Inter is the default).
- Two screenshots at 1920x1080 of real product screens (an entry/landing screen and a detail screen
  that contains a command, form or headline you can crop to).
- One metric worth counting (for example "662 skills") with a label and a sub-line.
- The real primary navigation labels (5 of them), and which one gets highlighted (the third).
- The one action the viewer should take (a button label) and 4 menu options it opens.
- Endcard: a 2-word tagline, the URL, optionally a command to type in the zoomed card.

Use only assets you own or are licensed to use. Never put third-party logos or UIs in the film.

## Slots

| slot | frames (30fps) | what to put there |
|---|---|---|
| A lockup | 1-35 | logo mark + wordmark, two parts that bounce against each other, then rise out |
| B entry | 36-72 | screenshot card enters from below, a brand-colored gloss crosses it, exits left |
| C zoom | 73-113 | card at 1.5x entering from the right; a crop of the detail screenshot plus a command that types in; rises out |
| D counter | 114-154 | metric card rises in, number rolls 0 to N, exits right |
| E nav | 155-209 | rows waterfall in from the left, an accent pill travels from row 1 to row 3 |
| F action | 210-304 | the button arrives oversized and contracts, cursor clicks, menu opens, highlight steps to option 3 |
| G endcard | 305-325 | tagline + lockup + URL land with a pull-back, spring settle and a shimmer through the mark |

Total 325 frames = 10.83 s. Everything is keyed off `F(n) = (n - 1) / 30`.

## Workflow

1. Scaffold: `npx --yes hyperframes init <dir> --non-interactive --resolution landscape`. This
   gives the project files; then replace `index.html` and add `assets/`.
2. Copy `template/index.html` and `template/assets/` from this skill into the project. Replace the
   three placeholder images with the real logo and screenshots (keep file names, or update the
   `src`/`url()` references).
3. Re-brand only the brand layer: the `:root` color tokens, the copy strings, the `NAV`, `MENU`
   arrays, the `ICO` path data (24x24 viewBox, 1.7 stroke, round caps; draw generic glyphs, never
   another company's marks), the command string `CMD`, the counter target (the `662` in `AMT`) and
   the crop (`#c-crop` `background` position/size: pick the region of the detail screenshot you want to
   show; size = screenshot width x scale, position = negative offset of the crop in scaled pixels).
4. Re-measure the two nav numbers. After changing labels, render once, open a settled nav frame (about
   t = 6.5 s) and read each label's right edge. Set `NAV[i].w` to the row width (icon + label) and
   `pw = w + 46` for the first three rows. Highlight lands on row 3 and must fit it.
5. `npx --yes hyperframes check`. The single-file layout produces `nested_structure_needs_subcomposition`
   warnings; they are expected for this format. Errors and the contrast section must be clean.
6. Render: `npx --yes hyperframes render --quality looks --workers 2 --output final.mp4`.
7. Review frames (see Validation), fix, re-render. Deliver `final.mp4` and the project folder.

Music is optional. If used, resolve it through the media-use catalog or generation, confirm the
license allows commercial use, add it as an `<audio id="bed" class="clip" ...>` clip on its own track
(it needs the `id`), and keep it low. The film works silent.

## Motion rules (do not break these)

1. One ease family: arrivals use `EO = 1 - 2^(-10p)`, exits use its mirror `EI = 2^(10(p-1))`. Pass
   them as functions. The strings `"expo.out"`/`"expo.in"` are a different curve and shift every
   exit by several pixels. No overshoot, no linear, no stock elastic or back.
2. Matched vectors at every cut (see `references/seams.md`). Nothing settles before a cut; nothing
   starts from rest after one. Axis and direction must agree on both sides.
3. Curves are tweens, decisions are stamps. The typing rhythm, odometer values and highlight path
   are stamped frame by frame with `tl.set`, which stays exact and seek-safe.
4. Uneven on purpose: nav rows are not evenly pitched and typing has three double-frames.
5. Fast moves carry blur that ramps with the same ease, peaking when speed peaks.
6. Two-part marks counter-bounce: a damped spring `A * e^(-t/0.279) * sin(2*pi*t/0.5)`, `+A` on one
   part and `-A` on the other. The endcard staggers its words by 2 frames on the same spring.
7. The last digit of the counter carries a vertical-only blur (SVG `feGaussianBlur stdDeviation="0 4"`).
8. No idle motion. If a beat feels empty, add information, not wobble.
9. Do not change frame numbers, durations, clip `data-start`/`data-duration`, `EO`/`EI`, the stamped
   arrays' lengths, or the scene wrapper tweens unless you re-plan the seams on both sides.

## Technical notes

- Authoring is in a 720x720 square ("world") that each `.scene` scales 1.5x onto 1920x1080, with the
  square centred by the `.w` wrapper (offset 280). Off-screen exits therefore use large pixel values.
- Clip boundaries sit just below frame times (`1.166`, not `1.1667`).
- Dark themes need a second nav layer: light type vanishes on a bright pill. Keep dark ink on the
  accent pill instead, and use ink (not accent) for any accent-colored small text on a light ground:
  an orange on cream fails the 3:1 contrast gate.
- Never measure text at runtime; it races font loading. Bake numbers from a render.
- Register the font under a family you control if it is not a system face.

## Validation

1. `npx --yes hyperframes check` passes (runtime, layout, motion, contrast).
2. Extract 6-8 frames and look at them: `ffmpeg -ss <t> -i final.mp4 -frames:v 1 f.png` at roughly
   0.5, 1.8, 3.1, 4.4, 6.5, 8.5, 9.4, 10.7 s. Tile with `hstack`/`vstack` to review at once.
3. Confirm: logo centred; entry screenshot readable; typed command not clipped; counter ends on its
   target; the pill rests on the intended row and is wide enough; the menu opens off the button's
   corner and the highlight steps to option 3; endcard text is centred and legible.
4. Spot-check two seams per `references/seams.md`.
5. `ffprobe` the output: 1920x1080, h264, 30 fps, duration about 10.83 s.

## Delivery

`final.mp4` (1920x1080 H.264) plus the project folder (`index.html`, `assets/`). The project is
editable: re-brand by changing data, not motion.
