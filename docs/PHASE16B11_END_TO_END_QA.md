# PHASE 16B.11 — END-TO-END VERIFICATION & BALANCING

## Purpose
This phase is a non-destructive QA gate for the complete Real World Expedition pipeline before merge.

## Verification coverage

### World generation
- generated world exists
- Thunder Bay identity
- tactical data exists
- POI count
- spawn candidate count
- extraction candidate count
- coordinate validity

### Gameplay pipelines
- terrain authority available
- movement/vision integration available
- POI authority available
- loot/threat integration available
- extraction authority available
- Real World Mode controller available

### Balancing sanity checks
- discovery radius: 50–140m
- interaction radius: 20–60m
- extraction radius: 20–60m
- spawn minimum distance: 80–1200m
- POI count ceiling: 5000

### Transaction safety
The QA harness enables the complete Real World Mode and verifies:
- terrain enabled
- POIs enabled
- loot/threat enabled
- extraction enabled
- full rollback works

### Terrain test
When generated water geometry is available:
- enable movement/vision
- query water coordinate
- verify movement is denied
- disable movement/vision

## Runtime API

```js
CheegunRealWorldQA.run()
CheegunRealWorldQA.summary()
window.cheegunRealWorldQA
```

The harness automatically runs after game load and prints a table to the browser console.

## QA interpretation

```
0 errors
  ↓
PASS
  ↓
Ready for manual expedition test

Warnings only
  ↓
Review missing sample data

Any error
  ↓
Do not merge
  ↓
Fix the failed subsystem
```

## Manual acceptance test

1. Load Thunder Bay.
2. Confirm QA PASS.
3. Run `CheegunRealWorldMode.start(playerPosition)`.
4. Move across open terrain.
5. Attempt water crossing.
6. Enter forest.
7. Discover generated POI.
8. Search generated POI.
9. Confirm inventory receives loot.
10. Trigger high-risk POI threat.
11. Reach assigned extraction.
12. Complete extraction.
13. Disable mode and verify prototype fallback.

## Merge gate
Phase 16B should not merge into `main` until automated QA has no errors and the manual expedition acceptance test succeeds.
