# PHASE 16B.10 — REAL WORLD EXPEDITION MODE

## Branch
`feature/real-world-world-generation`

## Objective
Combine the Phase 16B generated-world systems behind one transactional mode controller.

## One command

```js
CheegunRealWorldMode.enable()
```

Activates:
- generated terrain movement + vision
- generated POI discovery
- generated loot + threat
- generated extraction

## Start expedition

```js
CheegunRealWorldMode.start(playerPosition)
```

This creates a run ID, records start time, selects an extraction objective, and renders extraction candidates.

## Safety
Enablement is transactional. If any required subsystem fails, already-enabled systems are rolled back.

## API

```js
CheegunRealWorldMode.prerequisites()
CheegunRealWorldMode.enable()
CheegunRealWorldMode.disable()
CheegunRealWorldMode.start(position)
CheegunRealWorldMode.status(position)
CheegunRealWorldMode.reset()
```

## Gameplay loop

```
START REAL WORLD MODE
       ↓
GENERATE / LOAD REGION
       ↓
ASSIGN EXTRACTION
       ↓
EXPLORE REAL TERRAIN
       ↓
DISCOVER REAL POIs
       ↓
SEARCH → LOOT
       ↓
THREAT / INFECTED
       ↓
REACH EXTRACTION
       ↓
COMPLETE EXPEDITION
```

## Next phase
16B.11 should be a dedicated end-to-end verification and balancing pass. It should test the full expedition lifecycle, identify dead systems, validate actual generated data shapes, and fix integration defects before the feature branch is merged.
