# Shoebox Planner — Playwright Test Suite

**🔗 Live app:** [shoebox-planner.web.app](https://shoebox-planner.web.app)
**🔗 Case studies & writeup:** [kimhj-alex.github.io/QA-Portfolio/test-automation.html](https://kimhj-alex.github.io/QA-Portfolio/test-automation.html)

---

## About

This is the automated Playwright test suite for Shoebox Planner, a room-layout PWA I built from scratch. It's a companion to the manual [Shoebox Planner self-audit](https://kimhj-alex.github.io/QA-Portfolio/audits/shoebox-planner-audit.html) in my QA portfolio — some of these tests confirm findings that audit already documented by hand; others turned up things nobody had tested before.

Built in a single session as my first project using Playwright.

---

## What's Inside

```
shoebox-tests/
├── playwright.config.js
├── package.json
├── tests/
│   ├── debug-width-value.spec.js
│   ├── geometry-circle.spec.js
│   ├── geometry-oval.spec.js
│   ├── geometry-rectangle.spec.js
│   ├── geometry-rotated-oval.spec.js
│   ├── geometry-rotated-rectangle.spec.js
│   ├── geometry-rotated-square.spec.js
│   ├── geometry-square-wall-edges.spec.js
│   ├── geometry-square.spec.js
│   ├── persistence-layer-order.spec.js
│   ├── resize-dataset-rendered-mismatch.spec.js
│   ├── resize-no-upper-bound.spec.js
│   ├── resize-spinner-negative.spec.js
│   ├── resize-zero-negative-width.spec.js
│   ├── ui-sync-desktop-color.spec.js
│   ├── ui-sync-desktop-highlight.spec.js
│   ├── ui-sync-ipad-color.spec.js
│   └── ui-sync-ipad-highlight.spec.js
└── README.md
```

---

## Categories

**Geometry & Wall Clamping** · 8 tests
Every shape variant — square, rotated square, rectangle, rotated rectangle, circle, oval, rotated oval — dragged toward each wall, checking the rendered gap against the room border via `getBoundingClientRect()`. `geometry-square-wall-edges.spec.js` is the per-edge measurement pass that first surfaced the real ~2px baseline. Confirmed cross-browser on Chromium; Firefox and WebKit showed drag-simulation inconsistencies unrelated to the app's actual behavior.

**Canvas ↔ List Sync** · 4 tests
Clicking furniture and clicking its sidebar entry, in both directions, on desktop and iPad. Automates two known findings from the self-audit — RP-002 (list → canvas highlight broken on desktop) and RP-007 (color swatch tap broken on iPad) — alongside the directions that already work correctly.

**Save & Reload** · 1 test
A full save → saved-rooms list → reopen flow, confirming RP-004: layer order reverses on every reload.

**Resize Limits** · 4 tests
Furniture has no enforced minimum or maximum size, unlike font size. Covers zero/negative width making a shape invisible but still interactive, the absence of an upper bound (contained only by wall-clamping), a real behavioral split between typing a negative value directly versus reaching it through the input's spinner, and a check on whether the stored `dataset.width` value matches what's actually rendered.

**`debug-width-value.spec.js`** is a scratch file used to inspect an input's live value mid-session, kept in the repo as-is rather than cleaned up after the fact.

---

## Running the tests

```bash
npm init playwright@latest    # if setting up fresh
npx playwright test           # run everything
npx playwright test geometry-square --project=chromium   # run one file
```

Firefox and WebKit are excluded from a few tests where drag-simulation speed or behavior diverges from Chromium in ways unrelated to the app itself — noted individually in the affected test files.

---

## Tech

Playwright, run against the live app at shoebox-planner.web.app — no local server, no mocked state. Config uses `slowMo` for headed debugging runs; disabled for normal test execution.

---

## Contact

**Email:** kimhj.business@gmail.com
**Portfolio:** [kimhj-alex.github.io/QA-Portfolio](https://kimhj-alex.github.io/QA-Portfolio)
