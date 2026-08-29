# PHASE 16B.2 — GENERATED GEOGRAPHY → GAMEPLAY

## Branch
`phase16b2-generated-gameplay`

## Objective
Transform Phase 16B's normalized real-world features into tactical data that existing and future gameplay systems can consume.

## Pipeline

```
OpenStreetMap
   ↓
Normalized World Features (16B)
   ↓
Live Leaflet Geography (16B.1)
   ↓
Generated Gameplay (16B.2)
   ├── Road graph
   ├── Searchable POIs
   ├── Terrain modifiers
   ├── Zombie spawn candidates
   └── Extraction candidates
```

## Outputs

### Roads
Creates graph nodes and weighted edges from imported road geometry.

### POIs
Building/amenity features become searchable tactical points with:
- position
- building type
- threat rating
- loot class
- source feature ID

### Terrain
Water, forest, residential, and industrial features expose gameplay modifiers.

### Zombie spawning
Threat-weighted, spatially separated spawn candidates are generated from real POIs.

### Extraction
Road-edge candidates far from the operation center are generated and spatially separated.

## Runtime API

```js
const tactical = CheegunGeneratedGameplay.tacticalize(world);
CheegunGeneratedGameplay.render(tactical, window.cheegunMap);
console.log(CheegunGeneratedGameplay.summary(tactical));
```

The generated result is also published as:

```js
window.cheegunGeneratedGameplay
```

and through:

```
cheegunGeneratedGameplayReady
```

## Safety
16B.2 is additive. It does not overwrite existing zombie arrays, extraction zones, collision logic, or loot tables yet. This avoids breaking the playable vertical slice before generated outputs are runtime-tested.

## Next phase
**16B.3 — Gameplay Adoption**

Gradually connect generated outputs to:
1. movement routing
2. searchable building registration
3. terrain movement cost
4. zombie spawn selection
5. extraction selection
