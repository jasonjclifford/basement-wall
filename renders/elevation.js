// ============================================================================
// Shared elevation-drawing logic for bedroom.html and office.html. Both pages
// look at the same divider from opposite rooms — everything here is generic
// over `mirror` (false = bedroom/unmirrored, true = office/mirrored) and a
// `furniture` callback that draws that room's furniture overlay.
//
// Requires geometry.js and svg-helpers.js to be loaded first.
// ============================================================================

function drawElevation(containerId, opts) {
  const { mirror, drawFurniture, toggleId } = opts;

  const PXPI = 6.2;
  const MARGIN = 26; // headroom so outward dimension labels don't clip
  // Canvas height is cropped to the real ceiling (CEIL_HIGH) plus a small
  // fixed label strip — NOT drawn out to an assumed room height. The actual
  // ceiling height above the opening is an open question (see prompt.md), so
  // there's nothing real to draw there; inventing wall space up to ROOM_H
  // just to have somewhere to put dimension labels reads as a real, large
  // gap above the divider that doesn't exist in the design.
  const TOP_LABEL_STRIP = 16; // headroom above the real ceiling for the two width-dimension labels only
  const totalW = (OPEN_W + MARGIN*2) * PXPI;
  const totalH = (CEIL_HIGH + TOP_LABEL_STRIP + 12) * PXPI;
  const svg = el("svg", { viewBox: `0 0 ${totalW} ${totalH}`, xmlns: NS });

  function X(xin) {
    return (MARGIN + (mirror ? (OPEN_W - xin) : xin)) * PXPI;
  }
  function Y(yin) { return totalH - (yin + 12) * PXPI; }

  const g = el("g", {});
  svg.appendChild(g);
  const dim = dimLineFactory(X, Y, g);
  const vdim = vDimLineFactory(X, Y, g);
  const { rect: rectIn, line: lineIn } = boundDrawers(X, Y, g);

  // ---- Floor / wall ---- Wall fill stops at the real ceiling (CEIL_HIGH);
  // above that is just the fixed label strip, left blank (no wall texture) —
  // there's no known ceiling height to depict up there.
  g.appendChild(el("rect", {x:0, y:Y(0), width: totalW, height: totalH-Y(0), fill:"#ded6c8"}));
  g.appendChild(el("rect", {x:0, y:Y(CEIL_HIGH), width: totalW, height: Y(0)-Y(CEIL_HIGH), fill:"#f4f1ea"}));

  // ---- Opening / casing outline ----
  const openLeftX = X(0), openRightX = X(OPEN_W);
  g.appendChild(el("rect", {
    x: Math.min(openLeftX, openRightX) - 4, y: Y(CEIL_HIGH) - 4,
    width: Math.abs(openRightX-openLeftX) + 8, height: Y(0) - Y(CEIL_HIGH) + 8,
    fill:"none", stroke:"#b8ab90", "stroke-width": 6
  }));

  // ---- Ceiling step / soffit — the shaded band is exactly the real 9" drop
  // (CEIL_HIGH to CEIL_LOW), not extended above the true ceiling line. ----
  const stepXcoord = X(ceilStepAbs);
  // The low (soffit) zone is always real-x ceilStepAbs..OPEN_W — X() already
  // accounts for mirroring, so this needs no mirror-conditional of its own.
  // (A previous version picked X(0) when mirrored, which is the TALL zone's
  // other edge — that put the shaded soffit rect and its label over the tall
  // side instead of the low side in the office view.)
  const openingScreenRightEdge = X(OPEN_W);
  const path = `M ${X(0)} ${Y(CEIL_HIGH)} L ${stepXcoord} ${Y(CEIL_HIGH)} L ${stepXcoord} ${Y(CEIL_LOW)} L ${X(OPEN_W)} ${Y(CEIL_LOW)}`;
  g.appendChild(el("path", {d:path, fill:"none", stroke:"#a8977a", "stroke-width":2, "stroke-dasharray":"4,3"}));
  g.appendChild(el("rect", {
    x: Math.min(stepXcoord, openingScreenRightEdge), y: Y(CEIL_HIGH),
    width: Math.abs(openingScreenRightEdge - stepXcoord),
    height: Y(CEIL_LOW) - Y(CEIL_HIGH), fill:"#e8e0d0"
  }));
  // Label appended later (after drawUpperPanel) rather than here — the
  // upper-panel rect spans up to CEIL_LOW too and paints over anything
  // added before it in the same <g>, in SVG's painter's-model z-order.

  // ================= STRUCTURE =================
  rectIn(0, OPEN_W, FLOOR_Y, bottomPlateTop, {fill:"#c9bda0", stroke:"#8a7a55", "stroke-width":1});
  const stileColor = {fill:"#d8cdb2", stroke:"#8a7a55", "stroke-width":1};
  rectIn(xLeftStile0, xLeftStile1, bottomPlateTop, carcassTop+0.75, stileColor);
  rectIn(xCenter0, xCenter1, bottomPlateTop, carcassTop+0.75, stileColor);
  rectIn(xRightStile0, xRightStile1, bottomPlateTop, carcassTop+0.75, stileColor);
  rectIn(0, OPEN_W, carcassTop, ledgeTop, {fill:"#c9bda0", stroke:"#8a7a55", "stroke-width":1});

  // ================= KALLAX units =================
  function drawKallax(x0,x1, openFace, tint) {
    const top = carcassTop;
    rectIn(x0,x1,bottomPlateTop,top, {fill: openFace ? "#ffffff" : (tint||"#f6f2ea"), stroke:"#555", "stroke-width":1.5});
    const w = x1-x0;
    const isBig = w > 50;
    const cols = isBig ? 4 : 3;
    const rows = 4;
    const cellW = w/cols, cellH = (top-bottomPlateTop)/rows;
    for (let c=1;c<cols;c++) lineIn(x0+c*cellW, bottomPlateTop, x0+c*cellW, top, {stroke: openFace?"#999":"#bbb","stroke-width":1});
    for (let r=1;r<rows;r++) lineIn(x0, bottomPlateTop+r*cellH, x1, bottomPlateTop+r*cellH, {stroke: openFace?"#999":"#bbb","stroke-width":1});
    if (openFace) {
      for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
        rectIn(x0+c*cellW+0.3, x0+(c+1)*cellW-0.3, bottomPlateTop+r*cellH+0.3, bottomPlateTop+(r+1)*cellH-0.3, {fill:"#e5e0d5"});
      }
    }
  }

  // BATTEN_W comes from geometry.js — it is sized to cover the KALLAX bay
  // play in the worst case, so it must not be hardcoded here.
  const battenStyle = {fill:"#faf7ef", stroke:"#9c8f6f", "stroke-width":0.75};
  function drawBatten(cx, top) {
    rectIn(cx-BATTEN_W/2, cx+BATTEN_W/2, bottomPlateTop, top, battenStyle);
    lineIn(cx-BATTEN_W/2, bottomPlateTop, cx-BATTEN_W/2, top, {stroke:"#c9bc9a","stroke-width":0.5});
    lineIn(cx+BATTEN_W/2, bottomPlateTop, cx+BATTEN_W/2, top, {stroke:"#c9bc9a","stroke-width":0.5});
  }

  // Every backer's outer edges land exactly at a stile (left/center/right —
  // see geometry.js's Layout table), so a separate "outer edge" batten on
  // each backer would just sit next to bare stile face rather than covering
  // it. Instead each stile gets ONE shared 1x3 batten centered on it (drawn
  // once in drawStileTrim, not per-backer) — the backer's own middle batten
  // is the only one left: seam-covering on the 4x4 (2 boards), purely
  // decorative on the 4x3 (1 board, no seam — kept anyway so both backer
  // faces read as a consistent 3-bay board-and-batten look).
  function drawBoardBatten(x0,x1, boardColor, nBoards) {
    const top = carcassTop;
    if (nBoards === 1) {
      rectIn(x0,x1,bottomPlateTop,top, {fill:boardColor, stroke:"#555", "stroke-width":1.5});
      drawBatten((x0+x1)/2, top); // decorative — no seam to cover
    } else {
      const mid = (x0+x1)/2;
      rectIn(x0,mid,bottomPlateTop,top, {fill:boardColor, stroke:"#555", "stroke-width":1});
      rectIn(mid,x1,bottomPlateTop,top, {fill:boardColor, stroke:"#555", "stroke-width":1});
      drawBatten((x0+x1)/2, top); // covers the seam between the two boards
    }
  }

  // One batten centred on each stile. These are what hide the bay play: the
  // KALLAX floats in a bay cut BAY_PLAY wider than the unit, and the batten
  // laps from the stile onto the unit far enough to cover that reveal even
  // when the unit is pushed fully to one end. Each stile has its own width,
  // so the centre is computed per stile rather than assuming one thickness.
  function drawStileTrim() {
    const top = carcassTop;
    [[xLeftStile0, xLeftStile1],
     [xCenter0, xCenter1],
     [xRightStile0, xRightStile1]].forEach(([a,b]) => drawBatten((a+b)/2, top));
  }

  function drawUpperPanel() {
    rectIn(0, ceilStepAbs, ledgeTop, CEIL_HIGH, {fill:"#efe9dc", stroke:"#8a7a55", "stroke-width":1});
    rectIn(ceilStepAbs, OPEN_W, ledgeTop, CEIL_LOW, {fill:"#efe9dc", stroke:"#8a7a55", "stroke-width":1});
    lineIn(0, ledgeTop, OPEN_W, ledgeTop, {stroke:"#6b5d3f","stroke-width":1.5});
    // Seam between panel pieces 1 (tall zone) and 2 (low zone) falls AT the
    // ceiling step (UPPER_PANEL_SEAM_1 === ceilStepAbs, by design — see
    // geometry.js) so every piece is a plain rectangle, not an L-shape. The
    // step's own boundary line (the path drawn above, before this function
    // runs) already marks that seam; a separate highlight there would just
    // double up on it. Only seam 2 (mid-span in the low zone) needs its own
    // highlighted cap-strip rect, since it falls inside a flat ceiling zone
    // with no other line marking it.
    rectIn(UPPER_PANEL_SEAM_2 - 0.75, UPPER_PANEL_SEAM_2 + 0.75, ledgeTop, CEIL_LOW,
      {fill:"#e9e3d3", stroke:"#9c8f6f", "stroke-width":0.75});
    // Vertical blocking behind each seam (top plate to ceiling cleat) keeps
    // the ~102"-wide panel from bowing between only top/bottom cleats — see
    // geometry.js's UPPER_PANEL_SEAM_1/2 comment. Drawn as a thin stile-color
    // strip just inside the panel line so it reads as structure, not trim.
    [UPPER_PANEL_SEAM_1, UPPER_PANEL_SEAM_2].forEach(seamX => {
      const blockTop = seamX <= ceilStepAbs ? CEIL_HIGH : CEIL_LOW;
      rectIn(seamX - 0.375, seamX + 0.375, ledgeTop, blockTop, {fill:"#c9bda0", stroke:"#8a7a55", "stroke-width":0.5});
    });
    // Third blocking run, at the center stile's x-position — NOT a panel
    // seam, added purely so the tipping-restraint ceiling bracket has a
    // structural member to land on. The center stile stops at ledgeTop like
    // the other two stiles; without this run there is nothing between the
    // top plate and the ceiling here. Drawn the same way as the seam
    // blocking (same fill) but with a small bracket glyph at its top since
    // this is the one that actually carries the ceiling connection.
    rectIn(CENTER_BLOCKING_X - 0.375, CENTER_BLOCKING_X + 0.375, ledgeTop, CEIL_LOW,
      {fill:"#c9bda0", stroke:"#8a7a55", "stroke-width":0.5});
    lineIn(CENTER_BLOCKING_X - 2, CEIL_LOW, CENTER_BLOCKING_X + 2, CEIL_LOW, {stroke:"#8a7a55", "stroke-width":2});
  }

  // ---- Assemble by side ----
  if (!mirror) {
    drawKallax(xK43_0, xK43_1, true, "#fff");
    // Backer spans the BAY, not the unit — it closes the play either side.
    drawBoardBatten(xBay44_0, xBay44_1, "#f6d7dd", 2);
    drawStileTrim();
    drawUpperPanel();
    g.appendChild(text((X(xK43_0)+X(xK43_1))/2, Y(carcassTop)+18, "KALLAX 4x3 (open shelves)", 11));
    g.appendChild(text((X(xK44_0)+X(xK44_1))/2, Y(carcassTop)+18, "KALLAX 4x4 backer — pink board & batten", 11));
  } else {
    drawKallax(xK44_0, xK44_1, true, "#fff");
    // Backer spans the BAY, not the unit — it closes the play either side.
    drawBoardBatten(xBay43_0, xBay43_1, "#e9e3d3", 1);
    drawStileTrim();
    drawUpperPanel();
    g.appendChild(text((X(xK44_0)+X(xK44_1))/2, Y(carcassTop)+18, "KALLAX 4x4 (open shelves)", 11));
    g.appendChild(text((X(xK43_0)+X(xK43_1))/2, Y(carcassTop)+18, "KALLAX 4x3 backer — board & batten (color TBD)", 11));
  }
  g.appendChild(text((stepXcoord + openingScreenRightEdge)/2, Y(CEIL_LOW)-8, "9\" duct soffit", 11, {fill:"#8a7c5f"}));
  // NOTE: both sides get the same LEDGE_DEPTH — the panel is currently
  // planned centred in depth (equal ledges). The "~10 3/8\" office / 5\"
  // bedroom" split in prompt.md is Option 2 of the still-open track-light
  // decision (an alternate, NOT-yet-adopted biased-panel layout) — this
  // label should not show that number until biasing is actually decided.
  g.appendChild(text(X(ceilStepAbs/2), Y(carcassTop)+34, `ledge ${inchLabel(LEDGE_DEPTH)} deep`, 10, {fill:"#6b5d3f"}));
  // Stile trim label, low on the center stile where there's clear floor-level
  // space in both rooms' layouts (furniture and other labels sit higher up).
  g.appendChild(text(X((xCenter0+xCenter1)/2), Y(bottomPlateTop)+22, "1x3 batten over stile", 8, {fill:"#6b5d3f", anchor:"middle"}));
  // One label for both seams (identical in treatment: 1x2 cap strip + hidden
  // vertical blocking behind it) — placed at seam 2, not seam 1, since seam 1
  // sits exactly at the ceiling step where the "9\" duct soffit" label and
  // the step's dashed line already crowd that spot. Seam 2 is safely inside
  // the flat low-ceiling zone.
  g.appendChild(text(X(UPPER_PANEL_SEAM_2), Y(ledgeTop)+9, "1x2 cap strip + blocking at seam", 8, {fill:"#6b5d3f", anchor:"middle"}));
  // Center-stile blocking + ceiling bracket label, placed just below the
  // low-ceiling line (there's clear space between the "9\" duct soffit"
  // label above and the seam label below) — this is the one blocking run
  // that isn't at a panel seam, so it needs its own callout.
  g.appendChild(text(X(CENTER_BLOCKING_X), Y(CEIL_LOW)+12, "blocking + ceiling bracket (over center stile)", 8, {fill:"#6b5d3f", anchor:"middle"}));

  // ================= DIMENSIONS =================
  // Width labels sit in the fixed label strip just above the real ceiling —
  // not floating above an assumed room height. Labels are computed from the
  // live constants (inchLabel) rather than hardcoded, so a measurement
  // update in geometry.js keeps every label in sync automatically.
  dim(0, OPEN_W, CEIL_HIGH+2, `${inchLabel(OPEN_W)} opening (wall to wall)`, {offset:6, size:10.5});
  // Frame overall width (stile face to stile face) — the number that actually
  // gets cut to. Replaces a former "inside casing" callout: this opening has
  // no casing, and the old floor-level baseboard-to-baseboard reading it drew
  // was never a constraint on the frame. See geometry.js's opening notes.
  // The frame now spans the full opening (the outer stiles ARE the wall
  // cleats, hard against each wall), so an overall-frame dimension would just
  // repeat the opening above. Call out the two bays instead — those are the
  // numbers the frame is actually built to, each cut oversized so its KALLAX
  // floats. See geometry.js's width-scheme note.
  dim(xBay43_0, xBay43_1, CEIL_HIGH+2, `${inchLabel(BAY_43)} bay`, {offset:22, size:9, color:"#a89570"});
  dim(xBay44_0, xBay44_1, CEIL_HIGH+2, `${inchLabel(BAY_44)} bay`, {offset:22, size:9, color:"#a89570"});
  if (!mirror) {
    dim(xK43_0, xK43_1, FLOOR_Y, inchLabel(K43_W), {offset:18});
    dim(xK44_0, xK44_1, FLOOR_Y, inchLabel(K44_W), {offset:18});
  } else {
    dim(xK44_0, xK44_1, FLOOR_Y, inchLabel(K44_W), {offset:18});
    dim(xK43_0, xK43_1, FLOOR_Y, inchLabel(K43_W), {offset:18});
  }
  dim(xLeftStile0, xLeftStile1, FLOOR_Y, "3/4\"", {offset:34, size:8.5, color:"#a89570"});
  dim(xCenter0, xCenter1, FLOOR_Y, "3/4\"", {offset:34, size:8.5, color:"#a89570"});
  // Height dimensions go on whichever real-x end stays clear of the furniture
  // overlay. Furniture is drawn against the same physical wall it actually
  // sits at (INTERNAL_WALL_X for the bedroom desk, EXTERNAL_WALL_X for the
  // office run — see geometry.js), using the mirror-aware X, so which screen
  // side is clear differs by room: bedroom's desk is at high real-x (clear
  // side is real-x=0); office's run is at low real-x (clear side is
  // real-x=OPEN_W).
  const heightBaselineX = mirror ? OPEN_W : 0;
  // These four labels are computed from the live constants (inchLabel), like
  // every other dimension on this page — a previous version hardcoded the
  // pre-measurement prompt.md numbers here (3/4"/57 5/8"/22 7/8"/13 7/8"),
  // which drifted out of sync with geometry.js's actual measured values and
  // would have shown a handyman numbers that contradict the cut list.
  vdim(FLOOR_Y, bottomPlateTop, heightBaselineX, `${inchLabel(bottomPlateTop)} base`, {offset:-14, size:8.5});
  vdim(bottomPlateTop, carcassTop, heightBaselineX, `${inchLabel(carcassTop-bottomPlateTop)} carcass`, {offset:-14});
  vdim(carcassTop, ledgeTop, heightBaselineX, `${inchLabel(ledgeTop-carcassTop)} ledge`, {offset:-14, size:8.5});
  vdim(ledgeTop, CEIL_HIGH, heightBaselineX, `${inchLabel(CEIL_HIGH-ledgeTop)} upper (tall side)`, {offset:-14, size:9});
  vdim(ledgeTop, CEIL_LOW, ceilStepAbs, `${inchLabel(CEIL_LOW-ledgeTop)} upper (low side)`, {offset:14, size:9, color:"#8a7c5f"});

  // ================= FURNITURE (drawn IN FRONT of the divider — same picture
  // plane, parallel to it, not on a perpendicular wall). Uses the same
  // mirror-aware X as the structure, so furniture renders against whichever
  // screen side its real physical wall actually maps to: the bedroom desk
  // (against the internal wall, high real-x) lands screen-right in the
  // unmirrored bedroom view; the office run (against the external wall, low
  // real-x) lands screen-right in the mirrored office view too — because
  // mirroring flips which real-x end is on screen-right. See geometry.js's
  // EXTERNAL_WALL_X/INTERNAL_WALL_X note for which wall each run is against.
  // =================
  const fg = el("g", {id: toggleId});
  g.appendChild(fg);
  const { rect: rectF, line: lineF } = boundDrawers(X, Y, fg);
  const dimF = dimLineFactory(X, Y, fg);
  function textF(x,y,str,size,fopts){ fg.appendChild(text(x,y,str,size,fopts)); }

  // Passed as ROOM_H for backward compat with bedroom.html/office.html's
  // furniture callbacks, but now holds CEIL_HIGH (the real ceiling) rather
  // than an assumed room height — those callbacks only use it to run the
  // dashed "internal wall"/"external wall" reference line up through the
  // visible wall area, which should stop at the real ceiling, not an
  // invented one.
  if (drawFurniture) drawFurniture({ X, Y, rectF, lineF, dimF, textF, ROOM_H: CEIL_HIGH });

  document.getElementById(containerId).appendChild(svg);
}
