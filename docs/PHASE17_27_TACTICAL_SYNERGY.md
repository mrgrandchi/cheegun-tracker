# PHASE 17.27 — SURVIVOR ABILITIES & TACTICAL SYNERGY

## Specialist abilities
Phase 17.26 role abilities now produce gameplay modifiers:
- Field Triage: rescue bonus
- Cached Intel: loot/intelligence bonus
- Hold the Line: defense readiness bonus
- Bargain Network: economy bonus
- Field Repair: infrastructure repair bonus

## Team synergies
Role combinations unlock tactical synergies including Rescue Cell, Salvage Crew, Supply Hunters and Hardened Defense.

## Mission integration
Team composition contributes a tactical bonus to autonomous mission success calculations and records synergy activations.

## Rescue integration
Medical rescue capability contributes to rescue probability.

## API
`CheegunSurvivorSynergy.evaluate(ids)`
`CheegunSurvivorSynergy.missionBonus(mission)`
`CheegunSurvivorSynergy.applySafehouse()`
`CheegunSurvivorSynergy.record(context,ids)`