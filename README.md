# Principles-Based Governance MVP (Web)

This is a runnable MVP implementing the 3 core features:
1) AI Governance Coach
2) Governance Q&A (authority classification)
3) Prompts & Nudges (stubbed scheduler hook)

Includes an **LCMS Congregation** toggle at the org level.

## Quick start
1. `cp .env.example .env` and set values.
2. `npm i`
3. `npx prisma generate`
4. `npx prisma migrate dev --name init`
5. `npm run dev`

## Notes
- This is an MVP starter. Auth is stubbed (single user). Add NextAuth later.
- Nudges: implement cron calling `/api/nudges/run` (see route).


## Scenario history
- Q&A classifications and meeting-ready generations are saved to the DB and shown in the Q&A sidebar.
- After pulling this update, run a new Prisma migration.
