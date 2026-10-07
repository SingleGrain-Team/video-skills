# one-prompt-reel

A 20-30 second launch film for surface-independent products (CLI, package, plugin, agent skill). The same prompt is typed into four different-looking surfaces in turn, the film cuts into a fast reel of real outputs on a beat grid, and it closes on the command. Music is optional: with a track the cuts follow detected beats, without one they follow a fixed tempo.

Install:

```
npx skills add SingleGrain-Team/video-skills@one-prompt-reel
```

Contents: `SKILL.md` (workflow and rules), `template/` (a CONFIG-driven HyperFrames project), `references/` (surface specs, timing arithmetic).

Based on: `website-to-hyperframes/` (staged typing panels that hand off to one another, cut timing tied to a beat grid) from https://github.com/heygen-com/hyperframes-launches. Apache-2.0, © HeyGen, Inc. Structure and timing ideas are adapted; no media, logos, fonts or third-party UI branding are included, and all surfaces here are original.
