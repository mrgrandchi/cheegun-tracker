# PHASE 16B.9 — GENERATED EXTRACTION AUTHORITY

## Branch
`feature/real-world-world-generation`

## Objective
Make geographically generated extraction candidates part of the real expedition objective.

## Flow

```
EXPEDITION START
      ↓
GENERATED EXTRACTION CANDIDATES
      ↓
DISTANT ZONE SELECTED
      ↓
PLAYER EXPLORES / LOOTS / SURVIVES
      ↓
TRAVEL TO REAL-WORLD EXTRACTION
      ↓
EXTRACTION COMPLETE
```

## Authority API

```js
CheegunExtractionAuthority.enable()
CheegunExtractionAuthority.choose(playerPosition)
CheegunExtractionAuthority.status(playerPosition)
CheegunExtractionAuthority.complete(playerPosition)
CheegunExtractionAuthority.render(map)
```

## Safety
Generated extraction remains opt-in. Existing extraction remains the fallback when disabled.

## Completion
The generated extraction system validates:
- active extraction exists
- player is within extraction radius
- extraction has not already completed

The configured minimum expedition duration is currently advisory during verification; a future balancing pass can enforce it.

## Next
16B.10 should run a full-system integration pass and expose a single expedition-mode switch that enables:

- generated terrain
- generated POIs
- generated loot/threat
- generated extraction

That becomes the first testable **Real World Expedition Mode**.
