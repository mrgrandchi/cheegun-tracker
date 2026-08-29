# PHASE 17.8 — LOADOUT PREPARATION

## Deployment authority
The Safehouse now validates Craig's equipped weapon, backpack, armor, utility and selected expedition supplies before deployment.

## Flow
Safehouse → select equipment → select up to 4 supplies → prepare → validate → deploy → Thunder Bay.

## Validation
- weapon required
- broken equipped gear blocks deployment
- maximum four selected supplies
- deployment snapshot written to `cheegunActiveLoadout`

## API
`CheegunLoadoutPreparation.summary()`
`CheegunLoadoutPreparation.toggleSupply(id)`
`CheegunLoadoutPreparation.prepare()`
`CheegunLoadoutPreparation.deploy()`