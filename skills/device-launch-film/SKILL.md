---
name: device-launch-film
description: Build a 15-20 second product launch film that shows the product's real screen on a laptop built from plain CSS (no 3D model, no generation model) in a dark studio, scrolls the page, zooms into the interface for one key action such as typing a search, and resolves to the logo lockup. Use when someone has a full-page screenshot or screen recording of their product, one action worth showing, and a logo, and wants a short silent-friendly launch teaser rendered as a 1920x1080 MP4 with an editable HyperFrames project.
---

# device-launch-film

A single-shot launch film: device appears, the real page scrolls, the camera pushes into one action, the device falls away and the logo lockup lands. About 18 seconds, no narration required.

## Inputs

Get these before building. Ask for any that are missing.

1. **Page capture**: a full-page PNG of the real product (preferred, 1920 wide, up to roughly 6000 tall) or a screen recording. For a recording, extract a still of the starting state and use that for the scroll; use the clip itself only for the zoom beat.
2. **The one action**: a single interaction that reads clearly in 3 seconds. Typing into a search field is the easiest; a button press or toggle also works. Note its location in page pixels.
3. **Logo**: transparent PNG or SVG, plus product name and a one-line tagline. Use only assets the user owns.
4. Optional: brand colors (accent, dark background), URL for the closing line.

Never substitute a third-party UI or logo for the product's own.

## Workflow

1. Load `/hyperframes` and `/hyperframes-core`; follow their composition contract.
2. Scaffold a project directory. Put the capture in `assets/page.png` and the logo in `assets/logo.png`.
3. Copy `template/index.html` from this skill as `index.html`. It is one standalone composition driven by a `CFG` block and a handful of CSS sizes.
4. Fit the page to the screen. The screen is 1120x700 (16:10) inside the lid. Scale = 1120 / capture width. Set `CFG.scale` and `CFG.maxScroll` (= capture height x scale minus 700). If the capture is shorter than the screen, drop the scroll beat; if it is very tall, keep the scroll to 3-4 seconds and let it be fast.
5. Locate the action in the capture (page px) and write down the field's box and the text origin. In the template this means editing the `#patch` (covers the placeholder), `#ring` (focus outline), `#typed` (text position and font size) rules, and `CFG.focus` (the stage point the camera centers on: `screen left 400 + x * scale`, `screen top 110 + y * scale`, with the scroll back at 0).
6. For a result state, either crop the real result from a second capture, or reuse a real element from the same capture the way the template does (`#hit` is a cropped card slid under the field while `#cover` hides the rest). Never draw invented data.
7. Replace the lockup text and colors in `#end`. Adjust the timeline only through the numbers already in it.
8. Run `npx --yes hyperframes check` and fix every warning you caused (see Validation), then `npx --yes hyperframes snapshot --at 0.8,3.5,6,9,10.5,12,13,16` and look at the contact sheet.
9. Render: `npx --yes hyperframes render --workers 2 --fps 30 -o final.mp4`.

## Beat sheet (18 s)

| Time | Beat |
|------|------|
| 0-1.6 | Laptop rises out of the dark; screen brightens from black |
| 1.7-5.2 | Page scrolls top to bottom with an ease-in-out, camera drifts in 3 percent |
| 5.6-7.1 | Scroll returns to the top |
| 7.0-8.3 | Camera zooms (about 3x) onto the action target; focus ring appears |
| 8.7-10.5 | The action plays (typing at about 5 characters per second) |
| 10.8-12.4 | The result appears and rises into place |
| 12.7-13.8 | Camera pulls back, device shrinks and fades |
| 13.9-18 | Lockup: mark pops in, name, tagline, URL; hold at least 2 seconds |

## Rules

- Device is CSS only: lid with bezel, screen, base with a notch, a soft floor shadow. No images of real hardware, no 3D, no trademarked device silhouettes beyond a generic laptop slab.
- Two nested camera wrappers: the outer one drifts and fades, the inner one zooms. Never tween the same property on the same element from two tweens that overlap in time.
- Everything on the screen lives inside the scaled page element so the zoom stays sharp and aligned. Overlays (typed text, ring, patch, result) use page pixels.
- Typing is driven by a proxy number and `onUpdate`, which stays seek-safe. No timers, no random.
- Name no web fonts without a local `@font-face`; the template uses the system stack. If the brand needs a font, ship the file in `assets/` and declare it.
- Do not show real people's photos large. If the capture has avatars, keep the zoom away from them or cover them with the page background.
- Music is optional. Add it only if the license permits commercial use and record the source; silent is fine.
- Do not log in, purchase, or capture private data to make the capture.

## Validation

- `check` reports 0 errors. The layout notes `container_overflow` on the scroller and `escaped_container` on the zoomed camera are expected here (the scroller is meant to overflow its clip; the camera is scaled on purpose). Any other warning, especially `overlapping_gsap_tweens`, must be fixed.
- Snapshot the key beats and open them: device centered and not cropped at 0.8 s and 3.5 s, the zoomed field readable with its full typed text, the result clear of the field, the lockup centered with nothing left of the device on screen.
- After rendering, confirm with `ffprobe` that the file is H.264, 1920x1080, 15-20 s, then extract four to six frames and look at them. If anything is broken, fix and re-render.

## Delivery

Hand over `final.mp4`, the project folder (editable), and a short note listing the capture and logo used, any audio source, and the CLI version. Mention that the project can be edited in HyperFrames Studio.
