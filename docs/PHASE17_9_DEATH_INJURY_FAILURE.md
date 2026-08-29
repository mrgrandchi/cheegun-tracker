# PHASE 17.9 — DEATH, INJURY & EXPEDITION FAILURE

## Failure loop
When Craig's health reaches zero, the expedition fails instead of simply resetting.

## Consequences
- randomized injury severity
- partial loot loss
- failed run tracking
- recovery periods
- credit-based medical treatment

## Injury tiers
1. Minor Injury — 15% loot risk
2. Serious Injury — 35% loot risk
3. Critical Condition — 55% loot risk

## Safehouse
The Safehouse displays active injury status, recovery time, failed expedition count and treatment cost.

## API
`CheegunConsequences.fail()`
`CheegunConsequences.status()`
`CheegunConsequences.recover()`