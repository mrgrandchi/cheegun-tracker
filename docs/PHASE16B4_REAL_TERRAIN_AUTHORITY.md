# PHASE 16B.4 — REAL TERRAIN AUTHORITY

## Objective
Promote generated real-world terrain from visualization data to an authoritative gameplay input.

## Branch
`phase16b4-real-terrain-authority`

## Authority model

```
Existing movement request
        ↓
CheegunTerrainAuthority.resolveMove()
        ↓
Generated geographic terrain?
   ┌────┴─────┐
   NO         YES
   ↓           ↓
Prototype   Water blocked
rules       Forest cost ×1.8
            Visibility modified
```

## Runtime API

```js
CheegunTerrainAuthority.enable()
CheegunTerrainAuthority.disable()

CheegunTerrainAuthority.resolveMove(latlng, baseCost)
CheegunTerrainAuthority.canEnter(latlng)
CheegunTerrainAuthority.movement(latlng, baseCost)
CheegunTerrainAuthority.visibility(latlng, base)
CheegunTerrainAuthority.classify(latlng)
```

## Safety
Terrain authority is **not automatically enabled**. Existing prototype terrain remains active until explicit runtime verification:

```js
CheegunTerrainAuthority.enable()
```

Rollback:

```js
CheegunTerrainAuthority.disable()
```

## Generated rules
- Water: movement denied
- Forest: increased movement cost
- Forest: reduced visibility
- Other generated terrain: normal unless a modifier exists
- No generated terrain match: prototype fallback

## Integration target
The next integration pass should replace direct terrain checks inside the movement/vision loop with `resolveMove()` and `visibility()`.

This phase deliberately creates the authoritative adapter first so movement code can be migrated safely in a focused follow-up.

## Verification
1. Generated world loads.
2. Bridge reaches READY.
3. Enable terrain authority manually.
4. Query known water coordinate → movement denied.
5. Query forest coordinate → cost multiplier applied.
6. Query ordinary coordinate → normal cost.
7. Disable → prototype behavior immediately returns.
