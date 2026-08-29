# PHASE 16B.3 — GAMEPLAY ADOPTION BRIDGE

## Goal
Safely connect generated real-world gameplay data to CHEEGUN's existing systems without replacing proven prototype logic in one risky change.

## Branch
`phase16b3-gameplay-adoption`

## Architecture

```
16B World Generator
       ↓
16B.1 Live Geography
       ↓
16B.2 Tactical Data
       ↓
16B.3 Adoption Bridge
       ↓
Existing Gameplay Systems
```

## Feature flags
All generated-system adoption flags default to **false**:

- `generatedRouting`
- `generatedPois`
- `generatedTerrain`
- `generatedSpawns`
- `generatedExtractions`

This is intentional. The game continues using existing systems unless an individual generated subsystem is explicitly enabled.

## Bridge API

```js
CheegunGeneratedGameplayBridge.status()
CheegunGeneratedGameplayBridge.enable("generatedTerrain")
CheegunGeneratedGameplayBridge.disable("generatedTerrain")

CheegunGeneratedGameplayBridge.terrainAt(latlng)
CheegunGeneratedGameplayBridge.nearestPoi(latlng)
CheegunGeneratedGameplayBridge.nearestExtraction(latlng)
CheegunGeneratedGameplayBridge.selectSpawns(12)
CheegunGeneratedGameplayBridge.routeHint(from,to)
CheegunGeneratedGameplayBridge.movementCost(latlng,1)
```

## Adoption sequence

1. Runtime verify generated world.
2. Enable one flag at a time.
3. Compare generated output with existing gameplay behavior.
4. Only then wire that subsystem into its authoritative implementation.
5. Keep rollback as a one-flag operation.

## First recommended adoption
**Generated terrain movement cost**, because it is low-risk and does not require replacing entities or save-state.

## Then
1. searchable POIs
2. generated extraction candidates
3. generated zombie spawn selection
4. generated routing

