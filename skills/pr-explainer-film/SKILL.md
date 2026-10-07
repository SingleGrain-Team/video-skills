---
name: pr-explainer-film
description: Make a roughly 30-second film that explains a code change (a pull request, release or uncommitted diff) to people who will never read the diff. It opens by showing the real diff scrolling past too fast to follow, cuts to a plain-language summary, fires four capability beats each pinned to a real code snippet, and closes on how to get it (install command and URL). Delivered as a 1920x1080 H.264 MP4 plus the editable HyperFrames project. Use when asked to turn a PR, changelog or release into a launch or explainer video.
---

# pr-explainer-film

A silent-by-default, ~30s film in five movements. The shape is the point: the viewer feels the diff is unreadable, then gets the answer in plain words, then sees proof, then knows what to type.

| Time | Movement | Purpose |
|---|---|---|
| 0-2s | Hook | Name the size of the change ("15 files changed.") |
| 2-8s | Diff blur | Real hunks whip past; counters tick up |
| 8-13s | Plain words | One-sentence headline plus three short points |
| 13-23s | Four beats | One capability each, shown next to the real lines behind it |
| 23-30s | Close | Install command typed out, then the URL |

## Inputs

Collect these before building. Ask only for what is missing.

1. **Change source**: a GitHub PR or release (`gh pr diff`, `gh pr view --json title,body,files`), or a local working tree (`git diff` plus untracked files). Read-only; never modify the repo.
2. **Audience**: who will not read the diff (customers, teammates, followers). This decides vocabulary in the summary and beats.
3. **CTA**: the exact install command and/or URL. Use it verbatim. If the product has one canonical command, show only that command and no other tool's name.
4. **Brand**: palette, logo (your own file), font. Defaults in the template are neutral and dark.

## Workflow

1. **Read the change.** Get the file list with add/delete counts and the real hunks. Write the change in one sentence a non-engineer would understand; if you cannot, you do not understand the change yet.
2. **Pick the content** (see `references/content-rules.md`): hook number, 5-8 diff hunks for the blur, 3 summary points, exactly 4 capability beats, CTA.
3. **Scaffold.** `npx --yes hyperframes init <dir> --non-interactive --example=blank`, then copy `template/index.html` and `template/film.config.js` over the generated files. Put your logo at `assets/logo.png` if you have one.
4. **Fill `film.config.js`.** All wording, snippets and numbers live there. Edit `index.html` only to change brand variables in `:root`, timings or layout.
5. **Validate**: `npx --yes hyperframes lint` then `npx --yes hyperframes check`. Fix every error. Known acceptable warnings: `nested_structure_needs_subcomposition` (the film is intentionally one file for easy re-branding).
6. **Look at it.** `npx --yes hyperframes snapshot --at 1,4,6,8.3,11,14,17,19.5,22,26,29` and open `snapshots/contact-sheet-*.jpg`. Check against the list below; fix and re-snapshot until clean.
7. **Render.** `npx --yes hyperframes render --quality high --workers 2 --output final.mp4`. Confirm with `ffprobe` that it is 1920x1080, H.264, and 28-34s.
8. **Re-look** at 4-6 frames pulled from the MP4 (`ffmpeg -ss T -i final.mp4 -frames:v 1 f.png`), not just the snapshots.

## Rules that make the format work

- **The diff must be real.** Copy actual lines from the actual diff. Never invent code or counts. Compute counts from `git diff --shortstat` plus `wc -l` of new files.
- **Unreadable on purpose.** The scroll accelerates (`power2.in`) and blurs. Do not slow it so people can read; the "too much to read" card pays that off.
- **Words before proof.** The summary comes before any capability beat. Each beat title is a benefit in 2-4 words; the description is one sentence with no jargon; the snippet is 1-5 real lines with the key line highlighted.
- **Exactly four beats**, one idea each, about 2.6s apiece. Cut weaker ones rather than shrinking text.
- **Alternate surfaces.** Dark for diff and beats, one light scene for the summary. The change of ground signals "now it is simple".
- **Close on the command.** Type the real command character by character, then show the URL. No second CTA.
- **Copy hygiene.** Strip code comments that name competitors or unrelated tools before they reach a snippet. Never show a CLI other than the one in the CTA.
- **Own your assets.** Use your own logo, fonts the machine already has, and no stock or third-party media. Music is optional; if used, only tracks licensed for commercial use (resolve through `media-use`), and keep the film fully legible without sound.
- **Determinism.** No `Math.random`, `Date.now` or network calls in the composition; animate typed text and counters from a tween progress value so seeking is exact.

## Frame checklist (step 6 and 8)

- Hook number and wording match the real change.
- Diff window clips inside its frame; file headers and green/red lines are legible at rest, blurred when moving.
- Counters end on the true numbers.
- Summary slide shows all three points before it fades.
- Every beat has title, sentence and snippet visible together, nothing cut off.
- Final frame shows the full command and URL, spelled exactly.

## Delivery

Hand over `final.mp4` and the project folder (`index.html`, `film.config.js`, `assets/`, `meta.json`). Report the path, duration, and any validation warnings that were accepted. The folder re-renders with the same command; to re-brand or re-use for the next release, edit `film.config.js` only.

See `references/content-rules.md` for sizing and wording limits.
