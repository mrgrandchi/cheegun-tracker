# PHASE 17.31 — SAFEHOUSE BUILDINGS, UPGRADES & CONSTRUCTION TIERS

## Construction layer
Credits can now be invested in persistent Safehouse structures with three upgrade tiers.

## Buildings
- Survivor Shelter
- Food Storage
- Water Purification
- Medical Bay
- Repair Workshop
- Radio Tower
- Watchtower
- Power Generator

## Effects
Buildings increase population capacity, supply security, recovery capability, production efficiency, intelligence reach, recruitment reach and defense.

## Scaling
Construction costs rise with each tier. Building effects stack persistently.

## Integration
Production jobs now read building modifiers, making construction choices affect the resource economy.

## API
`CheegunSafehouseBuildings.build(id)`
`CheegunSafehouseBuildings.stats()`
`CheegunSafehouseBuildings.productionMultiplier(jobId)`
`CheegunSafehouseBuildings.summary()`