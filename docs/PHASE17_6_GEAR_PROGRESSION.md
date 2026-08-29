# PHASE 17.6 — GEAR & EQUIPMENT PROGRESSION

## Equipment slots
- weapon
- backpack
- armor
- utility

## Progression
Gear has rarity, tier, purchase cost, stats and durability. Owned gear can be equipped by slot and only active equipped gear contributes expedition modifiers.

## Initial tiers
Common → Uncommon → Rare.

## Systems
- armory purchase
- slot-based equipment
- equip / replace
- durability tracking
- repair costs based on missing durability
- expedition modifier bridge

## API
`CheegunGear.summary()`
`CheegunGear.buy(id)`
`CheegunGear.equip(id)`
`CheegunGear.damage(id, amount)`
`CheegunGear.repair(id)`