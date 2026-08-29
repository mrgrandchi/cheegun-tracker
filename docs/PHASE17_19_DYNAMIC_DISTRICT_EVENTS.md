# PHASE 17.19 — DYNAMIC DISTRICT EVENTS & EMERGENCIES

## Live event types
- Distress Signal
- Horde Migration
- Structure Fire
- Survivors Trapped
- Supply Convoy Lost
- Supply Line Ambush

## Generation
Events are generated dynamically from outbreak pressure during expedition progression. Up to three can remain active.

## Response
The Safehouse Emergency Command board displays district, severity, expiry time and rewards. Players can deploy toward the affected district or resolve the event through the current emergency authority.

## Consequences
Ignored events can increase infestation, damage supply routes, or raise Safehouse threat. Successful responses can improve district control, route integrity, credits and faction reputation.

## API
`CheegunDistrictEvents.tick()`
`CheegunDistrictEvents.generate()`
`CheegunDistrictEvents.resolve(uid,{success})`
`CheegunDistrictEvents.expire()`
`CheegunDistrictEvents.summary()`