# PHASE 17.18 — DISTRICT SERVICES, SUPPLY LINES & FAST TRAVEL

## Core loop
Secure district → establish FOB → establish supply line → unlock district services and fast travel.

## Supply lines
Supply lines require a secured district with a Forward Operating Base. They have persistent integrity and can degrade as outbreak pressure advances.

## Fast travel
Active supply lines allow the player to select a district from the Safehouse and deploy directly near its district center.

## District services
Forward base specialization exposes services through the supply network, including resupply, treatment, repair and intelligence hooks.

## API
`CheegunSupplyNetwork.link(districtId)`
`CheegunSupplyNetwork.travel(districtId)`
`CheegunSupplyNetwork.damageRoutes()`
`CheegunSupplyNetwork.resupply(districtId)`
`CheegunSupplyNetwork.services(districtId)`