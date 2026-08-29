# PHASE 17.25 — SURVIVOR RECRUITMENT & DYNAMIC POPULATION

## Recruitment lifecycle
Survivor candidates can emerge from city encounters, expedition intelligence and Safehouse radio scans.

## Candidate data
- Name
- Specialist role
- Background
- Trust
- Risk
- Optional family-group flag
- Time-limited availability

## Decisions
Players can welcome candidates into the Safehouse or turn them away. Expired candidates leave the city.

## Population
Recruitment respects existing Safehouse capacity and integrates with the Phase 17.12 settlement roster. New survivors then enter the trait, community, story, mission and legacy systems.

## API
`CheegunRecruitment.generate(options)`
`CheegunRecruitment.accept(id)`
`CheegunRecruitment.reject(id)`
`CheegunRecruitment.tick()`
`CheegunRecruitment.summary()`