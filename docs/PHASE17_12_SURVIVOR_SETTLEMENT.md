# PHASE 17.12 — SURVIVOR RECRUITMENT & SAFEHOUSE POPULATION

## Recruitment
Survivor Extraction contracts can now recruit survivors directly into the Safehouse population.

## Roles
- Medic — reduces treatment costs
- Scavenger — provides expedition loot support framework
- Guard — settlement defense strength
- Trader — additional market discount
- Engineer — repair efficiency framework

## Population
The settlement tracks active population, rescued survivors, role assignments and settlement capacity.

## Integration
- Rescue contract completion recruits a survivor
- Recruitment increases Survivor faction reputation
- Assigned Medics reduce injury treatment costs
- Assigned Traders improve market discounts

## API
`CheegunSettlement.recruit()`
`CheegunSettlement.assign(id, role)`
`CheegunSettlement.bonuses()`
`CheegunSettlement.summary()`