# Surface specs

All sit centred in a flex wrapper (`.slot`) so GSAP owns the inner node's transform. Each contains `<span class="typed"></span><span class="caret"></span>`.

| # | Name | Frame | Look | Why it differs |
|---|---|---|---|---|
| 1 | terminal | 1380x440 | near-black, 14px radius, traffic dots, `$` in accent | wide and low |
| 2 | chat | 780x820 | white card, 56px radius, header with avatar dot, bubble above, pill input with round send button | tall and narrow, light |
| 3 | palette | 1500x760 gradient panel holding a 1220-wide white search box with two faint result rows | floating, colourful, search glyph drawn with CSS | layered, one hot row |
| 4 | editor | 1500x760 slate blue, side tree, tab, comment line, bordered cell labelled `CELL 1` | split layout | panes, inner box |

To swap a surface, keep the wrapper id (`slotN`, `sN`) and the `.typed` / `.caret` children; the timeline finds them by those names. Longer prompts: shrink the chat font first (it is the narrowest) and keep it on one line (`white-space: nowrap`).

A fifth surface: add a `slot5`/`s5` block, append `"s5"` and a name to `CONFIG.surfaces` / `surfaceNames`, and lengthen the root `data-duration` to match.
