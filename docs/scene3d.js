// ============================================================================
// Shared 3D scene builder for bedroom-3d.html / office-3d.html. Uses the same
// geometry.js constants as the 2D elevations/plan so the 3D view can never
// drift from the measured design — no dimension is re-typed here.
//
// Coordinate system (inches, Three.js right-handed, Y-up):
//   x = real-x along the opening (0 at EXTERNAL_WALL_X, OPEN_W at INTERNAL_WALL_X)
//   y = height off the floor (FLOOR_Y = 0)
//   z = depth; the divider's own depth is centered on z=0, so it spans
//       -DIVIDER_DEPTH/2 .. +DIVIDER_DEPTH/2. Positive z = toward the OFFICE
//       side (matches the prompt.md convention that the 4x3 opens to the
//       office and the 4x4 opens to the bedroom — see geometry.js Layout).
//       So: bedroom camera/furniture sit at z < -DIVIDER_DEPTH/2 (negative),
//       office camera/furniture sit at z > +DIVIDER_DEPTH/2 (positive).
//
// Requires geometry.js and three.js (global THREE) loaded first.
// ============================================================================

const HALF_DEPTH = DIVIDER_DEPTH / 2;

function inToM(x) { return x; } // keep raw inches as scene units throughout

function buildDividerScene(scene) {
  const woodPly = new THREE.MeshStandardMaterial({ color: 0xd8cdb2, roughness: 0.85 });
  const stileColor = new THREE.MeshStandardMaterial({ color: 0xc9bda0, roughness: 0.85 });
  const kallaxWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const kallaxCubbyDark = new THREE.MeshStandardMaterial({ color: 0xe3ddcf, roughness: 0.9 });
  const pinkPanel = new THREE.MeshStandardMaterial({ color: 0xf6d7dd, roughness: 0.7 });
  const officePanel = new THREE.MeshStandardMaterial({ color: 0xe9e3d3, roughness: 0.7 });
  const battenMat = new THREE.MeshStandardMaterial({ color: 0xfaf7ef, roughness: 0.75 });
  const upperPanelMat = new THREE.MeshStandardMaterial({ color: 0xefe9dc, roughness: 0.8 });

  function box(w, h, d, mat, cx, cy, cz) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  // ---- Bottom plate, spanning full opening width, centered in depth ----
  box(OPEN_W, bottomPlateTop - FLOOR_Y, DIVIDER_DEPTH, stileColor,
      OPEN_W / 2, (FLOOR_Y + bottomPlateTop) / 2, 0);

  // ---- Top plate (the ledge), full width ----
  box(OPEN_W, ledgeTop - carcassTop, DIVIDER_DEPTH, stileColor,
      OPEN_W / 2, (carcassTop + ledgeTop) / 2, 0);

  // ---- Three stiles ----
  [[xLeftStile0, xLeftStile1], [xCenter0, xCenter1], [xRightStile0, xRightStile1]].forEach(([x0, x1]) => {
    box(x1 - x0, carcassTop - bottomPlateTop, DIVIDER_DEPTH, stileColor,
        (x0 + x1) / 2, (bottomPlateTop + carcassTop) / 2, 0);
  });

  // ---- KALLAX units: open face matches elevation.js's actual behavior, not
  // geometry.js's Layout comment (see the board-and-batten note below) — the
  // 4x3 shows OPEN shelves on the BEDROOM (-z) face and gets its backer on
  // the OFFICE (+z) face; the 4x4 is the reverse, open to OFFICE (+z) with
  // its pink backer on the BEDROOM (-z) face. Approximate as a white carcass
  // box + a grid of recessed cubby faces on the open side. ----
  function drawKallax(x0, x1, cols, openToPositiveZ) {
    const w = x1 - x0, h = carcassTop - bottomPlateTop, d = DIVIDER_DEPTH;
    box(w, h, d, kallaxWhite, (x0 + x1) / 2, (bottomPlateTop + carcassTop) / 2, 0);
    // Cubby grid on the open face — thin dark insets suggesting the 4x4 grid.
    const rows = 4;
    const cellW = w / cols, cellH = h / rows;
    const faceZ = openToPositiveZ ? d / 2 + 0.05 : -d / 2 - 0.05;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = x0 + c * cellW + cellW / 2;
        const cy = bottomPlateTop + r * cellH + cellH / 2;
        box(cellW * 0.86, cellH * 0.86, 0.1, kallaxCubbyDark, cx, cy, faceZ);
      }
    }
  }
  drawKallax(xK43_0, xK43_1, 3, false);  // 4x3 — open to bedroom (-z)
  drawKallax(xK44_0, xK44_1, 4, true);   // 4x4 — open to office (+z)

  // ---- Backer + board-and-batten on the closed face of each KALLAX ----
  // Follows elevation.js's actual drawing, not a re-derivation from the
  // "4x3 opens to office / 4x4 opens to bedroom" comment in geometry.js:
  // elevation.js's bedroom (mirror:false) view draws the 4x3 as OPEN shelves
  // and the 4x4 as the pink board-and-batten BACKER; its office (mirror:true)
  // view draws the 4x4 as OPEN shelves and the 4x3 as the neutral backer.
  // So each unit's "open" face and "backer" face are opposite-room-facing
  // from what geometry.js's Layout comment implies, and this 3D scene
  // matches elevation.js (the one already treated as authoritative for what
  // each room actually sees) rather than the other source.
  function drawBoardBatten(x0, x1, mat, nBoards, faceZ) {
    const top = carcassTop, w = x1 - x0, h = top - bottomPlateTop;
    if (nBoards === 1) {
      box(w * 0.98, h * 0.98, 0.25, mat, (x0 + x1) / 2, (bottomPlateTop + top) / 2, faceZ);
      addBatten((x0 + x1) / 2, faceZ, top);
    } else {
      const mid = (x0 + x1) / 2;
      box((mid - x0) * 0.98, h * 0.98, 0.25, mat, (x0 + mid) / 2, (bottomPlateTop + top) / 2, faceZ);
      box((x1 - mid) * 0.98, h * 0.98, 0.25, mat, (mid + x1) / 2, (bottomPlateTop + top) / 2, faceZ);
      addBatten(mid, faceZ, top);
    }
  }
  const BATTEN_W = 2.5;
  function addBatten(cx, faceZ, top) {
    const bz = faceZ + (faceZ > 0 ? 0.15 : -0.15);
    box(BATTEN_W, top - bottomPlateTop, 0.3, battenMat, cx, (bottomPlateTop + top) / 2, bz);
  }
  function drawStileTrim(faceZ) {
    [xLeftStile0, xCenter0, xRightStile0].forEach(s0 => {
      addBatten(s0 + STILE / 2, faceZ, carcassTop);
    });
  }

  drawBoardBatten(xK44_0, xK44_1, pinkPanel, 2, -HALF_DEPTH - 0.02);   // 4x4 backer faces bedroom (-z)
  drawBoardBatten(xK43_0, xK43_1, officePanel, 1, HALF_DEPTH + 0.02);  // 4x3 backer faces office (+z)
  drawStileTrim(-HALF_DEPTH - 0.02);
  drawStileTrim(HALF_DEPTH + 0.02);

  // ---- Upper panel (stepped, centered in depth) ----
  box(ceilStepAbs, CEIL_HIGH - ledgeTop, UPPER_PANEL_THICK, upperPanelMat,
      ceilStepAbs / 2, (ledgeTop + CEIL_HIGH) / 2, 0);
  box(OPEN_W - ceilStepAbs, CEIL_LOW - ledgeTop, UPPER_PANEL_THICK, upperPanelMat,
      ceilStepAbs + (OPEN_W - ceilStepAbs) / 2, (ledgeTop + CEIL_LOW) / 2, 0);
}

// Room shell: floor, side walls, ceiling planes (schematic, per-room).
function buildRoomShell(scene, { mirror, ceilingLevel }) {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xded6c8, roughness: 0.95 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.95, side: THREE.DoubleSide });
  const soffitMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.95, side: THREE.DoubleSide });

  const zSign = mirror ? 1 : -1; // office (mirror) room extends toward +z; bedroom toward -z
  const roomDepth = 120; // schematic room depth, not measured
  const zNear = 0, zFar = zSign * roomDepth;

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(OPEN_W + 60, roomDepth),
    floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(OPEN_W / 2, 0, zSign * roomDepth / 2);
  floor.receiveShadow = true;
  scene.add(floor);

  // Ceiling: tall zone + soffit-dropped zone, each a flat plane at its height.
  const ceilTall = new THREE.Mesh(new THREE.PlaneGeometry(ceilStepAbs, roomDepth), wallMat);
  ceilTall.rotation.x = Math.PI / 2;
  ceilTall.position.set(ceilStepAbs / 2, CEIL_HIGH, zSign * roomDepth / 2);
  scene.add(ceilTall);

  const ceilLow = new THREE.Mesh(new THREE.PlaneGeometry(OPEN_W - ceilStepAbs, roomDepth), soffitMat);
  ceilLow.rotation.x = Math.PI / 2;
  ceilLow.position.set(ceilStepAbs + (OPEN_W - ceilStepAbs) / 2, CEIL_LOW, zSign * roomDepth / 2);
  scene.add(ceilLow);

  // Soffit drop face (vertical strip at the ceiling step)
  const soffitFace = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, CEIL_HIGH - CEIL_LOW), soffitMat);
  soffitFace.rotation.y = Math.PI / 2;
  soffitFace.position.set(ceilStepAbs, (CEIL_HIGH + CEIL_LOW) / 2, zSign * roomDepth / 2);
  scene.add(soffitFace);

  // Side walls (external at x=0, internal at x=OPEN_W)
  const wallH = ROOM_H;
  const wallExternal = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, wallH), wallMat);
  wallExternal.rotation.y = Math.PI / 2;
  wallExternal.position.set(0, wallH / 2, zSign * roomDepth / 2);
  scene.add(wallExternal);

  const wallInternal = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, wallH), wallMat);
  wallInternal.rotation.y = Math.PI / 2;
  wallInternal.position.set(OPEN_W, wallH / 2, zSign * roomDepth / 2);
  scene.add(wallInternal);

  // Back wall, closing the schematic room
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(OPEN_W + 60, wallH), wallMat);
  backWall.position.set(OPEN_W / 2, wallH / 2, zFar);
  scene.add(backWall);
}

function addBedroomFurniture(scene) {
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x7a4a2b, roughness: 0.6 });
  const deskLegMat = new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.6 });
  const deskH = 30, topThick = 1.5;
  const z0 = -HALF_DEPTH - BED_DESK_D, z1 = -HALF_DEPTH; // desk sits between the divider and the bedroom
  const cz = (z0 + z1) / 2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(BED_DESK_W, topThick, BED_DESK_D), deskMat);
  top.position.set((bedDeskX0 + bedDeskX1) / 2, deskH, cz);
  top.castShadow = true;
  scene.add(top);
  // Drawer/leg blocks at each end
  [bedDeskX0 + 4, bedDeskX1 - 4].forEach(cx => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(8, deskH - 2, BED_DESK_D - 4), deskLegMat);
    leg.position.set(cx, (deskH - 2) / 2, cz);
    leg.castShadow = true;
    scene.add(leg);
  });

  // KALLAX bookcase against the far (external) wall, white, schematic
  const kallaxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const bkW = 30, bkD = 12, bkH = 41;
  const bk = new THREE.Mesh(new THREE.BoxGeometry(bkW, bkH, bkD), kallaxMat);
  bk.position.set(bkW / 2 + 2, bkH / 2, -bkD / 2 - 6);
  bk.castShadow = true;
  scene.add(bk);
}

function addOfficeFurniture(scene) {
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
  const alexMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5 });
  const chairMeshMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7, transparent: true, opacity: 0.85 });

  const tallX0 = officeRunX0, tallX1 = tallX0 + ALEX_W;
  const deskX0 = tallX1, deskX1 = deskX0 + DESK_LEN;
  const alex2X0 = deskX0, alex2X1 = alex2X0 + ALEX_W;
  const alex1X1 = deskX1, alex1X0 = alex1X1 - ALEX_W;
  const deskTopH = 29, deskThick = 1.5;
  const z0 = HALF_DEPTH, z1 = HALF_DEPTH + DESK_DEPTH;
  const cz = (z0 + z1) / 2;

  // Desktop
  const top = new THREE.Mesh(new THREE.BoxGeometry(DESK_LEN, deskThick, DESK_DEPTH), deskMat);
  top.position.set((deskX0 + deskX1) / 2, deskTopH + deskThick / 2, cz);
  top.castShadow = true;
  scene.add(top);

  // Short Alex units (legs)
  [[alex1X0, alex1X1], [alex2X0, alex2X1]].forEach(([x0, x1]) => {
    const unit = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, ALEX_H_SHORT, DESK_DEPTH * 0.85), alexMat);
    unit.position.set((x0 + x1) / 2, ALEX_H_SHORT / 2, cz);
    unit.castShadow = true;
    scene.add(unit);
  });

  // Tall Alex, against external wall
  const tall = new THREE.Mesh(new THREE.BoxGeometry(ALEX_W, ALEX_H_TALL, DESK_DEPTH * 0.85), alexMat);
  tall.position.set((tallX0 + tallX1) / 2, ALEX_H_TALL / 2, cz);
  tall.castShadow = true;
  scene.add(tall);

  // Aeron-ish chair: schematic seat + base, tucked under the desk
  const chairX = (alex1X0 + alex1X1) / 2 + 6;
  const chairZ = z1 + 10;
  const seatH = 18;
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 2.5, 20), chairMeshMat);
  seat.position.set(chairX, seatH, chairZ);
  scene.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(15, 16, 2), chairMeshMat);
  back.position.set(chairX, seatH + 10, chairZ + 7);
  back.rotation.x = -0.15;
  scene.add(back);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, seatH - 3, 12), chairSeatMat);
  col.position.set(chairX, (seatH - 3) / 2, chairZ);
  scene.add(col);
  const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 1, 16), chairSeatMat);
  baseRing.position.set(chairX, 0.5, chairZ);
  scene.add(baseRing);
}

// ---- Scene/camera/renderer bootstrap shared by both pages ----
function initScene3D(containerId, { mirror, cameraStart, furniture }) {
  const container = document.getElementById(containerId);
  const width = container.clientWidth, height = Math.round(width * 0.62);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(mirror ? 0xeee7da : 0xf2e9ec);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
  camera.position.set(cameraStart.x, cameraStart.y, cameraStart.z);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x666655, 0.7);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(40, 90, mirror ? 80 : -80);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35);
  fill.position.set(-40, 40, mirror ? -60 : 60);
  scene.add(fill);

  buildRoomShell(scene, { mirror });
  buildDividerScene(scene);
  if (furniture === "bedroom") addBedroomFurniture(scene);
  if (furniture === "office") addOfficeFurniture(scene);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(53, 25, mirror ? 10 : -10);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 20;
  controls.maxDistance = 400;
  controls.update();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const w = container.clientWidth, h = Math.round(w * 0.62);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  const handle = { scene, camera, renderer, controls };
  // Exposed for debugging/QA (console access to camera/controls) — not used
  // by the page itself, which only calls initScene3D once at load.
  window.__scene3d = window.__scene3d || {};
  window.__scene3d[containerId] = handle;
  return handle;
}
