// ============================================================================
// Generic SVG drawing helpers shared by every page. No page-specific geometry
// lives here — see geometry.js for that. Each page still builds its own
// X()/Y() coordinate functions (they differ per view: mirrored vs not,
// elevation vs plan vs section) and passes them into these factories.
// ============================================================================

const NS = "http://www.w3.org/2000/svg";

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

function text(x, y, str, size, opts) {
  opts = opts || {};
  const t = el("text", Object.assign({
    x, y, "font-size": size,
    "font-family": "-apple-system,Helvetica,Arial,sans-serif",
    fill: opts.fill || "#333",
    "text-anchor": opts.anchor || "middle"
  }, opts.attrs || {}));
  t.textContent = str;
  return t;
}

// Horizontal dimension line with end ticks, extension lines back to the
// geometry, and a background-padded label. X/Y are this view's coordinate
// functions (inches -> screen px); g is the SVG <g> to append into.
function dimLineFactory(X, Y, g) {
  return function dim(xin0, xin1, yBaseline, label, opts) {
    opts = opts || {};
    const offset = opts.offset != null ? opts.offset : 14;
    const y = Y(yBaseline) + offset;
    const xa = X(xin0), xb = X(xin1);
    const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
    const stroke = opts.color || "#7a6f52";
    g.appendChild(el("line", {x1: x0, y1: y, x2: x1, y2: y, stroke, "stroke-width": 1}));
    [x0, x1].forEach(x => g.appendChild(el("line", {x1: x, y1: y-4, x2: x, y2: y+4, stroke, "stroke-width": 1})));
    [[xin0, x0], [xin1, x1]].forEach(([xin, x]) => {
      g.appendChild(el("line", {x1: x, y1: Y(yBaseline), x2: x, y2: y, stroke, "stroke-width": 0.5, "stroke-dasharray": "2,2"}));
    });
    const midX = (x0 + x1) / 2;
    const t = text(midX, y+11, label, opts.size || 9.5, {fill: stroke});
    if (opts.bg !== false) {
      g.appendChild(el("rect", {x: midX - (label.length*2.6), y: y+2, width: label.length*5.2, height: 11, fill: "#fdfcf8", opacity: 0.85}));
    }
    g.appendChild(t);
  };
}

// Vertical dimension line (heights), same conventions as dimLineFactory.
function vDimLineFactory(X, Y, g) {
  return function vdim(yin0, yin1, xBaseline, label, opts) {
    opts = opts || {};
    const offset = opts.offset != null ? opts.offset : 14;
    const x = X(xBaseline) + offset;
    const ya = Y(yin0), yb = Y(yin1);
    const y0 = Math.min(ya, yb), y1 = Math.max(ya, yb);
    const stroke = opts.color || "#7a6f52";
    g.appendChild(el("line", {x1: x, y1: y0, x2: x, y2: y1, stroke, "stroke-width": 1}));
    [y0, y1].forEach(y => g.appendChild(el("line", {x1: x-4, y1: y, x2: x+4, y2: y, stroke, "stroke-width": 1})));
    [[yin0, y0], [yin1, y1]].forEach(([yin, y]) => {
      g.appendChild(el("line", {x1: X(xBaseline), y1: y, x2: x, y2: y, stroke, "stroke-width": 0.5, "stroke-dasharray": "2,2"}));
    });
    const midY = (y0 + y1) / 2;
    g.appendChild(el("rect", {x: x+3, y: midY-6, width: label.length*5.6, height: 12, fill: "#fdfcf8", opacity: 0.85}));
    const t = text(x+6, midY+3.5, label, opts.size || 9.5, {fill: stroke, anchor: "start"});
    g.appendChild(t);
  };
}

// rect/line helpers bound to a view's X()/Y() and an append target (a <g>).
// Returns {rect, line} so a page can create one bound pair per coordinate
// frame it needs (e.g. one for the divider frame, one for a furniture overlay
// group so it can be toggled independently).
function boundDrawers(X, Y, g) {
  function rect(x0, x1, y0, y1, style) {
    const xa = X(x0), xb = X(x1);
    const x = Math.min(xa, xb), w = Math.abs(xb - xa);
    const ya = Y(y0), yb = Y(y1);
    const y = Math.min(ya, yb), h = Math.abs(yb - ya);
    g.appendChild(el("rect", Object.assign({x, y, width: w, height: h}, style)));
    return {x, y, w, h};
  }
  function line(x0, y0, x1, y1, style) {
    g.appendChild(el("line", Object.assign({x1: X(x0), y1: Y(y0), x2: X(x1), y2: Y(y1)}, style)));
  }
  return {rect, line};
}

// Toggle-visibility wiring shared by every page that has a "Show furniture"
// (or similar) checkbox controlling one <g id="..."> inside an <svg>.
function wireToggle(containerId, toggleCheckboxId, groupId) {
  const cb = document.getElementById(toggleCheckboxId);
  if (!cb) return;
  const apply = () => {
    const svg = document.querySelector(`#${containerId} svg`);
    if (!svg) return;
    const g = svg.querySelector(`#${groupId}`);
    if (g) g.style.display = cb.checked ? "" : "none";
  };
  cb.addEventListener("change", apply);
  apply();
}
