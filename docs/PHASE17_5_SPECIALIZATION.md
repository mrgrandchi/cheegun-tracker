# PHASE 17.5 — XP, LEVELS & CHARACTER SPECIALIZATION

## Skill point model
Craig earns 1 specialization point per level after Level 1. Nodes require both character level and available skill points.

## Trees
- Scavenger: loot, inventory and sale value
- Fighter: stamina and damage resilience
- Survivalist: noise, endurance and resource conservation
- Leader: trader discounts, stash and future survivor leadership

## Integration
Specialization modifiers are merged into Phase 17.1 expedition modifiers at expedition initialization.

## Current runtime effects
- inventory capacity
- loot generation
- starting stamina
- noise multiplier
- damage reduction
- stash capacity

## Future hooks
- sell value
- trader discount
- reputation gain
- leadership / survivor bonuses

## API
`CheegunSpecialization.summary()`
`CheegunSpecialization.unlock(id)`
`CheegunSpecialization.modifiers()`