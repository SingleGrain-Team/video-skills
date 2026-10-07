# Video Skills

Agent skills that render finished videos — launch films, product stings, logo
reveals and motion graphics — with [HyperFrames](https://github.com/heygen-com/hyperframes).
Each skill gives your agent the format, the motion rules and the validation
steps; you bring the product, the screens and the copy.

Browse every skill with its demo film at **[skillsdojo.com/video-skills](https://skillsdojo.com/video-skills)**.

## Skills

| Skill | What it makes | Install |
| --- | --- | --- |
| [`chat-launch-film`](skills/chat-launch-film) | A launch film inside one chat window: a request, your product as a tool call, a headline number | `npx skills add SingleGrain-Team/video-skills@chat-launch-film` |
| [`device-launch-film`](skills/device-launch-film) | Your real screen on a device in a dark studio: scroll, push in on one action, logo | `npx skills add SingleGrain-Team/video-skills@device-launch-film` |
| [`pr-explainer-film`](skills/pr-explainer-film) | A pull request or release explained for people who won't read the diff | `npx skills add SingleGrain-Team/video-skills@pr-explainer-film` |
| [`one-prompt-reel`](skills/one-prompt-reel) | One command typed into several surfaces, then a beat-cut reel of real results | `npx skills add SingleGrain-Team/video-skills@one-prompt-reel` |
| [`ui-sting`](skills/ui-sting) | A ~10s interface sting where every cut flows into the next | `npx skills add SingleGrain-Team/video-skills@ui-sting` |
| [`liquid-logo-reveal`](skills/liquid-logo-reveal) | Your logo inside a refracting liquid bead that bursts into the lockup | `npx skills add SingleGrain-Team/video-skills@liquid-logo-reveal` |
| [`title-takeover`](skills/title-takeover) | A giant headline behind a presenter that takes over the frame on the cut | `npx skills add SingleGrain-Team/video-skills@title-takeover` |
| [`checklist-overlay`](skills/checklist-overlay) | A checklist that ticks off each step as it happens in a screen recording | `npx skills add SingleGrain-Team/video-skills@checklist-overlay` |

## Requirements

- Node.js 22+ and FFmpeg
- The HyperFrames CLI, run through `npx --yes hyperframes`

## License

Apache License 2.0 — see [LICENSE](LICENSE). Some skills adapt composition
structure and timing from HeyGen's Apache-2.0
[hyperframes-launches](https://github.com/heygen-com/hyperframes-launches);
see [NOTICE](NOTICE) and each skill's README.

A project by [Single Grain](https://www.singlegrain.com).
