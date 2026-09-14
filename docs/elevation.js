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
  const openingScreenRightEdge = mirror ? X(0) : X(OPEN_W);
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

  function drawBoardBatten(x0,x1, boardColor, nBoards) {
    const top = carcassTop;
    if (nBoards === 1) {
      rectIn(x0,x1,bottomPlateTop,top, {fill:boardColor, stroke:"#555", "stroke-width":1.5});
    } else {
      const mid = (x0+x1)/2;
      rectIn(x0,mid,bottomPlateTop,top, {fill:boardColor, stroke:"#555", "stroke-width":1});
      rectIn(mid,x1,bottomPlateTop,top, {fill:boardColor, stroke:"#555", "stroke-width":1});
    }
    const battenW = 2.5;
    const battenStyle = {fill:"#faf7ef", stroke:"#9c8f6f", "stroke-width":0.75};
    function batten(cx) {
      rectIn(cx-battenW/2, cx+battenW/2, bottomPlateTop, top, battenStyle);
      lineIn(cx-battenW/2, bottomPlateTop, cx-battenW/2, top, {stroke:"#c9bc9a","stroke-width":0.5});
      lineIn(cx+battenW/2, bottomPlateTop, cx+battenW/2, top, {stroke:"#c9bc9a","stroke-width":0.5});
    }
    batten(x0 + battenW/2);
    batten(x1 - battenW/2);
    batten((x0+x1)/2);
  }

  function drawUpperPanel() {
    rectIn(0, ceilStepAbs, ledgeTop, CEIL_HIGH, {fill:"#efe9dc", stroke:"#8a7a55", "stroke-width":1});
    rectIn(ceilStepAbs, OPEN_W, ledgeTop, CEIL_LOW, {fill:"#efe9dc", stroke:"#8a7a55", "stroke-width":1});
    lineIn(0, ledgeTop, OPEN_W, ledgeTop, {stroke:"#6b5d3f","stroke-width":1.5});
  }

  // ---- Assemble by side ----
  if (!mirror) {
    drawKallax(xK43_0, xK43_1, true, "#fff");
    drawBoardBatten(xK44_0, xK44_1, "#f6d7dd", 2);
    drawUpperPanel();
    g.appendChild(text((X(xK43_0)+X(xK43_1))/2, Y(carcassTop)+18, "KALLAX 4x3 (open shelves)", 11));
    g.appendChild(text((X(xK44_0)+X(xK44_1))/2, Y(carcassTop)+18, "KALLAX 4x4 backer — pink board & batten", 11));
  } else {
    drawKallax(xK44_0, xK44_1, true, "#fff");
    drawBoardBatten(xK43_0, xK43_1, "#e9e3d3", 1);
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

  // ================= DIMENSIONS =================
  // Width labels sit in the fixed label strip just above the real ceiling —
  // not floating above an assumed room height. Labels are computed from the
  // live constants (inchLabel) rather than hardcoded, so a measurement
  // update in geometry.js keeps every label in sync automatically.
  dim(0, OPEN_W, CEIL_HIGH+2, `${inchLabel(OPEN_W)} opening (wall to wall)`, {offset:6, size:10.5});
  dim(GAP, GAP+CASE_IN, CEIL_HIGH+2, `${inchLabel(CASE_IN)} inside casing`, {offset:22, size:9.5, color:"#a89570"});
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
  vdim(FLOOR_Y, bottomPlateTop, heightBaselineX, "3/4\" base", {offset:-14, size:8.5});
  vdim(bottomPlateTop, carcassTop, heightBaselineX, "57 5/8\" carcass", {offset:-14});
  vdim(carcassTop, ledgeTop, heightBaselineX, "3/4\" ledge", {offset:-14, size:8.5});
  vdim(ledgeTop, CEIL_HIGH, heightBaselineX, "22 7/8\" upper (tall side)", {offset:-14, size:9});
  vdim(ledgeTop, CEIL_LOW, ceilStepAbs, "13 7/8\" upper (low side)", {offset:14, size:9, color:"#8a7c5f"});

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
