# PHASE 17.32 — SAFEHOUSE POWER GRID, FUEL & INFRASTRUCTURE DEPENDENCIES

## Power layer
Safehouse facilities can now depend on generator power. Power capacity is produced by constructed generator tiers and supplemented by batteries.

## Fuel
Generators consume fuel during Safehouse operation cycles. Fuel can be purchased with credits.

## Infrastructure dependencies
Power-dependent facilities include Water Purification, Medical Bay, Repair Workshop, Radio Tower and Watchtower. Offline facilities stop contributing their associated production bonuses.

## Priority allocation
The grid tracks facility demand and priority. Players can shed or restore power facility-by-facility.

## Blackouts
If powered infrastructure has demand but no generator fuel or generation capacity, the Safehouse enters blackout state and records the event.

## API
`CheegunSafehousePower.buyFuel()`
`CheegunSafehousePower.setAllocation(id,on)`
`CheegunSafehousePower.tick()`
`CheegunSafehousePower.status()`