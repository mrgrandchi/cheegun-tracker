# PHASE 16B.7 — GENERATED POI AUTHORITY

## Feature branch
`feature/real-world-world-generation`

## Objective
Adopt generated real-world buildings and amenities as discoverable gameplay points of interest.

## Gameplay flow

```
REAL-WORLD BUILDING / AMENITY
          ↓
GENERATED POI (16B.2)
          ↓
POI AUTHORITY (16B.7)
          ↓
PLAYER EXPLORES NEARBY
          ↓
DISCOVERED
          ↓
SEARCHABLE
          ↓
LOOT CLASSIFICATION
```

## Discovery
The exploration/reveal loop now calls:

```js
CheegunPoiAuthority.update(L.latLng(player), map)
```

Generated POIs inside discovery radius become discovered and can render on the tactical map.

## Search API

```js
CheegunPoiAuthority.enable()
CheegunPoiAuthority.nearest(position)
CheegunPoiAuthority.canSearch(position)
CheegunPoiAuthority.search(position)
```

Searches are one-time per generated POI.

## Loot classification
- medical → medkit, bandage, painkillers
- security → ammo, armor, radio
- supplies → food, water, tools
- industrial → tools, scrap, fuel
- residential → food, clothing, household
- unknown → mixed basic loot

These are currently generated search-result descriptors. Future loot inventory integration should consume the result through the existing inventory service rather than duplicating item ownership.

## Safety
POI authority defaults OFF. Existing hand-authored building interactions remain available.

Enable:

```js
CheegunPoiAuthority.enable()
```

Disable:

```js
CheegunPoiAuthority.disable()
```

## Next
16B.8 should connect generated POI search results directly into the existing inventory/loot and zombie-threat systems after inspecting those authoritative implementations.
