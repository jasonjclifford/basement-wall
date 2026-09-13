// ============================================================================
// Shared room/divider geometry (inches). Single source of truth for every page.
// Derived from prompt.md — if a measurement changes there, change it here once
// and every page (bedroom/office/plan/section) picks it up automatically.
// ============================================================================

// ---- Opening ----
// CASE_IN is measured directly (floor reading between the baseboards, the
// most precise reading taken): 104 3/16". OPEN_W (wall-to-wall) is the
// directly measured 106 1/8" reading, cross-checked by butting both KALLAX
// units together against one wall and measuring the leftover gap at the
// other (implied opening: ~106 1/16"-106 1/8", confirming the direct
// reading). That's ~2" more than CASE_IN + 2x the 3/4" casing-proud
// assumption (105 11/16") would predict — the casing-proud figure is
// probably imprecise, or the casing doesn't run perfectly parallel to the
// wall face. Either way OPEN_W only matters for drawing context (it's never
// a cut dimension) so the two independently-measured readings win over the
// derived one. See reference.html's "measurement notes".
const CASE_IN = 104.1875;    // inside casing, measured (104 3/16")
const CASING_PROUD = 0.75;   // casing proud of the wall, each side, measured
const OPEN_W = 106.125;      // wall to wall, measured + cross-checked (106 1/8")
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
const GAP = 0.75;
const STILE = 0.75;
const K43_W = 44;            // measured (spec: 43 7/8")
const CENTER_STILE = 0.75;
const K44_W = 57.8125;       // measured, bottom-of-carcass worst case (spec: 57 7/8"; top measured 57 7/8", bottom 57 13/16")
const bottomPlateTop = 0.75;
const carcassTop = bottomPlateTop + 57.6875; // 57 11/16" — tallest of the measured KALLAX heights (57 5/8"-57 11/16"), so the frame clears every unit
const ledgeTop = carcassTop + 0.75;
const DIVIDER_DEPTH = 15.4375 + 0.25*2; // measured carcass depth 15 7/16" (both units) + 1/4" backer each face = 15 15/16"

const xLeftStile0 = GAP;
const xLeftStile1 = xLeftStile0 + STILE;              // 1.5
const xK43_0 = xLeftStile1;                            // 1.5
const xK43_1 = xK43_0 + K43_W;                          // 45.375
const xCenter0 = xK43_1;
const xCenter1 = xCenter0 + CENTER_STILE;               // 46.125
const xK44_0 = xCenter1;
const xK44_1 = xK44_0 + K44_W;                          // 104
const xRightStile0 = xK44_1;
const xRightStile1 = xRightStile0 + STILE;              // 104.75

// ---- Upper panel + cleats (see section.html) ----
// 1/2" MDF, stepped profile, centred in the divider's depth -> equal ledge
// open to each room. Held by 3/4" x 1 1/2" cleats on both faces, at the top
// plate AND again at the ceiling (four cleat runs total).
const UPPER_PANEL_THICK = 0.5;
const CLEAT_W = 0.75, CLEAT_H = 1.5;
const LEDGE_DEPTH = (DIVIDER_DEPTH - UPPER_PANEL_THICK) / 2; // each side, when the panel is centred in depth — derived from DIVIDER_DEPTH so it stays correct if that's re-measured

// ---- The two side walls, named by which one is the foundation wall — not
// "left"/"right", which flips meaning between rooms and is a standing
// source of confusion. Standing in either room facing the divider:
//   - EXTERNAL_WALL_X (real-x 0): the foundation wall. Bedroom's LEFT wall
//     and office's RIGHT wall are this same physical wall.
//   - INTERNAL_WALL_X (real-x ~OPEN_W, at the divider's right-stile end):
//     the interior partition wall. Bedroom's RIGHT wall and office's LEFT
//     wall are this same physical wall. Both the bedroom desk and the
//     office Alex/desktop run sit flush against the divider's own backer
//     face (parallel to it), with one end against THIS wall.
const EXTERNAL_WALL_X = 0;
const INTERNAL_WALL_X = xRightStile1; // 104.75

// Bedroom desk: 44"W x 23"D, back against the 4x4 backer, right edge at the internal wall.
const BED_DESK_W = 44, BED_DESK_D = 23;
const bedDeskX1 = INTERNAL_WALL_X, bedDeskX0 = bedDeskX1 - BED_DESK_W; // 60.75 .. 104.75

// Office run: tall Alex (14 1/8") + 79" desktop (on 2 short Alex units, flush end
// to end) = 93 1/8" total, tall Alex's right side at the internal wall, back
// against the divider (spans most of the 4x3 backer and into the 4x4's open shelves).
const ALEX_W = 14.125, ALEX_H_SHORT = 27.5, ALEX_H_TALL = 45.5, DESK_LEN = 79, DESK_DEPTH = 22.875;
const OFFICE_RUN_LEN = ALEX_W + DESK_LEN; // 93.125
const officeRunX1 = INTERNAL_WALL_X, officeRunX0 = officeRunX1 - OFFICE_RUN_LEN; // 11.625 .. 104.75
