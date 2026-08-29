# PHASE 16B.13 — LIVE EXPEDITION ACCEPTANCE TEST

## Purpose
Execute a controlled end-to-end expedition lifecycle probe inside the running browser.

## Lifecycle tested
1. Reset generated-world mode.
2. Enable Real World Mode.
3. Select a generated POI.
4. Discover the POI.
5. Locate the nearest generated POI.
6. Search the POI through generated loot authority.
7. Start a real-world expedition.
8. Assign a generated extraction.
9. Move the test position into the extraction zone.
10. Complete extraction.
11. Verify expedition status.
12. Restore inventory and reset generated systems.

## API
```js
CheegunLiveAcceptance.run()
CheegunLiveAcceptance.summary()
window.cheegunLiveAcceptance
```

The acceptance test auto-runs after startup.

## Safety
The harness snapshots and restores `outbreak_inventory` and resets generated-mode state after the test. It is intended to verify integration without leaving a synthetic test run active.

## Important limitation
This is an in-browser programmatic acceptance test, not a replacement for a human playthrough. A manual test should still validate actual controls, visuals, movement feel, combat, and extraction UX.

## Merge gate
Automated gates:
- 16B.11 QA: PASS
- 16B.12 runtime test: PASS
- 16B.13 live acceptance: PASS

Then perform one human expedition playthrough before merging Phase 16B into main.
