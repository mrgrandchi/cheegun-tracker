# PHASE 17.11 — FACTIONS, REPUTATION & SAFEHOUSE RELATIONSHIPS

## Factions
- Lakehead Medical Relief
- Northern Trade Network
- Thunder Bay Survivors
- Northern Security Cell

## Reputation ranks
Unknown → Known → Trusted → Allied.

## Integration
Contract completion and failure now change the reputation of factions associated with that contract type.

## Benefits
- Medical: treatment discounts and medical stock progression
- Traders: additional market discounts and rare stock progression
- Survivors: intelligence and safehouse support progression
- Security: combat cache and weapon access progression

## API
`CheegunFactions.gain(id, amount)`
`CheegunFactions.applyContract(contract, outcome)`
`CheegunFactions.rank(id)`
`CheegunFactions.modifier(id)`
`CheegunFactions.summary()`