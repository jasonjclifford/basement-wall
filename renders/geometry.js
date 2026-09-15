// ============================================================================
// Shared room/divider geometry (inches). Single source of truth for every page.
// Derived from prompt.md — if a measurement changes there, change it here once
// and every page (bedroom/office/plan/section) picks it up automatically.
// ============================================================================

// ---- Opening ----
// THERE IS NO CASING ON THIS OPENING. The side walls are bare drywall
// corners at standing height; the only trim is the baseboard at the floor
// (confirmed visually in photos/baseboard.jpg and by the user, Sept 2026).
// Earlier versions of this file carried a "casing ~3/4" proud each side"
// assumption inherited from prompt.md, and treated the floor-level
// baseboard-to-baseboard reading as an "inside casing" constraint on the
// frame width. Both were wrong, and together they manufactured a phantom
// 1/8"-of-slack crisis. The two field readings are in fact consistent:
//
//   wall to wall (bare drywall, at KALLAX top)   106 1/8"
//   baseboard face to baseboard face (at floor)  104 3/16"
//   difference / 2                             =    15/16"  <- the baseboard
//
// So the frame's real constraint is OPEN_W (bare wall to bare wall), not the
// floor reading. BASE_FACE_IN is retained only to size the side gap, since
// the frame must pass in front of the baseboard without notching.
const OPEN_W = 105.25;       // wall to wall, bare drywall, at KALLAX height, measured (105 1/4")
const BASE_FACE_IN = 104.1875; // baseboard face to baseboard face at the floor, measured (104 3/16")

// Baseboard projection, DERIVED by subtracting the two readings above. This is
// a placeholder and is flagged OPEN in reference.html: it compounds the error
// of two measurements taken at different heights into the one number the side
// gap depends on. ~17/32" is plausible (close to the 5/8" originally assumed),
// but MEASURE THE BASEBOARD DIRECTLY before cutting the wall cleats — hook a
// tape on the baseboard face and measure back to the wall above it.
const BASEBOARD_PROUD = (OPEN_W - BASE_FACE_IN) / 2; // ~17/32"
const FLOOR_Y = 0;
const CEIL_LOW = 73.25;      // right ~77 1/4" of opening, measured (73 1/4"-73 1/2" across a few points; using the low end as worst case)
const CEIL_HIGH = 82.125;    // left ~28 3/4" of opening, measured
const STEP_X = 28.75;        // from left wall, ceiling steps down here, measured (28 3/4")
const ROOM_H = 96;           // assumed 8' room height for wall drawing beyond opening
const ceilStepAbs = STEP_X;

// ---- Divider assembly (measured from left edge of the inside-casing
// opening, offset by the 0.75" casing gap) ----
// KALLAX dimensions below are measured actuals (see measurements-checklist.md),
// not the nominal spec sheet — the assembled units run slightly larger than
// spec, and the drawings/cut list should reflect what's actually in the room.
// ---- Width scheme: FIT-TOLERANT, not a rigid sum of KALLAX widths ----
//
// Earlier versions sized the frame as an exact sum of the measured KALLAX
// widths, so every measurement error and every bit of particleboard bow
// accumulated into one go/no-go dimension with ~1/8" of slack. This version
// deliberately builds each bay OVERSIZED, lets the units float, and covers
// the difference with the battens that were always in the design. A gap that
// trim hides is not a defect; a frame that won't go in is.
//
// The whole scheme is governed by one fixed budget:
//
//   opening                      105 1/4"
//   two KALLAX units             101 13/16"
//   ------------------------------------
//   budget for everything else     3 7/16"
//
// That 3 7/16" must contain both side members, the center stile, AND all the
// play. It is a fixed pie — width spent on one is taken from another.
//
// Two decisions follow from it:
//
// 1. THE OUTER STILES ARE MERGED INTO THE WALL CLEATS. Formerly these were two
//    stacked 3/4" members per side (a cleat screwed to the studs, then a stile
//    screwed to the cleat). One member does both jobs and reclaims 3/4" per
//    side for play. The merged member still fills the side gap in front of the
//    baseboard, still screws to the studs, and still takes the backer edge.
//
// 2. THE CENTER STILE STAYS 3/4" FULL-DEPTH PLYWOOD. Widening it along the
//    wall buys screw-holding but almost no tipping resistance: resistance to
//    an out-of-plane push scales with the member's DEPTH INTO THE ROOM cubed,
//    and that is DIVIDER_DEPTH (15 15/16") regardless of how wide the stile
//    is. Full-depth plywood is ~86x stiffer than a flat 2x4 on that axis, and
//    costs the least width, leaving the most for play. See reference.html's
//    "Why the frame is plywood, not dimensional lumber".
const K43_W = 44;            // measured (spec: 43 7/8")
const K44_W = 57.8125;       // measured, bottom-of-carcass worst case (spec: 57 7/8"; top measured 57 7/8", bottom 57 13/16")

// Play per bay: the bay is cut this much wider than its unit, so the unit
// floats rather than needing to be a press fit. Split to either side of the
// unit as it is positioned; worst case the whole amount lands at one edge,
// which is what BATTEN_W below must cover.
const BAY_PLAY = 0.5;
const BAY_43 = K43_W + BAY_PLAY;  // 44 1/2"
const BAY_44 = K44_W + BAY_PLAY;  // 58 5/16"

const CENTER_STILE = 0.75;   // full-depth plywood — see note 2 above

// The merged cleat/stile at each wall takes whatever the budget leaves, split
// evenly. Derived rather than fixed so the arithmetic cannot drift: the frame
// always totals exactly OPEN_W by construction.
const SIDE_MEMBER = (OPEN_W - BAY_43 - BAY_44 - CENTER_STILE) / 2; // ~3/4" each
// The side member must still clear the baseboard it passes in front of. If a
// direct baseboard measurement comes in thicker than this, thin the member and
// give the difference back to BAY_PLAY (more play is harmless — the battens
// cover it); do NOT grow the frame, which has nowhere to go.
const CLEAT_THICK = SIDE_MEMBER;
const STILE = SIDE_MEMBER;   // outer "stile" and cleat are now one member
const GAP = 0;               // no separate gap: the side member fills it
const bottomPlateTop = 0.75;
const carcassTop = bottomPlateTop + 57.6875; // 57 11/16" — tallest of the measured KALLAX heights (57 5/8"-57 11/16"), so the frame clears every unit
const ledgeTop = carcassTop + 0.75;
const DIVIDER_DEPTH = 15.4375 + 0.25*2; // measured carcass depth 15 7/16" (both units) + 1/4" backer each face = 15 15/16"

// Frame member positions, walked left to right across the opening. These are
// BAY boundaries — the openings the frame creates — not the units themselves.
// Real-x 0 is the left (external) wall face; the frame spans the full opening.
const xLeftStile0 = 0;                                  // hard against the wall
const xLeftStile1 = xLeftStile0 + SIDE_MEMBER;
const xBay43_0 = xLeftStile1;
const xBay43_1 = xBay43_0 + BAY_43;
const xCenter0 = xBay43_1;
const xCenter1 = xCenter0 + CENTER_STILE;
const xBay44_0 = xCenter1;
const xBay44_1 = xBay44_0 + BAY_44;
const xRightStile0 = xBay44_1;
const xRightStile1 = xRightStile0 + SIDE_MEMBER;        // == OPEN_W by construction

// Where each KALLAX actually SITS inside its bay. Drawn centred, which is the
// sensible default — it splits BAY_PLAY into two equal reveals the battens
// cover either side. In the room the installer can slide a unit to one end and
// take the whole gap at the other; the batten widths are sized for that worst
// case, so either choice is fine.
const xK43_0 = xBay43_0 + (BAY_43 - K43_W) / 2;
const xK43_1 = xK43_0 + K43_W;
const xK44_0 = xBay44_0 + (BAY_44 - K44_W) / 2;
const xK44_1 = xK44_0 + K44_W;

// ---- Battens: the pieces that make the play invisible ----
// The batten over the center stile is the binding case. Worst case a unit is
// pushed fully away from the stile, putting the entire BAY_PLAY as one gap at
// that edge. The batten must cover its half of the stile, cross that gap, and
// still land on the unit with something to spare:
//
//   overlap onto the unit = BATTEN_W/2 - CENTER_STILE/2 - BAY_PLAY
//
// 1x3 (2 1/2") gives 1/2" of overlap at BAY_PLAY = 1/2"; 1x2 (1 1/2") gives
// none and is not an option. 1x3 is the minimum, 1x4 the comfortable choice.
const BATTEN_W = 3.5;        // 1x4 nominal (actual 3 1/2")
const BATTEN_THICK = 0.75;

// ---- Cap rail: the horizontal member at the top of the KALLAX ----
// Runs the full width on BOTH room faces, at the carcass-top / top-plate
// line. This is not decorative trim — it closes four separate gaps that
// nothing else in the design covers:
//
//   1. The top plate presents a bare 3/4" plywood EDGE to each room,
//      ~105" long, at eye level. Every other visible surface on these
//      faces is finished (paint-grade backer face, primed pine batten);
//      without the rail there is a raw sheet edge running the full width.
//   2. LIGHT PATH. The frame is built to the TALLEST measured KALLAX
//      (57 11/16"), but the units measured 57 5/8"-57 11/16". A shorter
//      unit sits up to 1/16" below the top plate, leaving an open slot the
//      width of that bookcase. Light blocking is a primary requirement, so
//      this is a real defect, not a cosmetic one.
//   3. The backer's cut top edge is exposed where it meets the top plate.
//   4. The vertical stile battens otherwise terminate in mid-air. Board and
//      batten runs its verticals into a cap rail; without one, six battens
//      just stop.
//
// Sized 1x3 (2 1/2"): covers the 3/4" plate edge and still laps 1 3/4" down
// onto the KALLAX face, which closes any height variance with margin. On the
// open-shelf face it crosses the top row of cubbies, costing ~12% of that
// row's opening height — 1x4 would cost ~19%, which starts to be noticeable
// when loading books, and 1x2 would lap only 3/4" onto the unit. 1x3 also
// matches the backer centre battens, so the horizontal reads as a deliberate
// member rather than an odd size.
//
// The vertical battens run UP INTO this rail and stop beneath it (the rail is
// one continuous piece per face), which is standard board-and-batten practice
// and the simplest to execute.
const CAP_RAIL_W = 2.5;      // 1x3 nominal (actual 2 1/2")
const CAP_RAIL_THICK = 0.75;
const capRailTop = ledgeTop;                     // flush with the top plate's top surface
const capRailBottom = capRailTop - CAP_RAIL_W;   // laps down onto the KALLAX face
// How far the rail laps onto the KALLAX below the carcass top — the margin
// that swallows unit-height variance.
const capRailOverlapOnUnit = carcassTop - capRailBottom;
const battenOverlapCenter = BATTEN_W/2 - CENTER_STILE/2 - BAY_PLAY;
// At the walls the same batten covers the side member and laps the unit by
// BATTEN_W - SIDE_MEMBER - BAY_PLAY, which is far larger — the walls were
// never the tight case.
const battenOverlapWall = BATTEN_W - SIDE_MEMBER - BAY_PLAY;

// ---- Upper panel + cleats (see section.html) ----
// 1/2" paint-grade plywood (birch/poplar core, same family as the backers —
// switched from MDF for basement moisture tolerance), stepped profile,
// centred in the divider's depth -> equal ledge open to each room. Held by
// 3/4" x 1 1/2" cleats on both faces, at the top plate AND again at the
// ceiling (four cleat runs) — the panel sits in a channel rather than being
// face-fastened, which makes install forgiving and seals light well.
//
// WHY 1/2" AND NOT THE BACKERS' 1/4": the backers are fully supported by the
// KALLAX carcass behind them; this panel is a free membrane with nothing
// behind it. The span that matters is its HEIGHT between the cleats — up to
// CEIL_HIGH-ledgeTop (~22 15/16") in the tall zone. At 1/4" that is a ~92:1
// span-to-thickness ratio: it would oil-can and drum whenever touched, and
// it WILL be touched, because there is a ledge directly beneath it. At 1/2"
// the ratio is ~46:1, which is stiff enough to feel solid.
//
// WHY THERE IS NO SEAM BLOCKING (simplified — this used to specify vertical
// blocking behind each seam): an earlier version argued that "a 102 1/2"-wide
// sheet held only top and bottom will bow over that span". That reasoning had
// the span backwards. The panel is captured on both faces along its whole top
// AND bottom edge — it sits in a channel, not spanning free between two
// points. A sheet cannot bow out-of-plane mid-span when both long edges are
// continuously restrained, unless something pushes it, and nothing does. The
// real unsupported dimension is the panel's height (~14"-23"), over which 1/2"
// plywood is emphatically flat: 1/2" drywall spans 16"-24" between studs held
// only at its edges and stays flat. The blocking was solving a problem that
// was not there, so it is gone. (The CENTER_BLOCKING_X run below stays — it is
// not part of the panel system at all, it is the tipping load path.)
const UPPER_PANEL_THICK = 0.5;
const CLEAT_W = 0.75, CLEAT_H = 1.5;
const LEDGE_DEPTH = (DIVIDER_DEPTH - UPPER_PANEL_THICK) / 2; // each side, when the panel is centred in depth — derived from DIVIDER_DEPTH so it stays correct if that's re-measured

// Upper panel seam: ONE seam, at the ceiling step. Two pieces result:
//   1. xLeftStile1 .. STEP_X      (full CEIL_HIGH height, the tall zone)
//   2. STEP_X .. xRightStile0     (full CEIL_LOW height, the whole low zone)
//
// Putting the seam AT the step is what makes both pieces plain rectangles. A
// seam at a round number instead (48"/96" from real-x 0, an early version of
// this file) crosses the step at STEP_X, turning one piece into an L-shaped
// cutout with an unspecified sheet layout.
//
// WHY ONLY ONE SEAM (simplified — this used to be two, splitting the low zone
// in half): the panel is ~103 9/16" wide overall, which exceeds a 96" sheet,
// so sheet size forces exactly ONE seam. It does not force a second. The low
// zone as a single piece is ~75 21/32" x ~14 1/16", which fits a 4x8 sheet
// comfortably. The second seam existed only to give the (now-removed) seam
// blocking a mid-span place to land — with the blocking gone, the seam has no
// job. One less panel piece, one less cap strip, one less joint to align and
// caulk. And note the CENTER_BLOCKING_X run lands inside the low zone anyway,
// so there is a mid-span member there regardless, for free.
const UPPER_PANEL_SEAM_1 = STEP_X;

// Third vertical blocking run, at the center stile's x-position — NOT a
// panel seam (the center stile at x≈45.4-46.1" doesn't land at either seam
// above), added purely to carry tipping-restraint load up to the ceiling.
// The center stile itself stops at ledgeTop (~59 3/16") like the other two
// stiles — there is no framing member between the top plate and the ceiling
// anywhere in this design except the upper panel's own cleats/blocking. A
// bracket "at the top of the center stile" (an earlier version of this
// design) would have had nothing to attach to for the last ~14" up to the
// ceiling; this blocking run IS that missing member. It lands in the
// CEIL_LOW zone (center stile's x is past STEP_X), so it only needs to run
// ledgeTop..CEIL_LOW (~14 1/16"), not the full ~23" of the tall zone.
// Force path: a push on the divider center transfers through the KALLAX
// carcass (unfastened, so it only transmits contact force) into the top
// plate (one continuous member across all 3 stiles) into this blocking run
// into the ceiling bracket into a joist or drywall anchor. See
// reference.html's "Structural review findings".
const CENTER_BLOCKING_X = (xCenter0 + xCenter1) / 2;

// ---- The two side walls, named by which one is the foundation wall — not
// "left"/"right", which flips meaning between rooms and is a standing
// source of confusion. Standing in either room facing the divider:
//   - EXTERNAL_WALL_X (real-x 0): the foundation wall. Bedroom's LEFT wall
//     and office's RIGHT wall are this same physical wall.
//   - INTERNAL_WALL_X (real-x ~OPEN_W, at the divider's right-stile end):
//     the interior partition wall. Bedroom's RIGHT wall and office's LEFT
//     wall are this same physical wall.
// The bedroom desk and the office Alex/desktop run sit flush against the
// divider's own backer face (parallel to it) but are NOT against the same
// physical wall as each other — the bedroom desk's outer edge is at the
// internal wall; the office run's outer edge (the tall Alex) is at the
// external wall (see prompt.md's "from right to left" office layout).
const EXTERNAL_WALL_X = 0;
const INTERNAL_WALL_X = xRightStile1; // 104.75

// Bedroom desk: 44"W x 23"D, back against the 4x4 backer, right edge at the internal wall.
const BED_DESK_W = 44, BED_DESK_D = 23;
const bedDeskX1 = INTERNAL_WALL_X, bedDeskX0 = bedDeskX1 - BED_DESK_W; // 60.75 .. 104.75

// Office run: tall Alex (14 1/8") + 79" desktop (on 2 short Alex units, flush end
// to end) = 93 1/8" total. Per prompt.md's office layout ("from right to left:
// tall Alex, short Alex, desk... ~12" gap between the wall and the left of the
// desk") the tall Alex is at the office's right, which is the EXTERNAL wall
// side (office's right wall / bedroom's left wall are the same physical
// foundation wall — see the EXTERNAL_WALL_X/INTERNAL_WALL_X note above). So
// the run starts flush at EXTERNAL_WALL_X, leaving the ~12" gap at the
// internal-wall end, back against the divider (spans most of the 4x3 backer
// and into the 4x4's open shelves).
const ALEX_W = 14.125, ALEX_H_SHORT = 27.5, ALEX_H_TALL = 45.5, DESK_LEN = 79, DESK_DEPTH = 22.875;
const OFFICE_RUN_LEN = ALEX_W + DESK_LEN; // 93.125
const officeRunX0 = EXTERNAL_WALL_X, officeRunX1 = officeRunX0 + OFFICE_RUN_LEN; // 0 .. 93.125
