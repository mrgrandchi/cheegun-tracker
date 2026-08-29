# PHASE 17.16 — DISTRICT CONTROL, INFESTATION & LIBERATION

## Thunder Bay districts
- Downtown
- Waterfront
- North Industrial
- Riverside
- Medical District

## Persistent state
Every district tracks infestation, player control, completed operations and liberation status.

## Operations
Searching POIs and completing contract objectives build district control while reducing infestation. Expedition advancement causes unsecured districts to accumulate infestation pressure.

## Liberation
A district is liberated when infestation falls to a low threshold and player control passes the liberation threshold. Liberation grants Survivor and Security faction reputation.

## States
Unstable → Contested → Infested / Overrun → Secured.

## API
`CheegunDistrictControl.operation(poi)`
`CheegunDistrictControl.decay()`
`CheegunDistrictControl.districtForPOI(poi)`
`CheegunDistrictControl.summary()`