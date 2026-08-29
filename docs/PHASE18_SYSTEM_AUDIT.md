# PHASE 18.0 — FULL SYSTEM RECON & PLAYABILITY AUDIT

## Status
IN PROGRESS — feature development paused while runtime integrity is verified.

## Audit scope
1. Script existence and load order
2. Runtime dependency availability
3. Unhandled JavaScript errors and promise rejections
4. Core expedition boot
5. Safehouse boot
6. Persistence compatibility
7. Phase 17 cross-system dependencies
8. Performance / duplicate tick review

## Initial findings

### Fixed: district normalization defect
Phase 17.36 used an incorrect regular expression when converting settlement district names. This prevented whitespace normalization from behaving as intended. Corrected to `/\s+/g`.

### Risk: dependency timing
The Phase 17 economy modules are loaded before some legacy progression modules on the expedition page. Most dependencies are evaluated lazily through optional chaining, but this must be browser-tested to confirm no startup code assumes an API already exists.

### Risk: duplicated simulation ticking
Regional, settlement, siege and convoy systems were added through multiple phase integrations. Phase 18 must verify that each simulation advances at the intended cadence and is not executed excessively from both render loops and game loops.

### Risk: economy inflation
Settlement production currently credits resources when its tick executes. Cadence verification is required before balancing because an overly frequent tick could inflate credits and supplies.

### Risk: Safehouse render complexity
The Safehouse page uses one large render function that invokes many independent systems. A single missing API can stop later sections from rendering. Phase 18 diagnostics now records missing required APIs and uncaught runtime errors.

## New diagnostic runtime
`js/phase18-runtime-audit.js`

Provides:
- Required API dependency checks
- Missing global reporting
- Window error capture
- Unhandled promise rejection capture
- Persistent latest audit report

API:
`CheegunPhase18Audit.run()`
`CheegunPhase18Audit.latest()`

## Next checkpoints
- 18.1 Static dependency and script-order audit
- 18.2 Expedition browser boot test
- 18.3 Safehouse browser boot test
- 18.4 Persistence and save migration test
- 18.5 Simulation cadence / duplicate tick test
- 18.6 End-to-end player loop acceptance test
- 18.7 Performance and cleanup pass

No merge to main should occur until the critical boot and end-to-end checks pass.
