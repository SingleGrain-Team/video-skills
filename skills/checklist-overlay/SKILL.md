---
name: checklist-overlay
description: Build a motion graphic where a screen recording plays in a large frame beside a checklist, and each checklist item ticks off at the exact moment that step happens in the recording, ending with every item checked and a short hold. Use when someone has a screen recording (product walkthrough, tutorial, onboarding, install demo) plus a list of steps with timestamps and wants a "watch the steps get done" film. Input is a recording, step labels with timestamps, a title and an optional palette; output is a 1920x1080 H.264 MP4 and the editable HyperFrames project.
---

# checklist-overlay

A screen recording on the left, a checklist on the right. Each item ticks the instant its step happens on screen. After the last tick the film holds on a fully checked list.

## Inputs

| Input | Notes |
| --- | --- |
| Recording | One local video file, ideally 16:9. Silent is fine. |
| Steps | 3 to 7 items: `{ "label": "...", "at": <seconds into the recording> }`. Labels are short imperative phrases (about 2 to 4 words). |
| Title | One line. Say the outcome ("Get a skill into your agent in 5 steps"). |
| Subtitle | Optional one line. |
| Palette | Optional hex overrides: `bg, surface, panel, ink, muted, accent, border, accentInk`. Default is dark with an orange accent. Keep `accentInk` dark enough to read on `accent`. |

If the person gives no timestamps, scrub the recording (extract frames every 1 to 2 s with ffmpeg, look at them) and pick the first frame where each step is visibly done or underway. Do not guess.

## Workflow

1. Load `/hyperframes`, `/hyperframes-core`, `/hyperframes-cli` for the project contract.
2. Write `spec.json`:
   ```json
   { "title": "...", "subtitle": "...", "palette": { "accent": "#ff6b2b" },
     "steps": [ { "label": "Open the app", "at": 1.5 }, { "label": "Search", "at": 7.9 } ] }
   ```
3. Generate the composition into the project directory:
   `node <skill>/scripts/create.mjs spec.json <recording.mp4> <project-dir> [--hold 2.2]`
   It copies the recording, extracts the last frame (so the picture holds after the recording ends), and writes `index.html` sized to the recording. Total length = recording length + hold (default 2.2 s).
4. `npx --yes hyperframes check` must pass with 0 errors and 0 warnings.
5. Validate (below), then render: `npx --yes hyperframes render --workers 2 --quality delivery --output final.mp4`.

## Timing rules

- The tick lands on the step, never before. Fill and check-draw start at `t = at`; the draw finishes about 0.3 s later. Nothing in the item may look checked before `at`.
- Timestamps are recording time and the recording starts at composition time 0, so `at` is used unchanged. If you trim the recording, shift every `at` by the same amount.
- An "up next" outline may appear on the next item shortly after the previous tick. It is an outline only, never a fill or a check.
- Keep ticks at least 1.5 s apart so each one reads. If two steps are closer, merge them.
- The last tick should sit at least 1.5 s before the recording ends, or raise `--hold` so the finished list is visible for 2 s or more.
- Counter (`n / N`), progress bar and frame ring pulse all key off the same `at` values, so they stay in sync.

## Layout (16:9 recordings)

1920x1080 canvas, 56 px margins. Title and subtitle on top; the recording frame is the hero at about 1250 px wide (about 65 percent of the width), the checklist panel is a 520 px column to its right, same height as the frame, items share the height equally. This keeps UI text in the recording readable. Do not shrink the frame below about 1100 px wide; for a taller recording the generator scales the frame by aspect ratio. Non-16:9 recordings: check the frame still fits under the header, or crop the recording first.

Labels wrap to two lines at 32 px; keep them under about 26 characters.

## Validation

Do this on the rendered `final.mp4`, not only on snapshots:

1. For every step extract one frame 0.08 s before `at` and one 0.45 s after: `ffmpeg -ss <t> -i final.mp4 -frames:v 1 f.png`.
2. Look at them. Before: item unchecked, counter at i-1. After: item filled with a check, counter at i, progress bar advanced.
3. Extract a frame in the final hold (about 0.2 s before the end): all items checked, counter `N / N`, bar full.
4. Check the recording text is legible in the frame and no label is clipped. Fix `spec.json` or the palette and regenerate if not.
5. `ffprobe` the file: 1920x1080, h264, duration = recording + hold.

## Delivery

Report the path to `final.mp4`, its duration, and the step timestamps used. Keep the project directory (`index.html`, `assets/`, `spec.json`) so the film can be re-generated with different labels or palette. Open `npx hyperframes preview` first if the person wants to edit in Studio.
