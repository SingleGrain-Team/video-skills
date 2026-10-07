---
name: title-takeover
description: Render a 5-6 second motion graphic in which an oversized condensed headline (2-4 words) punches in behind a presenter, using a background-removed cutout of the presenter layered on top of the lettering. A hard cut then removes the presenter while the same headline holds the exact same size and position, and a short supporting line appears for a reading hold. Use it for talking-head intros, chapter openers, launch announcements and social hooks when you have one presenter clip, a headline, a supporting line and a palette. Built on HyperFrames; delivers a 1920x1080 H.264 MP4 plus the editable project.
---

# title-takeover

One idea, two beats. Beat 1: the headline slams in *behind* the speaker (depth). Beat 2: a hard cut drops the speaker and the very same lettering stays put while one line of copy reads out (clarity). Same element before and after the cut; the cut is the only change.

## Inputs

| Input | Rule |
| --- | --- |
| Presenter clip | One person, facing camera, head and shoulders roughly centered, 1920x1080 landscape, at least 4 s of usable footage. Silent is fine. Own or licensed footage only. |
| Headline | 2-4 words, uppercase, at most ~16 characters per line. Two lines work best (e.g. `ADOPT AI` / `SKILLS`). One accent word is optional. |
| Supporting line | One sentence, 4-9 words ideal, never more than ~50 characters (must fit on one line at 60 px). |
| Palette | Backdrop, ink, accent. Dark backdrop plus cream ink plus one accent reads best; keep contrast at WCAG AA or better. |
| Font | A condensed heavy display face shipped as a local file (Anton, OFL, is the default) plus a clean sans for the supporting line (Inter). |

## Workflow

1. **Prepare the clip.** Trim a 6 s window where the presenter is facing camera and not leaving frame. Strip audio, normalize to 30 fps, 1920x1080:
   `ffmpeg -ss <in> -i src.mp4 -t 6 -an -r 30 -c:v libx264 -crf 14 -pix_fmt yuv420p assets/presenter.mp4`
2. **Cutout.** `npx --yes hyperframes remove-background assets/presenter.mp4 -o assets/presenter-cutout.webm` (transparent VP9 WebM, same frame count and resolution as the source; about 25 s for 180 frames on Apple silicon). If the model download times out, rerun; the model caches under `~/.cache/hyperframes`.
3. **Composition.** Copy `template/` into the project, put `presenter.mp4`, `presenter-cutout.webm`, fonts and logo in `assets/`, then edit only the marked palette variables, the two headline lines and the supporting copy. Layer order, bottom to top:
   1. backdrop (solid + soft accent glow)
   2. presenter footage + dark scrim (dims busy backgrounds so the lettering pops)
   3. headline
   4. presenter cutout (same `data-start` / `data-media-start` / `data-duration` as the footage)
   5. supporting line, brand mark
4. **Check and render.** `npx --yes hyperframes check`, then `npx --yes hyperframes render --workers 2 --quality delivery --output final.mp4`.

## Timing rules (6.0 s film at 30 fps)

| Moment | Time | Rule |
| --- | --- | --- |
| Punch-in | 0.30 s (line 1), 0.45 s (line 2) | Scale 1.4 to 1.0 plus opacity 0 to 1, 0.45 s, `expo.out`. Stagger lines 0.15 s. Show 0.3 s of presenter alone first so the headline lands on a live frame. |
| Behind-presenter hold | 0.75 s to cut | At least 2.4 s with the speaker visible over the lettering. |
| Hard cut | 3.4 s (frame 102) | Footage, scrim and cutout all end on the same frame. No fade, no transition, no zoom. |
| Supporting line | 3.75 s, 0.55 s rise of 28 px, accent rule wipes in | Leave about 0.35 s of headline alone after the cut so the "hold" registers. |
| Reading hold | 4.3 s to 6.0 s | At least 1.5 s fully static. End on the full lockup; never fade to black. |

Invariants:
- The headline is one element. After the punch-in settles (frame ~24) never tween its scale, position, size or letter-spacing again. The cut must not move a single glyph.
- Never re-create the headline in a second scene.
- The cutout and the footage must be frame-locked; give both `muted playsinline`, no `crossorigin`.
- Animate only transform and opacity on the headline lines (they sit inside a static wrapper). Do not tween `.clip` elements.
- The presenter's face will hide some letters. That is intended; keep the word gap and a distinctive letter pair visible on each side, and keep the headline at 380-440 px so the words stay legible.
- Keep 140 px of headroom above line 1 so the glyphs never leave the canvas.

## Validation

1. `npx --yes hyperframes check` must report 0 errors. Intentional lettering-behind-presenter overlap is declared with `data-layout-allow-occlusion` on the cutout and headline lines (already in the template).
2. Extract and look at (not just count) these frames from the rendered MP4:
   ```
   for n in 90 101 102 103 179; do ffmpeg -y -i final.mp4 -vf "select=eq(n\,$n)" -frames:v 1 qc_$n.png; done
   ```
   - 90: headline visible behind the presenter, cutout edges clean (no halo, no missing hair or shoulders).
   - 101 (last presenter frame) and 102 (first frame after the cut): presenter gone on 102, headline identical in size and position in both.
   - 103: still no supporting line yet or just starting; headline unchanged.
   - 179 (final): headline plus complete supporting line, fully legible, nothing clipped.
3. If the cutout shows fringing or flicker, re-run `remove-background` with `--quality best` or choose a cleaner source window. If the headline jumps at the cut, a tween is still running on it; remove it.
4. `ffprobe` must show h264, 1920x1080, 30 fps, 6.0 s.

## Delivery

Hand over `final.mp4` plus the project folder (`index.html`, `assets/`). Record the footage source URL and license in `NOTES.md`. Never use footage of recognizable creators or celebrities, or third-party logos.
