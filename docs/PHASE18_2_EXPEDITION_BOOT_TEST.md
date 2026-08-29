# PHASE 18.2 — EXPEDITION BROWSER BOOT TEST

## Purpose
Verify that the expedition page reaches a minimum playable boot state in a real browser.

## Smoke-test gates
- game.html DOM contains game map
- Leaflet global exists
- cheegunMap instance exists
- map container has non-zero dimensions
- expedition runtime modifiers initialized
- Phase 18 runtime audit available
- Phase 18.1 dependency audit available
- boot overlay clears

## Runtime
`js/phase18-2-expedition-boot-test.js`

API:
`CheegunPhase182BootTest.run()`
`CheegunPhase182BootTest.waitForBoot()`
`CheegunPhase182BootTest.latest()`

## Result storage
Latest browser report persists under:
`cheegunPhase182BootTest_v1`

## Important limitation
Static repository inspection can verify script wiring, but PASS requires execution in an actual browser because Leaflet, map tiles, DOM dimensions and runtime initialization cannot be proven from source inspection alone.

## Current source-level status
The boot test is installed and will automatically run after the map instance appears or after a 10-second timeout. Browser execution is the next verification gate.
