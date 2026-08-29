# PHASE 17.17 — DISTRICT SAFEHOUSES & FORWARD OPERATING BASES

## Core loop
Liberate a district → establish a specialized forward base → invest credits → upgrade the foothold.

## Base types
- Medical Post — forward treatment support
- Supply Cache — forward storage/resupply value
- Watch Post — early warning/intelligence
- Field Workshop — frontline repair support
- Radio Relay — contract intelligence

## Rules
Only liberated districts can host a Forward Operating Base. Each district currently supports one specialized base. Some base types require the corresponding survivor role to be available.

## Progression
Forward bases upgrade from Level 1 to Level 3.

## API
`CheegunForwardBases.establish(districtId,type)`
`CheegunForwardBases.assign(districtId,survivorId)`
`CheegunForwardBases.upgrade(districtId)`
`CheegunForwardBases.bonuses(districtId)`
`CheegunForwardBases.summary()`