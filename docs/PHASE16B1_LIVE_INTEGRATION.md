# PHASE 16B.1 — LIVE THUNDER BAY INTEGRATION

## Branch
`phase16b1-live-thunder-bay`

## Purpose
Wire Phase 16B's generated OpenStreetMap geography into the existing playable Leaflet game **without deleting or mutating the proven hand-authored gameplay layer**.

## Safety strategy
The current prototype geography remains the fallback.

```
Generated OSM succeeds → render real-world layer → LIVE
Generated OSM fails    → preserve prototype layer → FALLBACK
```

## New runtime contract

### Map exposure
At the end of Leaflet initialization in `js/outbreak.js`:

```js
window.cheegunMap = map;
document.dispatchEvent(new CustomEvent("cheegunMapReady",{detail:{map}}));
```

### Script order in `game.html`
Load after Leaflet and before/alongside `outbreak.js`:

```html
<script src="js/world-generator.js"></script>
<script src="js/phase16b-world-renderer.js"></script>
<script src="js/phase16b1-live-integration.js"></script>
<script src="js/outbreak.js"></script>
```

## Runtime states
- IDLE
- WAITING
- GENERATING
- LIVE
- FALLBACK

## Verification checklist
1. Open game with network access.
2. Existing prototype still launches.
3. Thunder Bay OSM geometry requests successfully.
4. Generated roads/water/forests/buildings render as a separate Leaflet layer.
5. Disable network or block Overpass.
6. Confirm game remains playable using prototype geometry.
7. Inspect console for zero uncaught exceptions.

## Deliberately deferred
This subphase does NOT yet replace gameplay collision, routing, POIs, loot placement, zombies, or extraction with generated data. That prevents a risky architecture swap before live verification.

Next: 16B.2 converts normalized features into tactical navigation and gameplay zones.
