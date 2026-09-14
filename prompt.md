# Project: non-permanent double-sided room divider (IKEA KALLAX + built plywood frame)

> **⚠️ Historical handoff document — numbers here are stale, do not cut from this file.**
> This was the initial brief from an earlier session, before field measurements were
> taken. Every dimension below reflects pre-measurement estimates and has since
> drifted from reality (opening width, KALLAX sizes, stile length, upper panel
> material, etc.) — a design review confirmed the two sources now disagree on
> nearly every number. **`renders/geometry.js` is the single source of truth for
> every measurement**; `renders/reference.html` is the authoritative cut list,
> fastening schedule, and open-issues tracker. Keep this file for the original
> intent, decisions, and rationale narrative (why plywood over MDF, the track-light
> reasoning, etc.) — not for any number you'd actually cut to.

I'm building a non-permanent divider in the opening between my bedroom (Room A)
and home office (Room B). Both KALLAX units are already assembled. Help me refine
the design, assembly sequence, cut lists, and light-proofing. Diagrams welcome.

## The opening
- Wall to wall: 105 1/2"
- Inside existing casing: 104" (casing sits ~3/4" proud of the wall, each side)
- Ceiling steps: leftmost 28 1/2" of the opening is 82" high; the remaining 77"
  is 73" high (9" duct soffit drop)
- Existing baseboard runs the side walls, ~5/8" proud. Casing and baseboard both stay.

## Bookcases (already built, hollow-core particleboard — nothing structural fastens to them)
- KALLAX 4x4: 57 7/8" W x 57 5/8" H x 15 3/8" D — shelves open to the OFFICE (left side)
- KALLAX 4x3: 43 7/8" W x 57 5/8" H x 15 3/8" D — shelves open to the BEDROOM (left side)
- Combined width 101 3/4"
- Each gets a backer on the face opposite its open side

## Structural approach (decided)
A 3/4" plywood ladder frame carries everything; the KALLAX units are infill.
All frame members 15 7/8" deep (15 3/8 carcass + 1/4" backer on each face).

- Bottom plate: 104" x 15 7/8", two pieces (59" + 45") spliced over the centre stile
- Three stiles: 3/4" x 15 7/8" x 56 7/8", standing on the bottom plate
- Top plate: 104" x 15 7/8", two pieces spliced over the centre stile
- Upper jambs above the top plate: left 22 7/8", right 13 7/8"
- The whole assembly sits 3/4" clear of each side wall so it passes in front of
  the baseboard — no notching. Above the baseboard that 3/4" gap takes a cleat
  screwed into the studs, which is both the light seal and the lag point for the
  stiles. Below, the baseboard fills it.
- Wall cleat material: 3/4" plywood, ripped into strips (matches the ladder
  frame's own material and thickness, uses offcuts, fully hidden in the gap so
  exposed plywood edges don't matter). 1x4 pine is the documented alternative
  if ripping plywood isn't worth it.
- Cleat-to-stile fastening (decided): screwed through the stile face into the
  cleat, driven from the room side before the backer panel goes on — not
  through the cleat from inside the 3/4" gap. Simpler to execute; the
  "non-permanent" requirement is already satisfied by the ceiling cleats and
  wall lags being reversible, so tool-free stile removal isn't a goal.

### Layout, from the left wall (bedroom view)
| 0 – 3/4 | side gap: casing / wall cleat |
| 3/4 – 1 1/2 | left stile |
| 1 1/2 – 45 3/8 | KALLAX 4x3 (43 7/8) |
| 45 3/8 – 46 1/8 | centre stile |
| 46 1/8 – 104 | KALLAX 4x4 (57 7/8) |
| 104 – 104 3/4 | right stile |
| 104 3/4 – 105 1/2 | side gap |

Ceiling step lands 27" in from the left edge of the 4x3.

### Heights
- Bottom plate: 0 to 3/4"
- Carcass tops: 58 3/8"
- Top plate top (the ledge): 59 1/8"
- Upper panel: 59 1/8" to ceiling — 22 7/8" tall over the left 27", 13 7/8" over
  the remaining 75 1/2"

## Upper panel
1/2" MDF, 102 1/2" wide (between the upper jambs), stepped profile, three pieces
(48 + 48 + 6 1/2) with seams backed by cleats. Currently planned centred in depth,
giving a 7 11/16" ledge open to each room. Held by 3/4" x 1 1/2" cleats on both
faces at the top plate and again at the ceiling — four runs of 102 1/2".

## Facing (board and batten)
- 4x3 backer, office face: one 1/4" plywood board (paint-grade, birch or poplar core), 43 7/8" x 57 5/8"
- 4x4 backer, bedroom face: two 1/4" plywood boards (paint-grade, birch or poplar core), 28 15/16" x 57 5/8" each
- Battens: 1x3 primed pine (3/4" x 2 1/2"), three per face — one at each outer
  edge, one centred. On the 4x4 the centre batten covers the MDF seam; on the 4x3
  it's decorative.
- Resulting bays: bedroom 25 3/16" x 2, office 18 3/16" x 2
- The top plate edge acts as the cap rail, the bottom plate edge as the base rail
- Upper panel stays flat — the battens read as wainscot below the ledge line

## Finish
- Bedroom-facing surfaces painted very light pink; white KALLAX
- Office side colour undecided
- Baseboard to match each room's existing profile, run across the bottom plate edge
  — a simple flat/rounded-top profile, no ogee/colonial detail (see photos/baseboard.jpg)
- Nothing gets mounted to the backers — posters taped only

## Materials estimate (please check)
- 3/4" plywood: 3 sheets (2 if the wall cleats are 1x4 pine instead)
- 1/4" plywood (paint-grade): 3 sheets (backers)
- 1/2" MDF: 1 sheet (upper panel)
- 1x3 primed pine: ~4 sticks of 8' (battens)
- 1x2 primed pine: ~4 sticks (upper panel perimeter and ceiling trim)
- Baseboard: ~18 linear feet
- Cleats: rip from plywood offcuts, or pine boards if cheaper

## Track light (decided)
A track light runs along the ceiling in the tall-ceiling (82") zone, mounted
perpendicular to the divider — it runs front-to-back through the opening, from
the office ceiling into the bedroom ceiling a short distance. All the heads are
on the office side, but a junction box and a short length of rail cross the
opening plane onto the bedroom side (see photos/track-light.jpg for the box and
track profile).

Position along the opening's width: standing in the bedroom looking at the
divider, the track is on the RIGHT side of the tall-ceiling zone — i.e. near
where the tall zone meets the ceiling step down to the 9" duct soffit (real-x
near STEP_X, ~28 3/4" from the external wall), not near either the external
wall or the internal wall.

Decided approach: position the upper panel's opening edge (in depth, at this
track's width-position near the ceiling step) just on the bedroom side of the
junction box — past the box, not cutting into it. This leaves the box fully
exposed and accessible in the open bedroom-ceiling area beyond the panel
(satisfies NEC 314.29 without a cutout/curb/trim assembly), while the bare
track beyond the box continues a short way further and passes through the
same gap — its constant, low-profile shape lets it pull through that same
opening if the divider is ever removed, since every fastening point along it
stays reachable from either side. Because this only affects the panel locally
at the track's width-position (not its whole length), the box's position also
biases the panel slightly toward the bedroom side there — a local, not
whole-panel, off-center shift.

This replaces the two previously-considered options (oversized cutout with a
curb/trim, or biasing the whole upper panel toward the bedroom face along its
entire length) — no cutout and no whole-panel re-centring are needed once the
panel edge itself is placed past the box, locally, only where the track
crosses.

Still needed: the actual field measurement of the box/track's position and
projection past the wall plane, to place this precisely in geometry.js and
draw it in section.html. Until then this is recorded as the decided approach,
not yet reflected in the drawings' geometry.

## Open questions to resolve
- Wall thickness at the opening vs the 15 3/8" divider depth — how far does the
  assembly project into each room, and does it project into one room or both?
  This determines the track-light bias option and where the wall cleats land.
- Ceiling joist direction and whether the ceiling is level across 105 1/2"
- Wall stud locations on both sides
- Floor type — carpet vs hard surface changes how the bottom plate bears and levels
    - Linoleum
- Any outlets or switches on the side walls inside the divider footprint
    - No
- Any HVAC vents in the opening or the soffit
    - No
- How the two rooms connect once this opening is closed (is there another door?)
    - There is already a door on each side of the room
- Sound: bedroom next to office. Worth a second layer of MDF on one side?
     - no - office user can be quiet if someone is sleeping in bedroom - this is rare
- How removable does "non-permanent" need to be — are ceiling cleats into joists
  and lags into studs acceptable?
    - yes acceptable


## Additional Room contents for rendering perspective

### Office
from right to left we will have an ikea alex drawer unit - the tall one which is 45.5" tall and same width as the shorter ones.  to the left of that the shorter alex unit Width 14 1/8 " Depth 22 7/8 " Height 27 1/2 " there are 2 of this under a white alex desktop which is 79" long. there is a aeron chair under the desk. This leaves a ~12" gap between the wall and the left of the desk

### Bedroom

44x23 desk on bedroom side on right in front of 4x4
the bedroom side will have a white kallax and the backer panels on this side will be painted a very light pink
the desk is a brown stained wood antique desk with drawers on each side