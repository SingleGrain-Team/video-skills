# Content limits for pr-explainer-film

## Hook
`<N> files changed.` plus a one-line dismissal ("Nobody is reading that diff."). N is the real file count including new files.

## Diff blur (`diff.files`)
- 5-8 files, mix of kinds (UI, styles, data, config, script).
- 5-8 lines per hunk, trimmed from the real hunk. Prefix `+`, `-` or a space exactly as in the diff.
- Lines under ~70 characters so they fit the window.
- Three stats, all derived from git: files changed, lines added, new files.
- The template tiles the list until it covers 7,600px; do not worry about length.

## Hard-to-read card
Under five words. It lands as the diff stops.

## Summary
- Title: one sentence, plain words, under 80 characters.
- Three points, each under 55 characters, each describing what a user gets.

## Beats (exactly four)
- title: 2-4 words, benefit-first.
- desc: one sentence, under 95 characters.
- file: real path shown in the code panel caption.
- code: 1-5 lines; `hl: true` on the lines that prove the claim. Break long lines by hand.
- Order by how much a non-engineer cares, strongest first.

## Close
- `head`: product name or launch line, two lines max (`<br>` allowed).
- `command`: the one canonical install command, as it appears on the product page.
- `url`: shortest working URL, no scheme.

## Timing map (edit the `data-start` values in index.html and matching numbers in the script together)
hook 0-2.0, diff 1.9-8.1, hard 7.8-9.0, summary 8.7-13.3, beats start 13.0 / 15.6 / 18.2 / 20.8 (2.9s each), close 23.4-30.5.
