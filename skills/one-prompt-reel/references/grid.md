# Timing arithmetic

`B = 60 / bpm`. At 120 bpm B = 0.5 s.

- Surface length = `surfaceBeats * B` (5 beats = 2.5 s). Typing starts 0.9 beats in and ends 1.5 beats before the surface ends; ENTER shows 1.2 beats before the end; the exit slide takes the last half beat.
- Reel start = number of surfaces x surface length.
- Reel cuts follow `reelPattern`, a list of `[count, beatsPerCut]`. Default `[[8,1],[16,0.5]]` is 8 x 0.5 s + 16 x 0.25 s = 8 s.
- Close start = reel start + reel length. The root `data-duration` must equal close start + 6 beats (or whatever tail you want); the default is 24 s. Edit `data-duration` whenever you change the pattern.
- Reel images are taken in order, wrapping if there are fewer than cuts.
- With a beat track, `CONFIG.cuts` replaces the pattern: absolute seconds, one more entry than there are cuts.
