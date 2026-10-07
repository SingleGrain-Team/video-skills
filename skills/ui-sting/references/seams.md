# Seam ledger

One row per cut. The outgoing element must still be moving when the cut lands, and the incoming
element must already be moving on the same axis and sign. Axis `y -1` is upward, `x -1` leftward,
`x +1` rightward, `z -1` is shrinking (pulling back).

| cut | frame | out | in |
|---|---|---|---|
| lockup to entry card | 36 | up | up |
| entry card to zoomed card | 73 | left | left |
| zoomed card to counter | 114 | up | up |
| counter to nav | 155 | right | right |
| nav to action | 210 | pull back | pull back |
| menu to endcard | 305 | pull back | pull back |

Retiming a scene means fixing both neighbours' vectors too. Clip boundaries sit just below the frame
time (1.166, not 1.1667) so the incoming scene owns the cut frame.

## Verifying a cut

Extract the frames either side of each cut and compare element positions:

    ffmpeg -ss <t-0.034> -i final.mp4 -frames:v 1 before.png
    ffmpeg -ss <t+0.034> -i final.mp4 -frames:v 1 after.png

The outgoing element should be displaced from its resting place in the direction of travel; the
incoming one should be displaced the same way. Anything sitting at rest on either side is a dead cut.
