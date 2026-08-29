# PHASE 16B.5 — MOVEMENT & VISION INTEGRATION

## Goal
Connect real-world generated terrain to player movement decisions and vision radius while preserving existing movement, animation, fog, and route systems.

## Branch
`phase16b5-movement-vision-integration`

## Runtime flow

```
PLAYER SELECTS TARGET
        ↓
CheegunMovementVision.attemptMove()
        ↓
CheegunTerrainAuthority.resolveMove()
        │
        ├── Water → BLOCK
        ├── Forest → COST MULTIPLIER
        └── Other → NORMAL
        ↓
EXISTING MOVE CALLBACK
```

## Vision flow

```
PLAYER POSITION
        ↓
CheegunMovementVision.visionAt()
        ↓
Generated terrain visibility modifier
        ↓
Existing vision/fog layer radius
```

## API

```js
CheegunMovementVision.enable()
CheegunMovementVision.disable()

CheegunMovementVision.resolveMove(target, baseCost)
CheegunMovementVision.attemptMove(target, existingMoveCallback, baseCost)

CheegunMovementVision.visionAt(position, baseRadius)
CheegunMovementVision.applyVisionLayer(layer, position, baseRadius)
CheegunMovementVision.hudLabel()
```

## Safety
The phase defaults to disabled. Existing prototype behavior remains authoritative until:

```js
CheegunMovementVision.enable()
```

Rollback is immediate:

```js
CheegunMovementVision.disable()
```

## Integration points for runtime pass
After the existing movement target is calculated:

```js
const check = CheegunMovementVision.attemptMove(target, actualMove);
if (check.blocked) return;
```

After player position updates:

```js
const radius = CheegunMovementVision.applyVisionLayer(
  visionCircle,
  playerPosition,
  existingVisionRadius
);
```

## Expected behavior
- Generated water blocks new movement attempts.
- Generated forest increases movement cost.
- Generated forest reduces vision radius.
- Non-generated areas retain normal prototype behavior.
- Disabling the phase immediately restores prototype terrain behavior.

## Next phase
**16B.6 — Runtime Wiring & Verification**

Wire these adapters into the exact existing movement and fog-of-war loops after inspecting their current implementation, then run browser-level verification before any merge/deploy.
