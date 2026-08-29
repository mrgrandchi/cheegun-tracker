# PHASE 17.29 — SURVIVOR NEEDS, FATIGUE, FOOD & RESOURCE CONSUMPTION

## Community consumption
Active survivors consume food and water as the community simulation advances. Injured survivors can consume medical supplies.

## Fatigue
Daily operations and shortages add fatigue. Players can assign survivors to rest, reducing fatigue and mission penalties.

## Resource shortages
Food and water deficits create fatigue and morale penalties. The system tracks shortage history and community supply pressure.

## Mission integration
Average team fatigue and community supply pressure reduce autonomous mission success probability.

## API
`CheegunSurvivorNeeds.buy(id)`
`CheegunSurvivorNeeds.consumeDay()`
`CheegunSurvivorNeeds.rest(id)`
`CheegunSurvivorNeeds.missionPenalty(ids)`
`CheegunSurvivorNeeds.summary()`