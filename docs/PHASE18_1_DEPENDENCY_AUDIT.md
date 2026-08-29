# PHASE 18.1 — STATIC DEPENDENCY & SCRIPT-ORDER AUDIT

## Completed
A dependency manifest now defines the major Phase 17 runtime contracts and checks browser script order.

## Audit rules
Each audited module declares:
- APIs it provides
- APIs it depends on

The audit distinguishes:
- Script-order warnings: dependency appears to load after its consumer
- Live missing dependencies: dependency absent after page boot

## Initial architectural finding
The expedition page currently loads several Phase 17 infrastructure modules before legacy progression and settlement modules that they reference.

This is not automatically fatal because most Phase 17 modules resolve dependencies lazily inside functions using optional chaining. However, it is a fragile architecture and remains a warning until browser boot tests prove all required APIs exist before gameplay actions invoke them.

## New runtime
`js/phase18-1-dependency-audit.js`

API:
- `CheegunPhase181DependencyAudit.audit()`
- `CheegunPhase181DependencyAudit.runtime()`
- `CheegunPhase181DependencyAudit.scripts()`

## Decision
Do not reorder the entire script stack blindly during static audit. Reordering legacy scripts can introduce regressions. Phase 18.2 will perform an actual expedition browser boot test using the diagnostics produced by 18.0 and 18.1.

## Gate
PASS requires:
- No live missing dependency
- No boot-blocking exception
- Expedition map initializes

WARNINGS may remain for lazy dependencies but must be documented before merge.
