# PHASE 16B.12 — BROWSER RUNTIME TEST & INTEGRATION REPAIR

## Purpose
Add a browser-side smoke-test gate after all Phase 16B scripts load.

## Runtime checks
- Leaflet loaded
- world generator loaded
- world renderer loaded
- terrain authority loaded
- movement/vision bridge loaded
- generated POI authority loaded
- generated loot/threat loaded
- generated extraction authority loaded
- Real World Mode loaded
- QA API loaded
- outbreak map available
- generated world available
- generated tactical data available
- no uncaught runtime errors
- no unhandled promise rejections
- Phase 16B.11 QA gate

## API
```js
CheegunRuntimeTest.run()
CheegunRuntimeTest.waitAndRun()
window.cheegunRuntimeTest
```

The test automatically runs after a 4.5-second startup delay to allow the existing game initialization chain to complete.

## Manual browser acceptance
Open the game and inspect:
1. map renders
2. no red console errors
3. `CheegunRuntimeTest.run().pass === true`
4. `CheegunRealWorldQA.summary().errors === 0`
5. enable Real World Mode
6. manually test expedition lifecycle

## Merge gate
Phase 16B remains unmerged until an actual browser session passes this smoke test and the manual expedition acceptance test succeeds.
