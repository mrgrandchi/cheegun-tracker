# PHASE 16B.8 — GENERATED LOOT & THREAT INTEGRATION

## Branch
`feature/real-world-world-generation`

## Objective
Connect generated real-world POIs to the existing survival inventory and infected threat loops.

## Loot flow

```
REAL BUILDING
  ↓
POI TYPE
  ↓
LOOT CATEGORY
  ↓
ITEM ROLL
  ↓
EXISTING INVENTORY
```

Generated categories map into existing item names so Phase 3 combat, consumption, and crafting can immediately recognize relevant finds.

## Threat flow

```
PLAYER NEAR REAL POI
        ↓
POI THREAT RATING
        ↓
GENERATED SPAWN CANDIDATES
        ↓
INFECTED SPAWN
        ↓
EXISTING ZOMBIE AI
```

Higher-risk generated POIs can activate nearby candidate spawns. Spawn candidates are consumed after use to prevent repeated activation.

## Runtime controls

```js
CheegunPoiAuthority.enable()
CheegunGeneratedLootThreat.enable()
```

Disable:

```js
CheegunGeneratedLootThreat.disable()
CheegunPoiAuthority.disable()
```

## Safety
Feature remains opt-in. Hand-authored POI loot and existing zombie population remain fallback behavior.

## Next
16B.9 should integrate generated extraction candidates into the extraction objective/game loop, completing the core real-world expedition cycle:

spawn → explore → discover → loot → survive → extract.
