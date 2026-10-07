# pr-explainer-film

Turns a pull request, release or uncommitted diff into a ~30 second film for people who will never read the diff: the real diff scrolls past too fast to read, a plain-language summary lands, four capability beats show the lines behind each claim, and the film closes on the install command.

## Install

```
npx skills add SingleGrain-Team/video-skills@pr-explainer-film
```

## What you get

- `final.mp4` (1920x1080, H.264, about 30s)
- an editable HyperFrames project driven by a single `film.config.js`

See `SKILL.md` for the workflow and `template/` for the starting project.

## Based on

Composition structure and motion timing adapted from `pr-to-video-launch/` in https://github.com/heygen-com/hyperframes-launches (Apache-2.0, © HeyGen, Inc.). The template is a rewrite: a single data-driven file with no upstream media, logos or fonts.
