# PHASE 17.3 — INVENTORY, WEIGHT & STASH CAPACITY

## Expedition authority
`CheegunInventoryAuthority` enforces inventory slot capacity at pickup time.

Base capacity: 8 slots.
Reinforced Backpack: +4 slots.

Items have weight and value metadata. The HUD now reports slot usage and carried weight.

## Pickup tension
Loot is accepted item-by-item. When capacity is full, remaining items are rejected and reported as left behind.

## Stash authority
Settlement transfers are capped by stash capacity.

Base stash: 80 slots.
Pack Rat perk: +2 slots.

Overflow is retained in the settlement report instead of silently exceeding capacity.

## API
`CheegunInventoryAuthority.capacity()`
`CheegunInventoryAuthority.weight()`
`CheegunInventoryAuthority.add(item)`
`CheegunInventoryAuthority.drop(index)`
`CheegunInventoryAuthority.stashTransfer(items)`