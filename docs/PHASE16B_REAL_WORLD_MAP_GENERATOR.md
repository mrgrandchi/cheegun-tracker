# PHASE 16B — REAL-WORLD MAP GENERATOR

## Goal
Replace the hardcoded geographic layer with a scalable pipeline:

`Real Location → OpenStreetMap → Normalized Features → Tactical World`

## Added systems
- `js/world-generator.js`
  - Queries Overpass/OpenStreetMap
  - Imports roads, buildings, water, forests, residential and industrial land
  - Converts raw OSM geometry into normalized CHEEGUN features
  - Assigns initial gameplay threat and loot classes
  - Caches generated worlds in localStorage
  - Falls back to a second Overpass endpoint
- `js/phase16b-world-renderer.js`
  - Renders normalized features into Leaflet
  - Keeps generated geography isolated in its own layer
  - Can be cleared/rebuilt without touching gameplay state

## Current API

```js
const world = await CheegunWorldGenerator.load({
  id: "thunder-bay",
  name: "THUNDER BAY",
  center: [48.414, -89.245],
  radius: 3500
});

CheegunWorldRenderer.render(world, map);
console.log(CheegunWorldGenerator.summary(world));
```

## Integration target
The existing `outbreak.js` should expose its Leaflet map instance as:

```js
window.cheegunMap = map;
```

Then boot Phase 16B after map initialization:

```js
CheegunWorldRenderer.generateAndRender(window.cheegunMap)
  .catch(err => console.warn("Generated geography unavailable; using prototype layer", err));
```

## Design rule
Existing hand-authored gameplay data remains a fallback until generated geography has passed runtime verification. Phase 16B changes the **geographic substrate**, not combat, loot, extraction, progression, or story systems.

## Next subphases
1. Runtime integration and automatic Leaflet map binding
2. Building footprint simplification / chunking
3. Road graph generation for movement
4. POI classification
5. Spawn/loot/extraction placement from geographic features
6. Multi-region deployment profiles
