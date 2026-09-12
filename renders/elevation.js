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
  const totalW = (OPEN_W + MARGIN*2) * PXPI;
  const totalH = (ROOM_H + 34) * PXPI;
  const svg = el("svg", { viewBox: `0 0 ${totalW} ${totalH}`, xmlns: NS });

  function X(xin) {
    return (MARGIN + (mirror ? (OPEN_W - xin) : xin)) * PXPI;
  }
  // Xu: UNMIRRORED screen-x — real-x always increases left-to-right, regardless
  // of `mirror`. Furniture (the desk, the Alex/desktop run) always sits against
  // the SAME physical wall (SIDE_WALL_X, the divider's right-stile end) and
  // should always render on the same screen side in both rooms' elevations —
  // so furniture uses Xu, not the divider-mirroring-aware X.
  function Xu(xin) { return (MARGIN + xin) * PXPI; }
  function Y(yin) { return totalH - (yin + 12) * PXPI; }

  const g = el("g", {});
  svg.appendChild(g);
  const dim = dimLineFactory(X, Y, g);
  const vdim = vDimLineFactory(X, Y, g);
  const { rect: rectIn, line: lineIn } = boundDrawers(X, Y, g);

  // ---- Floor / back wall ----
  g.appendChild(el("rect", {x:0, y:Y(0), width: totalW, height: totalH-Y(0), fill:"#ded6c8"}));
  g.appendChild(el("rect", {x:0, y:0, width: totalW, height: Y(0), fill:"#f4f1ea"}));

  // ---- Opening / casing outline ----
  const openLeftX = X(0), openRightX = X(OPEN_W);
  g.appendChild(el("rect", {
    x: Math.min(openLeftX, openRightX) - 4, y: Y(CEIL_HIGH) - 4,
    width: Math.abs(openRightX-openLeftX) + 8, height: Y(0) - Y(CEIL_HIGH) + 8,
    fill:"none", stroke:"#b8ab90", "stroke-width": 6
  }));

  // ---- Ceiling step / soffit ----
  const stepXcoord = X(ceilStepAbs);
  const openingScreenRightEdge = mirror ? X(0) : X(OPEN_W);
  const path = `M ${X(0)} ${Y(CEIL_HIGH)} L ${stepXcoord} ${Y(CEIL_HIGH)} L ${stepXcoord} ${Y(CEIL_LOW)} L ${X(OPEN_W)} ${Y(CEIL_LOW)}`;
  g.appendChild(el("path", {d:path, fill:"none", stroke:"#a8977a", "stroke-width":2, "stroke-dasharray":"4,3"}));
  g.appendChild(el("rect", {
    x: Math.min(stepXcoord, openingScreenRightEdge), y: 0,
    width: Math.abs(openingScreenRightEdge - stepXcoord),
    height: Y(CEIL_LOW), fill:"#e8e0d0"
  }));
  g.appendChild(text((stepXcoord + openingScreenRightEdge)/2, Y(CEIL_LOW)-8, "9\" duct soffit", 11, {fill:"#8a7c5f"}));

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
  g.appendChild(text(X(ceilStepAbs/2), Y(carcassTop)+34, mirror? "ledge ~10 3/8\" deep" : "ledge 7 11/16\" deep", 10, {fill:"#6b5d3f"}));

  // ================= DIMENSIONS =================
  dim(0, OPEN_W, ROOM_H+18, "105 1/2\" opening (wall to wall)", {offset:6, size:10.5});
  dim(GAP, GAP+CASE_IN, ROOM_H+18, "104\" inside casing", {offset:22, size:9.5, color:"#a89570"});
  if (!mirror) {
    dim(xK43_0, xK43_1, FLOOR_Y, "43 7/8\"", {offset:18});
    dim(xK44_0, xK44_1, FLOOR_Y, "57 7/8\"", {offset:18});
  } else {
    dim(xK44_0, xK44_1, FLOOR_Y, "57 7/8\"", {offset:18});
    dim(xK43_0, xK43_1, FLOOR_Y, "43 7/8\"", {offset:18});
  }
  dim(xLeftStile0, xLeftStile1, FLOOR_Y, "3/4\"", {offset:34, size:8.5, color:"#a89570"});
  dim(xCenter0, xCenter1, FLOOR_Y, "3/4\"", {offset:34, size:8.5, color:"#a89570"});
  // Height dimensions go on whichever real-x end stays clear of the furniture
  // overlay. Furniture always renders on SCREEN-RIGHT now (it's drawn with an
  // unmirrored Xu — see below — so it always sits toward high real-x on
  // screen, regardless of `mirror`). The clear screen-left side is real-x=0
  // unmirrored, but real-x=OPEN_W once mirrored (mirroring flips which real
  // coordinate lands on which screen side).
  const heightBaselineX = mirror ? OPEN_W : 0;
  vdim(FLOOR_Y, bottomPlateTop, heightBaselineX, "3/4\" base", {offset:-14, size:8.5});
  vdim(bottomPlateTop, carcassTop, heightBaselineX, "57 5/8\" carcass", {offset:-14});
  vdim(carcassTop, ledgeTop, heightBaselineX, "3/4\" ledge", {offset:-14, size:8.5});
  vdim(ledgeTop, CEIL_HIGH, heightBaselineX, "22 7/8\" upper (tall side)", {offset:-14, size:9});
  vdim(ledgeTop, CEIL_LOW, ceilStepAbs, "13 7/8\" upper (low side)", {offset:14, size:9, color:"#8a7c5f"});

  // ================= FURNITURE (drawn IN FRONT of the divider — same picture
  // plane, parallel to it, not on a perpendicular wall). Uses Xu (unmirrored)
  // rather than X, so furniture against the same physical wall (SIDE_WALL_X)
  // always renders on the same screen side in both rooms' elevations. =================
  const fg = el("g", {id: toggleId});
  g.appendChild(fg);
  const { rect: rectF, line: lineF } = boundDrawers(Xu, Y, fg);
  const dimF = dimLineFactory(Xu, Y, fg);
  function textF(x,y,str,size,fopts){ fg.appendChild(text(x,y,str,size,fopts)); }

  if (drawFurniture) drawFurniture({ X: Xu, Y, rectF, lineF, dimF, textF, ROOM_H });

  document.getElementById(containerId).appendChild(svg);
}
