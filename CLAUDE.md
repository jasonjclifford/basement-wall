# basement-wall — working notes for Claude Code

Room-divider build project. `prompt.md` is the source of truth for every
measurement — read it before trusting any number that isn't in `renders/geometry.js`.
The renders are a communication tool for the user and their handyman, not a CAD
tool; they're schematic SVG, not to be used for cutting without checking against
`prompt.md`'s cut list.

## Site structure (`renders/`)

Multi-page static site, one page per drawing, sharing geometry and drawing code:

- `geometry.js` — every measurement (inches), derived from `prompt.md`. Single
  source of truth. If a measurement in `prompt.md` changes, change it **here**
  and every page picks it up — never hardcode a number in a page script.
- `svg-helpers.js` — generic SVG primitives (`el`, `text`, `dimLineFactory`,
  `vDimLineFactory`, `boundDrawers`, `wireToggle`). No page-specific geometry.
- `elevation.js` — shared `drawElevation()` used by both room-facing elevations
  (`bedroom.html`, `office.html`); the mirroring math (`mirror: true/false`) and
  furniture-overlay wiring live here once, not duplicated per room.
- `style.css` — shared styling, including `.svg-narrow` (see below).
- One `.html` per drawing (`bedroom`, `office`, `plan`, `section`, plus
  `index.html` as the landing/status page), each loading the shared `.js`
  files and adding only what's specific to that view (furniture placement
  callback, or its own small coordinate setup for non-elevation views like
  `plan.html` / `section.html`).

**`docs/` is a mirror of `renders/`, not a separate build.** GitHub Pages serves
from `/docs` on `main` (configured via the GitHub API, not a workflow file).
After editing anything in `renders/`, copy it over before committing:

```bash
cp -r renders/* docs/
```

There is no build step doing this automatically — forgetting it is the #1 way
to ship a page that looks right locally and stale on the public site.

### Adding a new drawing

1. Add any new measurements to `geometry.js` (never inline them elsewhere).
2. If it's a room-facing elevation, add a `drawXFurniture()` callback and call
   `drawElevation()` from `elevation.js` — see `bedroom.html` for the pattern.
3. If it's a different kind of view (plan, section, anything not looking
   through the opening at the divider), write its own small `X()`/`Y()`
   coordinate setup in the page's own `<script>`, but still pull `rect`/`line`
   from `boundDrawers()` and dimensions from `dimLineFactory()`/`vDimLineFactory()`
   in `svg-helpers.js` rather than hand-rolling new ones.
4. Add a nav link to `<nav class="pages">` in **every** page (including the new
   one, pointing at itself with `class="current"`) — there's no shared template,
   so this is manual; grep for `nav.pages` to find every copy.
5. A drawing that's naturally narrow/tall (a cross-section, not a wide room
   elevation) should wrap its container `<div>` in `<div class="svg-narrow">` —
   see `section.html`. Without it, `width:100%` stretches a tall-aspect SVG to
   the full panel width and blows up its rendered height absurdly (bit us once:
   a 310×505 viewBox rendered at 1726×2810px).

### Verifying a drawing before publishing

SVG text doesn't wrap or auto-avoid collisions — every label position is a
manual guess that can silently overlap another label or run off the viewBox.
**Before publishing any change to a drawing**, run this in the browser console
(via `mcp__claude-in-chrome__javascript_tool`) against each affected page,
checking every `<svg>` on the page:

```js
function overlaps(a, b) { return !(a.x+a.width < b.x || b.x+b.width < a.x || a.y+a.height < b.y || b.y+b.height < a.y); }
function checkSvg(sel) {
  const svg = document.querySelector(sel);
  const vb = svg.viewBox.baseVal;
  const visible = Array.from(svg.querySelectorAll('text')).filter(t => t.textContent.trim().length);
  const overflow = visible.filter(t => { const b=t.getBBox(); return b.x+b.width>vb.width||b.x<0||b.y<0||b.y+b.height>vb.height; }).map(t=>t.textContent.slice(0,40));
  const boxes = visible.map(t => ({t, b: t.getBBox()}));
  const collisions = [];
  for (let i=0;i<boxes.length;i++) for (let j=i+1;j<boxes.length;j++) if (overlaps(boxes[i].b,boxes[j].b)) collisions.push([boxes[i].t.textContent.slice(0,30), boxes[j].t.textContent.slice(0,30)]);
  return {overflow, collisions};
}
```

Zero `overflow` and zero `collisions` is the bar — not "looks fine in one
screenshot." A screenshot only shows the current scroll position; this check
covers the whole SVG regardless of viewport.

### Local preview workflow

Don't push straight to GitHub Pages to eyeball a change. Preview locally first
via the `outpost:publish-site` skill against the lore vault's `sites/` tree
(same multi-file directory works — `publish_site.py renders/ <slug> --vault-path
<path> --overwrite`), open it in Chrome, run the collision check above, fix,
republish locally, repeat. Only `cp -r renders/* docs/` + commit + push once
it's clean.

### GitHub Pages

Repo: `jasonjclifford/basement-wall` (public). Pages source is `/docs` on
`main`, enabled via `gh api -X POST repos/.../pages -f 'source[branch]=main'
-f 'source[path]=/docs'` — already done, don't redo it. After pushing, Pages
takes ~30–60s to rebuild; poll with:

```bash
gh api repos/jasonjclifford/basement-wall/pages/builds/latest --jq '{status, error}'
```

Live at `https://jasonjclifford.github.io/basement-wall/`. This is what gets
handed to the handyman — keep `index.html`'s status-summary panel current
(open items, what changed) since that's the first thing a non-technical
reader sees.

## Working with subagents on this project

Most of this work is fiddly SVG coordinate math and label-collision fixing —
not the kind of thing worth spinning up a subagent for by default; do it
inline. Reach for a subagent when:

- **A genuinely new drawing type** (not a variant of an existing page) needs
  designing from scratch — dispatch `craft:architect` or `Plan` first to work
  out the coordinate scheme and what it needs to show, *before* writing SVG
  code, rather than iterating blind in the main session.
- **A large batch of mechanical fixes** across multiple pages (e.g. "add a
  dimension for X to every elevation") — a `fork` can churn through the
  repetitive edits while you keep the main session free for the user.
- Model choice: this work is 100% visual/spatial reasoning + careful
  arithmetic, not deep architecture — `sonnet` at default effort is the right
  default. Don't reach for `opus` here unless a genuinely hard geometry
  problem (like the furniture-perpendicular-vs-parallel confusion earlier in
  this project) needs more careful reasoning about a real-world layout
  ambiguity before writing any code.

## Context management

This project involves a lot of back-and-forth: publish → screenshot → find a
bug → fix → republish → re-check. That loop burns context fast, especially
when a screenshot or full-page console dump gets pulled into the transcript.
**When context usage is running high (the session has been through several
publish/verify cycles, or you notice large tool outputs accumulating), say so
explicitly and suggest the user start a new session** rather than pushing
through — a fresh session re-reading this file and `prompt.md` picks up
exactly where the last one left off, with far less overhead than continuing
in a bloated context.

To make that handoff cheap:
- Prefer the collision-check script (above) over raw screenshots when you just
  need a pass/fail — it returns a few lines of JSON instead of an image.
- Only screenshot when you need to actually *see* the layout, and prefer
  `zoom` on a specific region over a full-page shot once you know roughly
  where the problem is.
- Don't re-read files you just wrote — the harness already knows their state.
