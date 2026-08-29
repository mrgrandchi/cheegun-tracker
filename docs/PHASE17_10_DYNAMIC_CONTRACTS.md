# PHASE 17.10 — DYNAMIC CONTRACTS & EXPEDITION OBJECTIVES

## Contract board
The Safehouse generates a rotating board of three contracts. One contract may be active at a time.

## Contract types
- Medical Run
- Signal Recovery
- Salvage Operation
- Supply Recovery
- Threat Clearance

## Runtime flow
Accept contract → deploy → select compatible generated POI → objective marker → secure/search target → rewards.

## Rewards
Contracts award credits, XP and trader reputation. Failed expeditions fail the active contract.

## Persistence
Completed and failed contracts are retained in local progression state.

## API
`CheegunContracts.board()`
`CheegunContracts.accept(id)`
`CheegunContracts.bindTarget(buildings)`
`CheegunContracts.complete()`
`CheegunContracts.fail()`