# PHASE 17.36 — TERRITORY MAP, HORDE MIGRATION & REGIONAL THREAT SIMULATION

## Regional simulation
Thunder Bay strategy districts now maintain persistent threat, infection, territory control and horde concentration values.

## Districts
- Waterfront
- Industrial
- Northside
- Riverside
- Outer Corridor

## Dynamic pressure
District threat responds to infection growth, horde concentration, settlements and supply-route condition.

## Horde migration
Hordes periodically move between districts. Migration into colonized territory can raise Safehouse siege pressure.

## Territory response
Clearing operations can reduce threat and infection while increasing territorial control.

## API
`CheegunRegionalThreat.tick()`
`CheegunRegionalThreat.migrate(state)`
`CheegunRegionalThreat.pacify(id,amount)`
`CheegunRegionalThreat.summary()`