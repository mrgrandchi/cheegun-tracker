# PHASE 17.35 — SUPPLY ROUTES, CONVOYS & REGIONAL LOGISTICS

## Supply network
Colonized settlements can now be connected to the Field Safehouse through persistent supply routes.

## Route lifecycle
1. Colonize destination
2. Open supply line
3. Dispatch cargo
4. Monitor convoy
5. Repair route damage
6. Improve security

## Risks
Convoys evaluate route condition, destination threat, route security and escort strength. Ambushes can damage or destroy shipments.

## Logistics actions
- Open routes
- Dispatch cargo
- Repair route condition
- Upgrade security
- Track deliveries and losses

## API
`CheegunSupplyConvoys.openRoute(id)`
`CheegunSupplyConvoys.dispatch(routeId,cargo,amount,escort)`
`CheegunSupplyConvoys.repair(id)`
`CheegunSupplyConvoys.secure(id)`
`CheegunSupplyConvoys.tick()`