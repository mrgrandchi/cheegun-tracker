# PHASE 17.7 — WEAPON COMBAT & DURABILITY INTEGRATION

## Equipment-driven combat
Combat now reads the equipped weapon from `CheegunGear`.

### Weapon behavior
- weapon-specific damage
- firearm vs melee behavior
- firearm ammo consumption
- weapon-specific noise
- durability wear per attack
- broken weapon rejection

### Armor behavior
Incoming expedition damage now triggers armor durability wear before health mitigation.

### Ammo
Service Pistol consumes one round per attack. Ammo Cache consumables add reserve ammunition through the expedition effects bridge.

## Runtime
`CheegunCombatEquipment.attack()`
`CheegunCombatEquipment.reload()`
`CheegunCombatEquipment.addAmmo(n)`
`CheegunCombatEquipment.applyArmorWear(amount)`

## Integration
Legacy Phase 7 combat contacts now delegate attack execution to the Phase 17.7 equipment runtime when available, while preserving the older system as fallback.