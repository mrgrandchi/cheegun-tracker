# PHASE 16B.6 — RUNTIME WIRING & VERIFICATION

## Consolidated feature branch
`feature/real-world-world-generation`

All Phase 16B work now continues on this single branch.

## What changed
The exact existing `outbreak.js` gameplay loops are now wired to generated terrain when terrain authority is enabled.

### Movement
- Existing prototype collision remains fallback.
- Generated water is checked before movement segments.
- Generated terrain cost changes movement duration.
- Route aborts safely if generated terrain rejects movement.

### Vision
- Fog calculations use an effective terrain-aware vision radius.
- Forest modifiers can reduce discovery and fog radius.
- The existing weather radius cannot exceed terrain-reduced visibility.

## Verification harness
`js/phase16b6-runtime-verification.js` checks:
- Leaflet map availability
- generator availability
- generated world
- tactical data
- terrain authority
- movement/vision bridge
- Thunder Bay region identity
- generated water movement blocking when sample data exists

Results are exposed at:

```js
window.cheegunWorldVerification
CheegunWorldVerification.run()
```

## Runtime enablement
Generated terrain remains opt-in:

```js
CheegunMovementVision.enable()
```

Rollback:

```js
CheegunMovementVision.disable()
```

## Next phase
16B.7 should adopt generated POIs into discovery/search/loot, using the same feature-flagged migration strategy.
