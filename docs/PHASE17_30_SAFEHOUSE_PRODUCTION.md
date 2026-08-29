# PHASE 17.30 — SAFEHOUSE JOBS, PRODUCTION & RESOURCE GENERATION

## Survivor assignments
Active survivors can be assigned to Safehouse work rather than remaining idle.

## Jobs
- Food Production
- Water Collection
- Medical Station
- Workshop
- Guard Duty
- Radio & Intelligence

## Role efficiency
Survivors working in compatible specialist roles produce at 150% efficiency; off-role workers operate at 75%.

## Production cycle
Production runs after community consumption and can also be manually triggered. Outputs feed the existing food, water, medicine, credits, intelligence and defense systems.

## Strategic loop
Population creates consumption pressure, but correctly assigned survivors can generate resources that sustain expansion.

## API
`CheegunSafehouseProduction.assign(survivorId,jobId)`
`CheegunSafehouseProduction.produce()`
`CheegunSafehouseProduction.summary()`