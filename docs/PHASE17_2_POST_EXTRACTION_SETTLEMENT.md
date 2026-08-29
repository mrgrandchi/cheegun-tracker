# PHASE 17.2 — POST-EXTRACTION SETTLEMENT

## Closed gameplay loop
Extraction → settlement authority → calculate loot value and XP → update persistent profile → move loot to stash → save raid report → settlement summary → Safehouse.

## Authority
`CheegunSettlement.settle(exit)` is now called before the legacy extraction completion fallback.

## Settlement output
- successful extraction count
- extracted loot count
- stash transfer
- credits earned
- XP awarded
- level recalculation
- level-up detection
- persistent raid report

## UX
Raid Report now displays a settlement card with loot secured, XP awarded, resulting level, level-up state, and a direct Safehouse transition.