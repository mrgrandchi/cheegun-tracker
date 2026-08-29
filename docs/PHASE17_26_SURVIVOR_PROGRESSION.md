# PHASE 17.26 — SURVIVOR SPECIALIZATION, TRAINING & PROMOTION

## Progression
Active survivors now have persistent XP, levels, training history and unlocked specialist abilities.

## Four mastery ranks
Each settlement role has four ranks. XP comes from autonomous mission outcomes and paid Safehouse training.

## Training
- Field Conditioning
- Tactical Drills
- Specialist Training

Training costs credits and awards survivor XP.

## Promotion
Survivors advance from level 1 to level 4. Promotion unlocks the role's signature ability and title progression.

## API
`CheegunSurvivorProgression.profile(id)`
`CheegunSurvivorProgression.award(id,xp)`
`CheegunSurvivorProgression.train(id,type)`
`CheegunSurvivorProgression.missionOutcome(mission,success)`
`CheegunSurvivorProgression.modifier(ids)`