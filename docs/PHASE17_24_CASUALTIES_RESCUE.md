# PHASE 17.24 — SURVIVOR DEATH, RESCUE & PERMANENT CONSEQUENCES

## Casualty flow
Failed autonomous missions can now escalate into a missing survivor or immediate permanent casualty.

## Missing survivors
Missing survivors receive a timed rescue window. Rescue probability is affected by the casualty risk and whether the window has expired.

## Rescue outcomes
- Successful rescue restores the survivor to the community and boosts morale.
- Failed rescue confirms a permanent casualty.
- Expired rescue windows automatically confirm the casualty.

## Permanent consequences
Permanent death uses the Phase 17.22 legacy system, records the survivor on memorial history, and applies community morale loss.

## API
`CheegunCasualtySystem.markMissing(id, details)`
`CheegunCasualtySystem.rescue(id)`
`CheegunCasualtySystem.confirmDeath(id, details)`
`CheegunCasualtySystem.missionFailure(mission)`
`CheegunCasualtySystem.tick()`