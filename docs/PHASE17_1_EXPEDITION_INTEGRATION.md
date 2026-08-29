# PHASE 17.1 — EXPEDITION INTEGRATION

Phase 17 purchases and perks now produce expedition runtime modifiers.

## Applied effects
- Reinforced Backpack: +4 inventory capacity modifier
- Survival Rig: 18% damage reduction
- Scavenger Kit: +1 generated loot roll
- Field Training: +10 starting stamina
- Quiet Step: 28% noise multiplier reduction exposed to runtime
- Pack Rat: +2 stash capacity modifier
- Hard To Kill: additional 12% damage reduction
- Field Medkit: consumable +45 health
- Ration Pack: consumable +35 hunger
- Water Pack: consumable +40 thirst
- Ammo Cache: consumable runtime payload

## Runtime
```js
window.cheegunExpeditionMods
CheegunUseSupply("field-medkit")
CheegunApplyDamage(30,"INFECTED")
CheegunExpeditionEffects.modifiers()
```

## Architecture
Persistent safehouse data is translated into a read-only expedition modifier snapshot at run initialization. Consumables are removed from persistent supplies only when used.
