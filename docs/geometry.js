// ============================================================================
// Shared room/divider geometry (inches). Single source of truth for every page.
// Derived from prompt.md — if a measurement changes there, change it here once
// and every page (bedroom/office/plan/section) picks it up automatically.
// ============================================================================

// ---- Opening ----
const OPEN_W = 105.5;        // wall to wall
const CASE_IN = 104;         // inside casing
const FLOOR_Y = 0;
const CEIL_LOW = 73;         // right 77" of opening
const CEIL_HIGH = 82;        // left 28.5" of opening
const STEP_X = 28.5;         // from left wall, ceiling steps down here
const ROOM_H = 96;           // assumed 8' room height for wall drawing beyond opening
const ceilStepAbs = STEP_X;

// ---- Divider assembly (measured from left edge of the 104" inside-casing
// opening, offset by the 0.75" casing gap) ----
const GAP = 0.75;
const STILE = 0.75;
const K43_W = 43.875;
const CENTER_STILE = 0.75;
const K44_W = 57.875;
const carcassTop = 58.375;
const ledgeTop = 59.125;
const bottomPlateTop = 0.75;
const DIVIDER_DEPTH = 15.875; // 15 3/8" carcass + 1/4" backer each face

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
// 1/2" MDF, stepped profile, centred in the divider's 15 7/8" depth -> equal
// 7 11/16" ledge open to each room. Held by 3/4" x 1 1/2" cleats on both faces,
// at the top plate AND again at the ceiling (four cleat runs total).
const UPPER_PANEL_THICK = 0.5;
const CLEAT_W = 0.75, CLEAT_H = 1.5;
const LEDGE_DEPTH = 7 + 11/16; // each side, when the panel is centred in depth

// ---- Furniture wall: both the bedroom desk and the office Alex/desktop run
// sit flush against the divider's own backer face (parallel to it), with one
// end against the room's side wall at the right-stile end. ----
const SIDE_WALL_X = xRightStile1; // 104.75

// Bedroom desk: 44"W x 23"D, back against the 4x4 backer, right edge at the wall.
const BED_DESK_W = 44, BED_DESK_D = 23;
const bedDeskX1 = SIDE_WALL_X, bedDeskX0 = bedDeskX1 - BED_DESK_W; // 60.75 .. 104.75

// Office run: tall Alex (14 1/8") + 79" desktop (on 2 short Alex units, flush end
// to end) = 93 1/8" total, tall Alex's right side at the wall, back against the
// divider (spans most of the 4x3 backer and into the 4x4's open shelves).
const ALEX_W = 14.125, ALEX_H_SHORT = 27.5, ALEX_H_TALL = 45.5, DESK_LEN = 79, DESK_DEPTH = 22.875;
const OFFICE_RUN_LEN = ALEX_W + DESK_LEN; // 93.125
const officeRunX1 = SIDE_WALL_X, officeRunX0 = officeRunX1 - OFFICE_RUN_LEN; // 11.625 .. 104.75
