# PHASE 17.28 — SURVIVOR EQUIPMENT, LOADOUTS & SCARCITY

## Equipment economy
Survivor equipment is now a persistent resource layer purchased with credits and assigned from limited stock.

## Equipment categories
- Medical kits and bandages
- Service rifles and ammunition
- Field tool kits
- Long-range radios
- Protective vests

## Loadouts
Equipment is assigned to individual survivors and contributes mission modifiers.

## Durability
Mission outcomes wear assigned equipment. Failed missions cause heavier wear. Broken equipment is removed from the loadout and recorded as lost.

## Scarcity
The Safehouse tracks equipment stock against active population, creating equipment pressure as the community grows.

## API
`CheegunSurvivorEquipment.buy(id)`
`CheegunSurvivorEquipment.assign(survivorId,itemId)`
`CheegunSurvivorEquipment.loadout(ids)`
`CheegunSurvivorEquipment.missionBonus(ids)`
`CheegunSurvivorEquipment.wear(ids,amount)`