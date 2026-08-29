# PHASE 17.4 — TRADER & DYNAMIC ECONOMY

## Market
The Safehouse trader now has deterministic daily rotating stock. Each item receives availability, quantity and scarcity values based on the current day seed.

## Pricing
Buy prices respond to scarcity and trader reputation discount.
Sell prices vary around item value and improve with trader reputation.

## Reputation
Each successful individual sale grants trader reputation, up to level 15. Reputation provides up to a 15% purchase discount.

## Features
- daily stock rotation
- limited quantities
- sold-out states
- scarcity-driven pricing
- reputation discounts
- variable sell values
- individual stash sales
- market sale history

## API
`CheegunTraderEconomy.summary()`
`CheegunTraderEconomy.price(id)`
`CheegunTraderEconomy.buy(id)`
`CheegunTraderEconomy.sellItem(raw,index)`
`CheegunTraderEconomy.rotate()`