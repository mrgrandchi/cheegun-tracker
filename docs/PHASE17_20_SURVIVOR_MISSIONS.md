# PHASE 17.20 — SURVIVOR MISSIONS & AUTONOMOUS TEAMS

## Mission types
- Emergency Response
- Supply Run
- District Recon
- Salvage Operation
- Trade Mission

## Teams
Missions require at least two available survivors and the required specialist roles. Active mission members are unavailable until their operation completes.

## Simulation
Each mission has a duration and calculated success chance based on specialist composition. Missions resolve into success or failure and apply persistent consequences.

## Outcomes
Success can resolve emergencies, restore supply routes, improve district control, and generate credits. Failure can worsen infestation or fail an assigned emergency.

## Runtime
Mission completion is checked while playing and when rendering Safehouse operations.

## API
`CheegunSurvivorMissions.start(type, options)`
`CheegunSurvivorMissions.finish(id)`
`CheegunSurvivorMissions.tick()`
`CheegunSurvivorMissions.available()`
`CheegunSurvivorMissions.summary()`