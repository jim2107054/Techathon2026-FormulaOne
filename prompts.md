# Techathon Nationals 2026 — Preliminary Round Build Plan
## "Lights, Fans, Discord: The Boss's Big Idea"

Generated per the Build Plan Generator meta-prompt. Round: **Preliminary (24h online sprint, building from a clean repo)**.

---

## Step 1: Problem Analysis

**Core user:** The boss and any office staff who want to know, at a glance or from Discord, whether lights/fans were left on and how much power the office is burning.

**Core pain point:** Nobody notices devices left running after people leave, so the electricity bill climbs unnoticed. There's no single source of truth for device state, and no passive way to be alerted.

**MVP scope (one clear line, not a feature list):** A single backend that holds live state for 18 simulated devices across 3 rooms, exposes it in real time to (a) a Next.js dashboard with a status panel, power meter, and alerts panel, and (b) a Discord bot with `!status`, `!room`, `!usage`, all reading the *same* data — plus an after-hours/continuous-run alert engine that both surfaces on the dashboard and proactively pings Discord. Bonus (build only after MVP is solid): animated top-view office layout, LLM-humanized bot replies.

Everything else (auth beyond basic API protection, historical analytics, multi-office support) is explicitly out of scope for prelim.

---

## Step 2: Tech Stack Recommendation

Rubric-driven reasoning: AI (25) + IoT (20) + Technical Execution (20) = 65/120. The stack below is chosen to make "one real backend, two real-time clients, one simulated device layer, one LLM integration" achievable and demo-safe in 24h — not to maximize framework novelty.

**Monorepo layout** (npm workspaces):
```
Techathon2026-[TeamName]/
  apps/
    backend/    Node.js + TypeScript + Express + Socket.IO + Prisma (SQLite)
    web/        Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
    bot/        discord.js v14 + TypeScript
  packages/
    shared-types/   Shared TS interfaces: Device, Room, Alert, UsageSummary
  docs/
    architecture-diagram.(png|excalidraw)
    circuit-schematic.png (Wokwi export/screenshot)
    README.md
```

- **Backend (single source of truth):** Node.js + Express + TypeScript, **Socket.IO** for push updates to the dashboard, **Prisma + SQLite** for the device/room/alert data model (file-based, zero external infra, upgradeable to Postgres if time allows — this is the "small database" the brief allows, and it demonstrates real schema design over a flat JSON blob). One backend serves REST to both the bot and the dashboard, and WS to the dashboard only — satisfying the "shared backend, one source of truth" architecture requirement literally.
- **Frontend:** **Next.js 14 App Router + TypeScript**, Tailwind CSS + shadcn/ui components, **Framer Motion** for live-update transitions and the alert banner, **Socket.IO client** for no-refresh updates, Recharts for the power meter. Visual language matches your TasteBD reference: Nunito font, primary `#FE9F43` (orange, used for alerts/accents), secondary `#092C4C` (navy, used for headers/nav), rounded `8px` cards with soft colored shadows (`kpi-orange`, `kpi-navy`, `kpi-green`), not default shadcn gray.
- **AI/LLM:** Anthropic Claude API called from a thin `aiService` module inside the backend, used to humanize bot replies and proactive alert messages. Always has a deterministic templated-string fallback if the API call fails or times out — this is the explicit "AI limitation handling" rubric line item.
- **IoT:** No physical hardware. Simulated Device Layer = a backend-internal interval-based engine that mutates device state realistically. Hardware story is told via a **Wokwi** ESP32 + relay-module schematic for one representative room (Work Room 1), with a pin-mapping table — built by your team in the Wokwi web UI, not auto-generated as a project file (schematics built by hand are more defensible to judges than a machine-dumped JSON, and are easier to explain live).
- **Discord bot:** discord.js v14 + TypeScript, its own process, calls the backend's REST API (and optionally listens on the backend's Socket.IO for proactive alerts) — never touches the DB directly, keeping "shared backend" honest.
- **Deployment:** backend + bot → Render (two services, one web + one background worker), web dashboard → Vercel, SQLite on Render's persistent disk. All judge-facing URLs pre-deployed, zero install needed on demo day.

---

## Step 3: Module List (build order)

1. Monorepo Scaffolding & Environment Setup
2. System Architecture & Data Flow Documentation
3. Database Schema & Data Models (Prisma)
4. IoT Simulation Engine — Simulated Device Layer
5. IoT Hardware Schematic — Wokwi Circuit & Pin Mapping (docs)
6. Backend API — Core REST Endpoints
7. Backend API — Real-Time Layer & Alert Engine
8. Backend API — Security, Config & Reliability
9. AI Layer — LLM Response Pipeline & Edge-Case Handling
10. Discord Bot — Core Commands
11. Discord Bot — Proactive Alerts (Bonus)
12. Frontend — Design System & Dashboard Shell
13. Frontend — Live Office Layout Visualization (Bonus)
14. Frontend — Power Meter, Device Panel & Alerts Panel (Real-time)
15. Testing, Documentation & Deployment Prep

---

## Step 4: The Detailed Prompt Library

### MODULE 1 — Monorepo Scaffolding & Environment Setup

#### Prompt 1.1: Initialize the workspace
**Goal:** Create the npm-workspaces monorepo skeleton.
**Rubric target:** Code Quality — modular structure.
**Depends on:** none

**Paste-ready prompt for Claude Code / Codex:**
"""
Create a new npm-workspaces monorepo named `Techathon2026-[TeamName]` (replace with our real team name) with this exact structure: `apps/backend`, `apps/web`, `apps/bot`, `packages/shared-types`, `docs/`. Root `package.json` must declare `"workspaces": ["apps/*", "packages/*"]` and root scripts `dev:backend`, `dev:web`, `dev:bot` that run each app's dev script via `npm run dev -w apps/<name>`. Add a root `.gitignore` covering `node_modules`, `.env`, `dist`, `.next`, `*.db`. Add a root `README.md` with only a one-line placeholder (we'll fill it in Module 15). Do not scaffold any app internals yet — this prompt is scaffolding only. Do not install unrelated packages.
"""

**Definition of done:**
- [ ] `npm install` at root succeeds with no errors
- [ ] Folder structure matches exactly
- [ ] `.gitignore` present and correct

#### Prompt 1.2: Backend app skeleton
**Goal:** Bootstrap the Express + TypeScript backend app.
**Rubric target:** Code Quality.
**Depends on:** 1.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Inside `apps/backend`, initialize a TypeScript Express project. Install `express`, `socket.io`, `cors`, `dotenv`, `zod` as dependencies and `typescript`, `ts-node-dev`, `@types/express`, `@types/node`, `@types/cors` as dev dependencies. Create `apps/backend/src/index.ts` that starts an Express app with a Socket.IO server attached to the same HTTP server, listens on `process.env.PORT || 4000`, and exposes a single `GET /health` route returning `{ status: "ok", uptime: process.uptime() }`. Create `apps/backend/tsconfig.json` targeting ES2020/CommonJS with `strict: true`. Add `apps/backend/.env.example` with `PORT=4000`. Add npm scripts `dev` (ts-node-dev with reload) and `build`/`start`. Do not add any business logic yet — only the server bootstrap.
"""

**Definition of done:**
- [ ] `npm run dev -w apps/backend` starts the server
- [ ] `GET /health` returns 200 JSON
- [ ] No unused dependencies

#### Prompt 1.3: Shared types package + env conventions
**Goal:** Create the shared TS types package all three apps import, and document env var conventions.
**Rubric target:** Code Quality — no hardcoded secrets, consistent naming.
**Depends on:** 1.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `packages/shared-types` as a small TypeScript package (no build step needed, just export raw `.ts`) with `apps/backend`, `apps/web`, and `apps/bot` able to import it via workspace path `@techathon/shared-types`. In `packages/shared-types/src/index.ts` define and export these interfaces (fields only, no logic): `Room` (`id`, `name`, `displayName`), `Device` (`id`, `name`, `type: "fan" | "light"`, `roomId`, `status: "on" | "off"`, `wattage`, `lastChangedAt: string`), `Alert` (`id`, `type: "after_hours" | "continuous_run"`, `roomId`, `message`, `createdAt: string`, `resolved: boolean`), `UsageSummary` (`totalWattsNow`, `perRoomWatts: Record<string,number>`, `estimatedKwhToday`). Wire up each app's `package.json` with `"@techathon/shared-types": "*"` as a workspace dependency. Add a root `docs/ENV_CONVENTIONS.md` stating: every app has its own `.env` (gitignored) with a committed `.env.example`; no secret ever hardcoded in source; all config read via `process.env` at startup, not scattered through the codebase.
"""

**Definition of done:**
- [ ] Backend can `import { Device } from "@techathon/shared-types"` without error
- [ ] `docs/ENV_CONVENTIONS.md` exists
- [ ] Git commit: `chore: scaffold monorepo, backend bootstrap, shared types`

---

### MODULE 2 — System Architecture & Data Flow Documentation

#### Prompt 2.1: Architecture doc (source for the hand-drawn diagram)
**Goal:** Produce the written spec the team will hand-draw into the required system diagram (no Mermaid allowed).
**Rubric target:** Clear, correct system diagram (15%).
**Depends on:** 1.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `docs/architecture.md` describing, in plain prose plus a labeled ASCII box diagram (not Mermaid), the full data flow: `Simulated Device Layer (backend interval engine)` → `Prisma/SQLite` → `Backend REST API` and `Backend Socket.IO` → fan-out to `Next.js Web Dashboard (Socket.IO client)` and `Discord Bot (REST polling + optional WS listener)` → end user. Explicitly label where the Alert Engine sits (reads DB state, writes Alert rows, emits `alert:new` over Socket.IO, and is polled/pushed to Discord). List every component's responsibility in one sentence each. This file is a drafting aid only — a human will redraw it in Excalidraw/draw.io for submission, so keep box labels short and exact so they translate directly.
"""

**Definition of done:**
- [ ] `docs/architecture.md` exists with ASCII diagram + component table
- [ ] Every arrow in the ASCII diagram has a one-line description

#### Prompt 2.2: Data contract doc
**Goal:** Freeze the REST/WS contract before backend implementation begins, so frontend and bot can build against it in parallel.
**Rubric target:** Code Quality — clean architecture.
**Depends on:** 2.1, 1.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `docs/api-contract.md` listing every planned REST endpoint (`GET /api/rooms`, `GET /api/devices`, `GET /api/rooms/:id`, `GET /api/usage`, `GET /api/alerts`) with method, path, query params, and exact JSON response shape using the `packages/shared-types` interfaces. Also document the two Socket.IO events: `device:update` (payload: single updated `Device`) and `alert:new` (payload: single `Alert`). This is documentation only — do not implement any routes yet. This file is what Modules 6, 7, 10, and 12 will be built against, so keep it precise and final.
"""

**Definition of done:**
- [ ] `docs/api-contract.md` lists all 5 REST endpoints + 2 WS events with exact shapes
- [ ] Commit: `docs: architecture and API contract`

---

### MODULE 3 — Database Schema & Data Models

#### Prompt 3.1: Prisma schema
**Goal:** Model Room, Device, Alert in Prisma against SQLite.
**Rubric target:** Technical Execution — scalability, clean data design.
**Depends on:** 1.2

**Paste-ready prompt for Claude Code / Codex:**
"""
In `apps/backend`, install `prisma` and `@prisma/client`, run `npx prisma init --datasource-provider sqlite`. Define `apps/backend/prisma/schema.prisma` with three models: `Room` (`id String @id @default(cuid())`, `name String @unique`, `displayName String`), `Device` (`id String @id @default(cuid())`, `name String`, `type String` — "fan" or "light", `roomId String` with relation to `Room`, `status String @default("off")`, `wattage Int`, `lastChangedAt DateTime @default(now())`), `Alert` (`id String @id @default(cuid())`, `type String`, `roomId String`, `message String`, `createdAt DateTime @default(now())`, `resolved Boolean @default(false)`). Add appropriate `@@index` on `Device.roomId` and `Alert.roomId`. Do not add any other models — no User/Auth model in this prompt, that's out of scope. Run the initial migration named `init`.
"""

**Definition of done:**
- [ ] `npx prisma migrate dev` succeeds and creates `dev.db`
- [ ] `schema.prisma` has exactly the 3 models described
- [ ] Prisma Client generates without error

#### Prompt 3.2: Seed script matching the fixed office layout
**Goal:** Seed exactly 3 rooms × 5 devices (2 fans + 3 lights) = 18 devices, matching the PDF's fixed office setup.
**Rubric target:** Quality of demo & dummy data simulation (15%).
**Depends on:** 3.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/prisma/seed.ts` using Prisma Client. Seed exactly these rooms: `drawing` ("Drawing Room"), `work1` ("Work Room 1"), `work2` ("Work Room 2"). For each room create 2 fans named `Fan 1`, `Fan 2` with `wattage: 60`, and 3 lights named `Light 1`, `Light 2`, `Light 3` with `wattage: 15`. All devices start `status: "off"` with `lastChangedAt: new Date()`. Wire `"prisma": { "seed": "ts-node prisma/seed.ts" }` into `apps/backend/package.json` and add an npm script `db:seed`. After seeding, log a one-line summary: total rooms, total devices, total fans, total lights. Do not seed any Alert rows — alerts are generated at runtime only.
"""

**Definition of done:**
- [ ] `npm run db:seed -w apps/backend` produces exactly 3 rooms, 18 devices (6 fans, 9 lights)
- [ ] Re-running seed is safe (use `upsert` by unique room name / device name+room, don't duplicate)

#### Prompt 3.3: Prisma client singleton
**Goal:** One shared Prisma client instance across the backend.
**Rubric target:** Code Quality.
**Depends on:** 3.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/lib/prisma.ts` exporting a single lazily-instantiated `PrismaClient` singleton (guard against creating multiple instances on hot-reload in dev, using a `globalThis` cache pattern). Every other backend file must import this instead of instantiating `new PrismaClient()` directly. Add a brief comment explaining why the singleton pattern is needed. Commit message: `feat: prisma schema, seed data, client singleton`.
"""

**Definition of done:**
- [ ] Only one file in the codebase calls `new PrismaClient()`
- [ ] Committed with the message above

---

### MODULE 4 — IoT Simulation Engine (Simulated Device Layer)

#### Prompt 4.1: Simulator interface (swap-ready for real hardware later)
**Goal:** Define a `DeviceDataSource` interface so the simulator can later be swapped for a real MQTT feed without touching the rest of the backend.
**Rubric target:** IoT — clean software design, scalability.
**Depends on:** 3.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/iot/DeviceDataSource.ts` defining a TypeScript interface `DeviceDataSource` with one method: `start(onDeviceChange: (deviceId: string, status: "on"|"off") => Promise<void>): void`. Add a one-paragraph comment explaining that this interface exists so a future `MqttDeviceDataSource` (subscribing to real ESP32 telemetry) could be dropped in without changing the alert engine, REST API, or Socket.IO layer — only `SimulatedDeviceDataSource` (next prompt) needs to change. Do not implement the simulator itself in this prompt.
"""

**Definition of done:**
- [ ] Interface file exists, compiles, has no implementation logic

#### Prompt 4.2: Simulated device engine
**Goal:** Implement the actual state-mutation loop with realistic behavior.
**Rubric target:** IoT — realistic simulated data, dynamic over time.
**Depends on:** 4.1, 3.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/iot/SimulatedDeviceDataSource.ts` implementing `DeviceDataSource`. On `start()`, run `setInterval` every 15 seconds (configurable via `SIMULATION_INTERVAL_MS` env var, default 15000). Each tick: pick a random subset (1–3) of the 18 devices from the DB and flip a weighted coin per device — 70% chance to leave state unchanged, 30% chance to toggle `status`. Bias the randomness so devices in `drawing` room are more likely to be left "on" outside 9am–5pm (to make the after-hours alert demoable on cue), by accepting an optional `forceScenario` param later (stub it as a TODO comment, don't implement now — scope discipline). On every toggle, update `lastChangedAt` to `new Date()` and call the `onDeviceChange` callback with the device id and new status. Log each tick's changes to console in one line: `[sim] Fan 1 (work1) -> on`. Do not touch Alert or Socket.IO logic here — this file only mutates device state and reports changes via the callback.
"""

**Definition of done:**
- [ ] Running the backend shows periodic `[sim]` log lines
- [ ] Device rows in SQLite visibly change status over a 2-minute run
- [ ] No direct Socket.IO or Alert code inside this file

#### Prompt 4.3: Wire simulator into app startup + persist via Prisma
**Goal:** Connect the simulator's callback to actual DB writes.
**Rubric target:** IoT — reliability of the simulated layer.
**Depends on:** 4.2, 3.3

**Paste-ready prompt for Claude Code / Codex:**
"""
In `apps/backend/src/index.ts`, on server startup, instantiate `SimulatedDeviceDataSource` and call `.start()` with a callback that: (1) updates the `Device` row in Prisma (`status`, `lastChangedAt`) by id, wrapped in try/catch — on DB error, log `[sim:error]` with the error message and continue running (never crash the process on a single failed write), (2) is currently a no-op beyond the DB write (Socket.IO emit and alert checks are added in Module 7 — do not add them here, scope discipline). Confirm the server still boots cleanly and the `/health` route still works with the simulator running in the background.
"""

**Definition of done:**
- [ ] Server runs for 5+ minutes without crashing, device data visibly changes in DB
- [ ] A forced DB error (temporarily rename the db file) does not crash the process, only logs
- [ ] Commit: `feat: simulated device data layer with pluggable data source interface`

---

### MODULE 5 — IoT Hardware Schematic (Wokwi, docs only)

#### Prompt 5.1: Pin-mapping & wiring documentation
**Goal:** Produce the reasoning document you'll use to hand-build the Wokwi circuit for Work Room 1 (2 fans + 3 lights = 5 devices, representative room).
**Rubric target:** Sensible circuit schematic (15%).
**Depends on:** none (parallel track)

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `docs/hardware-schematic.md`. Do not generate a Wokwi project file or JSON — produce only planning documentation the team will use to build the circuit by hand in the Wokwi web editor. Content required: (1) a pin-mapping table for an ESP32 DevKit controlling Work Room 1's 5 devices, using 2 relay modules (channel-per-fan) and 3 relay-controlled LEDs standing in for lights, e.g. `GPIO16 -> Relay1 IN (Fan 1)`, `GPIO17 -> Relay2 IN (Fan 2)`, `GPIO18/19/21 -> LED1/2/3 (Light 1/2/3)` with each LED through a 220Ω resistor to GND, relays powered from 5V/GND with IN pins on the listed GPIOs; (2) a written explanation of how relay state (open/closed) maps to device on/off status being read back by the ESP32 via a digital-read on each relay's status/NO contact, or alternatively via the same GPIO the ESP32 drives (since ESP32 is the one switching them, echo status can be tracked in firmware state rather than physically read back — explain this tradeoff in 2-3 sentences); (3) an optional current-sensing addition using one ACS712 20A module on the shared line, with its OUT pin to an ESP32 ADC pin (e.g. GPIO34), explaining how a current reading over a threshold indicates "device drawing power" as a cross-check against commanded state; (4) a short paragraph on why only one room is wired physically (time constraints) and how the other two rooms extrapolate identically per the office layout's device summary (6 fans, 9 lights, 18 devices total).
"""

**Definition of done:**
- [ ] `docs/hardware-schematic.md` has the complete pin table, relay reasoning, ACS712 addition, and scaling rationale
- [ ] No Wokwi JSON or export file created by Claude Code — schematic is built manually in the Wokwi UI by a teammate using this doc

#### Prompt 5.2: Build checklist for the Wokwi UI session
**Goal:** A step-by-step checklist a teammate follows inside Wokwi itself.
**Rubric target:** Sensible circuit schematic.
**Depends on:** 5.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Append a "Wokwi Build Checklist" section to `docs/hardware-schematic.md`: an ordered list of manual steps to perform inside wokwi.com's editor — add ESP32 board, add 2x 2-channel relay module (or 5 individual relays), add 3 LEDs + resistors, wire per the pin table from Prompt 5.1, add the ACS712 sensor, write a minimal placeholder Arduino sketch (just `pinMode`/`digitalWrite` toggling, no networking) so the simulation visibly shows relay clicks and LEDs turning on/off, and finally export/screenshot the finished schematic into `docs/circuit-schematic.png` for the repo. Do not write the placeholder sketch's full content here — just the file name it should be saved as (`docs/wokwi-sketch.ino`) and a one-line description of what it should do.
"""

**Definition of done:**
- [ ] Checklist added, followed manually, `docs/circuit-schematic.png` committed
- [ ] Commit: `docs: hardware schematic and wiring rationale`

---

### MODULE 6 — Backend API: Core REST Endpoints

#### Prompt 6.1: Rooms & devices read endpoints
**Goal:** Implement `GET /api/rooms`, `GET /api/rooms/:id`, `GET /api/devices` per the frozen contract.
**Rubric target:** Technical Execution, dashboard rubric line.
**Depends on:** 3.3, 2.2

**Paste-ready prompt for Claude Code / Codex:**
"""
In `apps/backend/src/routes/rooms.ts`, create an Express router with: `GET /api/rooms` returning all rooms each with a nested `devices` array (Prisma `include`); `GET /api/rooms/:id` returning one room (404 with `{ error: "Room not found" }` if the id/name doesn't match any room — accept either the Prisma `id` or the `name` slug like `work1`); `GET /api/devices` returning a flat list of all 18 devices with their `roomId`. Wrap every handler in try/catch, returning `500 { error: "Internal server error" }` on unexpected failure and logging the real error server-side only (never leak stack traces to the client). Mount this router at `/api` in `index.ts`. Use the exact JSON shapes from `docs/api-contract.md`. Example: `GET /api/rooms/work1` → `{ id, name: "work1", displayName: "Work Room 1", devices: [ {...5 devices...} ] }`.
"""

**Definition of done:**
- [ ] All 3 routes return correct shapes verified via curl
- [ ] Invalid room id returns 404 with the exact error shape
- [ ] No stack traces leaked to client on forced error

#### Prompt 6.2: Usage aggregation endpoint
**Goal:** `GET /api/usage` — total + per-room live wattage and estimated daily kWh.
**Rubric target:** IoT/AI data — Live Power Consumption Meter.
**Depends on:** 6.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/routes/usage.ts` with `GET /api/usage`. Compute `totalWattsNow` by summing `wattage` for all devices where `status === "on"`. Compute `perRoomWatts` as a `Record<roomName, number>` using the same rule grouped by room. Compute `estimatedKwhToday`: track a running energy accumulator — create a small in-memory or DB-backed accumulator (`apps/backend/src/services/energyAccumulator.ts`) that, every simulator tick (hook this into the Module 4.3 callback), adds `(deviceWattage/1000) * (intervalSeconds/3600)` for every device currently "on" to a daily running total, resetting at midnight server time. Return `{ totalWattsNow, perRoomWatts, estimatedKwhToday }` matching `UsageSummary` from shared-types. Example: office with Fan1+Light1 on in work1 → `totalWattsNow: 75`.
"""

**Definition of done:**
- [ ] `GET /api/usage` returns live-updating totals matching manual DB summation
- [ ] `estimatedKwhToday` increases monotonically over a multi-minute test run
- [ ] Unit-testable: `energyAccumulator` logic is isolated from the Express route

#### Prompt 6.3: Alerts read endpoint
**Goal:** `GET /api/alerts` for the dashboard's Active Alerts Panel.
**Rubric target:** Dashboard rubric — Active Alerts Panel.
**Depends on:** 6.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/routes/alerts.ts` with `GET /api/alerts` returning unresolved alerts (`resolved: false`) sorted `createdAt` descending, each shaped exactly like the `Alert` interface in shared-types (`id, type, roomId, message, createdAt, resolved`). Support an optional `?includeResolved=true` query param to return all alerts for debugging. This route only reads — alert creation logic belongs in Module 7 and must not be added here (scope discipline).
"""

**Definition of done:**
- [ ] Route returns correctly shaped empty array before any alerts exist
- [ ] `?includeResolved=true` returns resolved alerts too

#### Prompt 6.4: Centralized error-handling middleware & request logging
**Goal:** One place for error formatting instead of repeated try/catch boilerplate leaking inconsistent shapes.
**Rubric target:** Technical Execution — code quality, reliability.
**Depends on:** 6.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/middleware/errorHandler.ts` exporting an Express error-handling middleware `(err, req, res, next)` that logs `err.message` and `err.stack` server-side, and responds with `500 { error: "Internal server error" }` unless the error is a custom `HttpError` class (create this class in `apps/backend/src/lib/HttpError.ts` with `statusCode` and `message`) in which case respond with that status code and message. Also add a lightweight request logger middleware logging `METHOD path -> status (Xms)` for every request. Register both in `index.ts`, error handler registered last, after all routers. Refactor the 404 case in Prompt 6.1 to throw `new HttpError(404, "Room not found")` instead of manually calling `res.status(404)`.
"""

**Definition of done:**
- [ ] All routes now throw `HttpError` instead of manual status-setting for error cases
- [ ] Every request produces one log line
- [ ] Commit: `feat: core REST API — rooms, devices, usage, alerts`

---

### MODULE 7 — Backend Real-Time Layer & Alert Engine

#### Prompt 7.1: Socket.IO device broadcast
**Goal:** Push `device:update` events live whenever the simulator changes a device.
**Rubric target:** Dashboard — "must update in real time without page refresh."
**Depends on:** 4.3, 1.2

**Paste-ready prompt for Claude Code / Codex:**
"""
In `apps/backend/src/realtime/socket.ts`, export a function `initSocket(server)` that creates a Socket.IO server with CORS restricted to the web dashboard's origin (read from `WEB_ORIGIN` env var). Export a module-level `getIO()` accessor so other files (the simulator callback, the alert engine) can emit without prop-drilling the io instance. In the Module 4.3 simulator callback, after the successful DB write, call `getIO().emit("device:update", updatedDeviceObjectMatchingSharedTypes)`. Confirm with a small `apps/backend/src/scripts/socketSmokeTest.ts` (a throwaway dev script, not part of the app) that connecting a raw socket.io-client and logging events shows `device:update` firing on each simulator tick.
"""

**Definition of done:**
- [ ] Connecting any socket.io client to the backend and listening for `device:update` shows live events matching simulator ticks
- [ ] CORS is restricted, not `origin: "*"`

#### Prompt 7.2: Alert engine — after-hours & continuous-run rules
**Goal:** Implement the two required alert conditions from the PDF.
**Rubric target:** Dashboard — Active Alerts Panel; Problem Understanding.
**Depends on:** 7.1, 6.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/services/alertEngine.ts` exporting `runAlertCheck(): Promise<void>`, invoked once per simulator tick (hook into the Module 4.3 loop, after the DB write, not per-device — once per tick over the full device set). Rule 1 (`after_hours`): for any device with `status === "on"` where the server's local time is before 9:00 or after 17:00, create an `Alert` row (`type: "after_hours"`, message like `"Fan 1 in Work Room 1 is still on after hours"`) — but only if an unresolved alert of this type doesn't already exist for that exact device (avoid duplicate spam; dedupe key = deviceId+type). Rule 2 (`continuous_run`): for any room where ALL devices in that room have been continuously "on" for more than 2 hours (compare `lastChangedAt` against now, only valid if `status === "on"`), create one `Alert` row per room (`type: "continuous_run"`, message like `"Work Room 2 has had all devices on for over 2 hours"`), deduped the same way by roomId+type. After creating any new alert, emit it via `getIO().emit("alert:new", alertObject)`. Wire `runAlertCheck()` into the simulator tick callback from 4.3.
"""

**Definition of done:**
- [ ] Manually setting a device's `lastChangedAt` to 3 hours ago and all-room-on triggers a `continuous_run` alert exactly once (no duplicates on next tick)
- [ ] Manually setting server/system time or mocking the after-hours check triggers an `after_hours` alert for an "on" device
- [ ] `alert:new` fires over the socket when (and only when) a new alert is created

#### Prompt 7.3: Alert resolution logic
**Goal:** Auto-resolve alerts when the underlying condition clears, so the panel doesn't show stale warnings forever.
**Rubric target:** IoT — reliability/correctness of alerting.
**Depends on:** 7.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Extend `alertEngine.ts` with a resolution pass that runs in the same `runAlertCheck()` call, before creating new alerts: for every unresolved `after_hours` alert, if its device is now `status === "off"` OR the time is back within 9–17, set `resolved: true`. For every unresolved `continuous_run` alert, if the room no longer has all devices continuously on for 2+ hours, set `resolved: true`. This keeps `GET /api/alerts` (unresolved-only) showing only currently-true problems. Do not delete resolved alerts — keep them in the DB with `resolved: true` for potential future history features (out of scope to build now, but don't destroy the data).
"""

**Definition of done:**
- [ ] Turning an alerted device off causes its alert to disappear from `GET /api/alerts` on the next tick
- [ ] Resolved alerts remain queryable via `?includeResolved=true`
- [ ] Commit: `feat: real-time socket layer and alert engine (after-hours + continuous-run rules)`

---

### MODULE 8 — Backend Security, Config & Reliability

#### Prompt 8.1: Environment-based config module
**Goal:** Centralize all env reads, fail fast on missing required vars.
**Rubric target:** Code Quality — no hardcoded secrets, environment-based config.
**Depends on:** 1.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/config/env.ts` that reads and validates all environment variables using `zod` at startup: `PORT` (number, default 4000), `WEB_ORIGIN` (string, required), `BOT_API_KEY` (string, required), `ANTHROPIC_API_KEY` (string, optional — logged as a warning if missing, since AI has a fallback), `SIMULATION_INTERVAL_MS` (number, default 15000). If a required var is missing, log a clear error listing exactly which var is missing and exit the process with code 1 before the server starts listening. Replace every raw `process.env.X` usage elsewhere in the codebase with an import from this module. Update `.env.example` to list every one of these vars with a placeholder value and a comment.
"""

**Definition of done:**
- [ ] Deleting `WEB_ORIGIN` from `.env` and starting the server produces a clear fatal error, not a silent `undefined`
- [ ] No file outside `config/env.ts` reads `process.env` directly

#### Prompt 8.2: API key auth for bot-to-backend calls
**Goal:** The bot shouldn't be able to hit the backend anonymously; the dashboard remains public/read-only.
**Rubric target:** Technical Execution — security practices.
**Depends on:** 8.1, 6.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/middleware/requireBotApiKey.ts`: an Express middleware checking header `x-api-key` against `env.BOT_API_KEY`, throwing `HttpError(401, "Unauthorized")` on mismatch or missing header. This is currently informational only (all REST reads stay public for the dashboard), but apply it to a new endpoint `POST /api/bot/query-log` (create this simple endpoint that just accepts `{ command: string, userId: string }` and logs it server-side — used later so the bot's usage can be audited). Document in `docs/api-contract.md` that this one endpoint requires the header, all others remain public reads for the hackathon's scope. In `apps/bot`, add the header to all outgoing requests once the bot exists (Module 10) — note this as a dependency comment, don't implement the bot here.
"""

**Definition of done:**
- [ ] `POST /api/bot/query-log` without the header returns 401
- [ ] With the correct key, returns 200 and logs the entry

#### Prompt 8.3: Rate limiting & input validation
**Goal:** Basic abuse protection and input validation on any route accepting params.
**Rubric target:** Security practices; reliability of device communication (per rubric wording, applied to API robustness).
**Depends on:** 8.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Install `express-rate-limit`. Apply a global limiter of 100 requests/minute per IP to all `/api/*` routes in `apps/backend/src/index.ts`, returning `429 { error: "Too many requests, slow down" }` on breach. Add `zod` param validation to `GET /api/rooms/:id` (must be a non-empty string matching `[a-z0-9_-]+`) — invalid params should throw `HttpError(400, "Invalid room id")` before hitting Prisma. Commit message: `feat: backend security — env validation, API key auth, rate limiting, input validation`.
"""

**Definition of done:**
- [ ] 429 returned after exceeding the rate limit in a quick test loop
- [ ] `GET /api/rooms/<script>` returns 400, not a raw Prisma error

---

### MODULE 9 — AI Layer: LLM Response Pipeline & Edge-Case Handling

#### Prompt 9.1: aiService abstraction with fallback
**Goal:** One module all LLM calls go through, with a hard timeout and deterministic fallback — the explicit "AI limitation handling" rubric line.
**Rubric target:** AI Integration (25%) — explicit handling of low confidence/empty input/model failure.
**Depends on:** 8.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Install `@anthropic-ai/sdk` in `apps/backend`. Create `apps/backend/src/ai/aiService.ts` exporting `async function humanizeResponse(rawFacts: string, fallbackText: string): Promise<{ text: string; source: "ai" | "fallback" }>`. Implementation: if `env.ANTHROPIC_API_KEY` is missing, immediately return `{ text: fallbackText, source: "fallback" }` without attempting a network call. Otherwise call `client.messages.create` with model `claude-sonnet-4-6`, `max_tokens: 200`, a system prompt instructing "Rewrite these office device facts as one short, friendly sentence or two, no more than 40 words, no markdown, no emoji spam (max 1 emoji), keep every number exactly as given" and the `rawFacts` as the user message. Wrap the call with a 4-second timeout (Promise.race) — on timeout, API error, or empty response, log the failure and return `{ text: fallbackText, source: "fallback" }`. Never let a failure here throw or crash the caller. Example: `rawFacts = "Drawing Room: 1 fan ON, 2 lights ON. Work Room 1: all off. Work Room 2: 2 fans ON, 3 lights ON."` → AI might return "Drawing Room's got a fan and 2 lights running, Work Room 1 is fully dark, and Work Room 2 is lit up with 2 fans and all 3 lights on." Facts must never be altered by the AI — only phrasing.
"""

**Definition of done:**
- [ ] With no API key set, `humanizeResponse` returns the fallback instantly, no network call attempted
- [ ] With a bad/expired key, still returns fallback within ~4s, doesn't hang or throw
- [ ] Numbers in AI output match the input facts exactly (spot-checked)

#### Prompt 9.2: Edge-case fact builders (empty input handling)
**Goal:** Make sure "no devices on", "no alerts", "unknown room" all produce sensible facts before they ever reach the AI layer.
**Rubric target:** AI — explicit handling of empty input.
**Depends on:** 9.1, 6.1, 6.2, 6.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/ai/factBuilders.ts` with three pure functions: `buildStatusFacts(rooms: RoomWithDevices[]): string`, `buildRoomFacts(room: RoomWithDevices | null): string`, `buildUsageFacts(usage: UsageSummary): string`. Each must handle the empty/edge case explicitly and produce grammatically complete plain-English facts even when nothing is on (e.g., "All 18 devices are currently off. No power is being drawn."), and `buildRoomFacts(null)` must return `"That room doesn't exist. Valid rooms are: Drawing Room, Work Room 1, Work Room 2."` rather than crashing or producing garbage for the AI to "humanize." Write these as pure, independently testable functions with no I/O.
"""

**Definition of done:**
- [ ] All three functions handle their respective empty/edge case without throwing
- [ ] Facts read as complete sentences a human wrote, not string concatenation artifacts

#### Prompt 9.3: Bot-facing service endpoints wiring AI + facts together
**Goal:** Expose the humanized outputs the bot will call.
**Rubric target:** AI Integration — meaningful, not decorative.
**Depends on:** 9.1, 9.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/routes/botQuery.ts`, protected by `requireBotApiKey` (Module 8.2), with three routes: `GET /api/bot/status` → build facts via `buildStatusFacts`, pass through `humanizeResponse`, return `{ text, source }`; `GET /api/bot/room/:id` → same pattern via `buildRoomFacts`; `GET /api/bot/usage` → same via `buildUsageFacts`. Each route must return within 5 seconds even in the worst case (AI timeout + fallback), matching the `aiService` guarantee. Mount at `/api/bot`. This is the exact contract the Discord bot in Module 10 will call.
"""

**Definition of done:**
- [ ] All 3 routes work with and without `ANTHROPIC_API_KEY` set
- [ ] Response never takes longer than ~5s
- [ ] Commit: `feat: AI response pipeline with fallback and edge-case fact building`

---

### MODULE 10 — Discord Bot: Core Commands

#### Prompt 10.1: Bot scaffold & ready event
**Goal:** Bootstrap discord.js, confirm it comes online.
**Rubric target:** Working Discord bot (10%).
**Depends on:** 1.3

**Paste-ready prompt for Claude Code / Codex:**
"""
In `apps/bot`, initialize a TypeScript project. Install `discord.js`, `dotenv`, `axios`, dev-install `typescript`, `ts-node-dev`, `@types/node`. Create `apps/bot/src/index.ts`: instantiate a `Client` with `GatewayIntentBits.Guilds` and `GatewayIntentBits.GuildMessages` and `MessageContent`, log in with `process.env.DISCORD_BOT_TOKEN`, and on `ClientReady` log `Logged in as ${client.user.tag}`. Create `apps/bot/.env.example` with `DISCORD_BOT_TOKEN=`, `BACKEND_URL=http://localhost:4000`, `BOT_API_KEY=`. Create `apps/bot/src/api.ts` exporting an axios instance pre-configured with `baseURL: process.env.BACKEND_URL` and header `x-api-key: process.env.BOT_API_KEY`. Do not implement any commands yet — this prompt is bootstrap only.
"""

**Definition of done:**
- [ ] Bot logs "Logged in as ..." in a real Discord server after inviting it
- [ ] `apps/bot/src/api.ts` compiles and is importable

#### Prompt 10.2: `!status` command
**Goal:** Implement the required status summary command.
**Rubric target:** Discord bot correctness; matches PDF's example output format.
**Depends on:** 10.1, 9.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/bot/src/commands/status.ts` exporting `handleStatus(message: Message): Promise<void>`. On `!status`, call `GET /api/bot/status` via the configured axios instance, and reply with the returned `text` in a single Discord message (no embed needed for MVP — plain readable text is fine). Wrap the axios call in try/catch: on network failure or non-2xx, reply with `"I couldn't reach the office system right now — try again in a moment."` (never let the bot go silent or throw an unhandled error). In `apps/bot/src/index.ts`, listen for `MessageCreate`, ignore bot messages, and route `!status` to this handler. Example: user types `!status`, bot replies with something matching the PDF's sample: "Drawing Room: 1 fan ON, 2 lights ON. Work Room 1: all off. Work Room 2: 2 fans ON, 3 lights ON." (exact wording will vary since it's AI-humanized, but the facts must match).
"""

**Definition of done:**
- [ ] `!status` in a real Discord channel returns a real, current, accurate summary
- [ ] Killing the backend and running `!status` shows the graceful fallback message, not a crash or silence

#### Prompt 10.3: `!room <name>` command
**Goal:** Per-room status lookup.
**Rubric target:** Discord bot correctness.
**Depends on:** 10.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/bot/src/commands/room.ts` exporting `handleRoom(message: Message, args: string[]): Promise<void>`. Parse the room name from `!room <name>` (e.g. `!room work1`, `!room drawing`, accept case-insensitive input and trim whitespace). Call `GET /api/bot/room/:id` with the parsed id. If the room doesn't exist, the backend's fact-builder already returns a helpful "doesn't exist, valid rooms are..." message (from Module 9.2) — just relay it, don't build your own error copy. If no room name was given at all (`!room` alone), reply `"Which room? Try: drawing, work1, or work2."` without calling the backend. Wire into the message router in `index.ts`.
"""

**Definition of done:**
- [ ] `!room work1`, `!room drawing`, `!room work2` all return correct per-room summaries
- [ ] `!room` alone and `!room nonsense` both give helpful guidance, not silence or a stack trace

#### Prompt 10.4: `!usage` command
**Goal:** Power usage lookup matching the PDF's exact example format.
**Rubric target:** Discord bot correctness; matches PDF sample exactly ("Total power right now: 740W...").
**Depends on:** 10.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/bot/src/commands/usage.ts` exporting `handleUsage(message: Message): Promise<void>`, calling `GET /api/bot/usage` and relaying the humanized text. Confirm the underlying `buildUsageFacts` (Module 9.2) always includes both the current total watts and the estimated kWh for today, phrased so the AI (or fallback) naturally produces something structurally like "Total power right now: 740W. Today's estimated usage: 4.2 kWh." — if it doesn't already, adjust `buildUsageFacts`'s raw fact string (not the AI prompt) to make both numbers unambiguous inputs. Wire into `index.ts`. Add a final router-level catch-all: unrecognized `!` commands get a short help reply listing `!status`, `!room <name>`, `!usage`. Commit message: `feat: discord bot core commands — status, room, usage`.
"""

**Definition of done:**
- [ ] `!usage` output includes both current wattage and an estimated daily kWh figure
- [ ] Unknown `!command` shows the help text instead of doing nothing

---

### MODULE 11 — Discord Bot: Proactive Alerts (Bonus)

#### Prompt 11.1: Alert listener → designated channel post
**Goal:** The bot proactively posts when the backend creates a new alert, matching the PDF's bonus example.
**Rubric target:** AI Integration bonus, Problem Understanding (matches boss's ask exactly).
**Depends on:** 10.1, 7.2, 9.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Install `socket.io-client` in `apps/bot`. Create `apps/bot/src/alertListener.ts` exporting `startAlertListener(client: Client)`: connects to `BACKEND_URL` via Socket.IO, listens for `alert:new`, and on receipt, fetches the designated channel via `client.channels.fetch(process.env.ALERT_CHANNEL_ID)`, then sends a friendly message built by passing the alert's raw `message` field through a new backend route `POST /api/bot/humanize-alert` (create this route in `apps/backend/src/routes/botQuery.ts`, protected by the same API key, accepting `{ message: string }` and running it through `humanizeResponse` with the raw message as both fact and fallback). Format the final Discord message with a warning emoji prefix, e.g. matching the PDF's bonus example style: "⚠️ Hey! Work Room 2 still has 2 fans and 3 lights ON and it's 10 PM. Did someone forget to leave?" Add `ALERT_CHANNEL_ID` to `apps/bot/.env.example`. Call `startAlertListener(client)` from `index.ts` after the client is ready.
"""

**Definition of done:**
- [ ] Forcing an alert condition (e.g. manually flipping a device on and waiting past 5pm in a local time override for testing) results in a real proactive message appearing in the designated channel within one alert-engine tick
- [ ] The message reads naturally, not like a raw JSON dump

#### Prompt 11.2: Dedupe/cooldown so the bot doesn't spam
**Goal:** One proactive message per alert, not one per Socket.IO reconnect or duplicate emit.
**Rubric target:** IoT/AI — reliability, avoids being annoying in the live demo.
**Depends on:** 11.1

**Paste-ready prompt for Claude Code / Codex:**
"""
In `apps/bot/src/alertListener.ts`, maintain an in-memory `Set<string>` of already-posted alert ids for the current bot process lifetime. Before posting, check and skip if the alert id is already in the set; add it after a successful post. On Socket.IO reconnect, do not re-fetch and re-post historical unresolved alerts — only react to newly emitted `alert:new` events going forward. Commit message: `feat: discord bot proactive alerts with dedupe`.
"""

**Definition of done:**
- [ ] Restarting the bot process does not cause a flood of old alerts being reposted
- [ ] The same alert id never posts twice in one run

---

### MODULE 12 — Frontend: Design System & Dashboard Shell

#### Prompt 12.1: Next.js scaffold + Tailwind theme matching the reference palette
**Goal:** Bootstrap Next.js and port the TasteBD-style design tokens (Nunito, orange/navy palette, card radii, soft shadows).
**Rubric target:** Dashboard visuals and UX quality (10%).
**Depends on:** 1.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Initialize `apps/web` as a Next.js 14 App Router project with TypeScript and Tailwind CSS. Install `socket.io-client`, `framer-motion`, `lucide-react`, `recharts`, and set up shadcn/ui (`npx shadcn-ui@latest init` with defaults, Tailwind CSS variables enabled). In `apps/web/tailwind.config.ts`, extend the theme with: `fontFamily.sans = ['Nunito', ...defaultSansFallbacks]`; a `pos` color palette matching these exact values: `orange: '#FE9F43'`, `navy: '#092C4C'`, `green: '#198754'`, `red: '#DC3545'`, `amber: '#FFC107'`, `bgPage: '#F9FAFB'`, `textPrimary: '#212B36'`, `textMuted: '#7A8086'`, `borderLight: '#E6EAED'`; borderRadius `card: '8px'`; boxShadow `card: 'rgba(231,231,231,0.47) 0px 4px 60px 0px'`, `kpiOrange`, `kpiNavy`, `kpiGreen` as soft colored shadows at ~0.2 alpha matching the orange/navy/green colors above. In `apps/web/src/app/globals.css`, import the Nunito Google Font (weights 400,600,700,800) and set `body` to `bg-[#F9FAFB] text-[#212B36] font-sans`. Do not build any page content yet — this is design-token setup only.
"""

**Definition of done:**
- [ ] `npm run dev -w apps/web` renders a blank Nunito-fonted page with the correct background color
- [ ] Tailwind config compiles with all custom tokens available as utility classes

#### Prompt 12.2: App shell — sidebar + topbar layout
**Goal:** Persistent navigation shell for the dashboard.
**Rubric target:** UX — consistent visual design.
**Depends on:** 12.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/components/layout/Sidebar.tsx` and `TopBar.tsx`, wired into `apps/web/src/app/layout.tsx`. Sidebar: fixed left, navy (`bg-pos-navy`) background, white text, shows a simple logo/title "Office Monitor", and a static nav list (Dashboard — only one real page for MVP, mark others as visually present but non-functional stretch items is NOT needed — keep it to just the one active "Dashboard" link, no fake links). TopBar: white background, bottom border `border-pos-borderLight`, shows the current page title on the left and a live connection-status pill on the right (green dot + "Live" text vs red dot + "Disconnected" — wire this to a placeholder boolean prop for now, real Socket.IO wiring happens in Module 14). Use `lucide-react` icons (e.g. `LayoutDashboard`) for the nav item. Keep both components under 80 lines each, single responsibility, no business logic — layout only.
"""

**Definition of done:**
- [ ] Sidebar + TopBar render correctly at desktop width
- [ ] Connection-status pill visually toggles when its prop value is manually flipped in dev

#### Prompt 12.3: Reusable KPI card component
**Goal:** The building block for the power meter and per-room summaries.
**Rubric target:** UX consistency; reused across the dashboard.
**Depends on:** 12.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/components/ui/KpiCard.tsx`: props `{ label: string; value: string; sublabel?: string; icon: LucideIcon; variant: "orange" | "navy" | "green" }`. Render a white rounded-card (`rounded-card shadow-card`) with the icon in a colored circular badge matching the variant, the `value` large and bold, `label` as a muted caption above it, and `sublabel` (if provided) as small muted text below. Use the corresponding `shadow-kpi{Variant}` token from Module 12.1 on hover only (`hover:shadow-kpiOrange` etc.) for a subtle lift effect via `transition-shadow`. Keep this a pure presentational component with no data fetching.
"""

**Definition of done:**
- [ ] Storybook-less manual check: rendering 3 `KpiCard`s with the 3 variants on a test page shows visually distinct, on-brand cards
- [ ] Commit: `feat: web dashboard shell — design tokens, layout, KPI card component`

#### Prompt 12.4: Socket.IO client hook + REST data hooks
**Goal:** Central hooks the actual dashboard pages will consume.
**Rubric target:** Dashboard real-time requirement.
**Depends on:** 12.1, 2.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/hooks/useSocket.ts`: a hook that opens one Socket.IO connection to `process.env.NEXT_PUBLIC_BACKEND_URL` on mount (singleton pattern so multiple components don't open multiple sockets — use a module-level socket instance created once), exposes `{ connected: boolean, socket: Socket }`, and cleans up listeners (not the connection itself) on unmount. Create `apps/web/src/hooks/useRooms.ts` and `useUsage.ts` and `useAlerts.ts`: each does an initial `fetch` from the corresponding backend REST endpoint on mount into local state, then subscribes via `useSocket` to the relevant event (`device:update` for rooms, recomputing locally; `alert:new` for alerts, prepending to local state) to stay live without polling. Add `apps/web/.env.example` with `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000`. These hooks are the only place components should touch fetch/socket directly — pages consume the hooks, not raw APIs.
"""

**Definition of done:**
- [ ] Toggling a device via a manual DB edit or simulator tick updates hook state without a page refresh, verified via a temporary console.log
- [ ] Only one Socket.IO connection exists regardless of how many hooks/components mount

---

### MODULE 13 — Frontend: Live Office Layout Visualization (Bonus)

#### Prompt 13.1: Static SVG floor plan matching the PDF's top-view layout
**Goal:** Recreate the office floor plan (3 rooms, device positions) as an SVG component.
**Rubric target:** Bonus — visual device state reflection.
**Depends on:** 12.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/components/floorplan/OfficeFloorPlan.tsx`, an SVG-based top-view matching the PDF's layout: 3 side-by-side rooms left-to-right — Drawing Room (with a sofa/table shape), Work Room 1, Work Room 2 (each with 2 desk shapes) — each room containing 2 fan icons and 3 light icons positioned reasonably (fans near room center/ceiling area, lights spread across the room). Build each device as its own child SVG group with a `data-device-id` attribute so Module 13.2 can target it. Use simple flat shapes (rects for walls/desks, circles for lights, a 3-blade path for fans) in the `pos` palette — no external image assets needed. Keep this component purely presentational, accepting a `devices: Device[]` prop but not yet applying any on/off visual state (that's the next prompt).
"""

**Definition of done:**
- [ ] Renders a recognizable 3-room top-view layout with correctly-counted device icons (2 fans + 3 lights per room)
- [ ] Component is a single, exportable, reusable piece under ~200 lines

#### Prompt 13.2: Bind live device state to visual glow/animation
**Goal:** Lights glow when on, fans animate when running — the PDF's explicit bonus ask.
**Rubric target:** Bonus points, explicitly named in the PDF.
**Depends on:** 13.1, 12.4

**Paste-ready prompt for Claude Code / Codex:**
"""
Extend `OfficeFloorPlan.tsx`: for each light icon, when its matching device's `status === "on"`, apply a CSS `filter: drop-shadow(0 0 6px #FFC107)` glow and fill color shift to a warm yellow, animated via Framer Motion (`animate` prop transitioning `opacity`/`filter` over ~300ms) — off state is a dim gray fill, no glow. For each fan icon, when `status === "on"`, apply a continuous CSS rotation animation (Framer Motion `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}`) on the fan blade group only, stopped/reset to a static angle when off. Confirm this reacts live to the `useRooms` hook's socket-driven updates (toggling a device via the simulator visibly animates the corresponding icon within one tick, no refresh).
"""

**Definition of done:**
- [ ] Turning a light on in the DB causes its SVG icon to visibly glow within one simulator tick, no refresh
- [ ] Turning a fan on causes continuous rotation; off stops it cleanly (no jarring snap)
- [ ] Commit: `feat: animated office floor plan reflecting live device state`

#### Prompt 13.3: Floor plan legend & room labels
**Goal:** Make the visualization self-explanatory for judges glancing at it.
**Rubric target:** UX — intuitive core flow.
**Depends on:** 13.2

**Paste-ready prompt for Claude Code / Codex:**
"""
Add room name labels (`Drawing Room`, `Work Room 1`, `Work Room 2`) above each room in the SVG using `pos-textPrimary` colored text, and a small legend component `apps/web/src/components/floorplan/FloorPlanLegend.tsx` beneath the plan showing a glowing-light swatch = "Light ON", dim swatch = "Light OFF", a spinning-fan icon = "Fan ON", static = "Fan OFF". Keep the legend compact (single row, small text) so it doesn't dominate the dashboard.
"""

**Definition of done:**
- [ ] Room labels and legend render correctly and don't overlap the SVG content at common desktop widths

---

### MODULE 14 — Frontend: Power Meter, Device Panel & Alerts Panel (Real-Time)

#### Prompt 14.1: Live Device Status Panel
**Goal:** The PDF's required minimum feature — all 18 devices, organized by room, real-time.
**Rubric target:** Working web dashboard with real-time data (20%).
**Depends on:** 12.3, 12.4

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/components/dashboard/DeviceStatusPanel.tsx` consuming `useRooms()`. Render one card per room (`Drawing Room`, `Work Room 1`, `Work Room 2`), each listing its 5 devices as rows: device name (e.g. "Fan 1", "Light 3"), a colored status dot (green pulse animation when on via Framer Motion, gray static when off), and the device's wattage shown only when on. Group rows visually (fans then lights) within each room card. This panel must re-render live from socket-driven state changes with no manual refresh — verify by toggling a device in the DB and watching the dot update within one tick.
"""

**Definition of done:**
- [ ] All 18 devices visible, correctly grouped into 3 rooms of 5
- [ ] Status dot updates live, no refresh
- [ ] Each "on" device row shows its wattage; "off" rows don't

#### Prompt 14.2: Live Power Consumption Meter
**Goal:** Total office wattage + per-room breakdown, updating live.
**Rubric target:** Required feature, explicit PDF line item.
**Depends on:** 12.3, 12.4

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/components/dashboard/PowerMeter.tsx` consuming `useUsage()`. Show one large `KpiCard` (variant `orange`) for `totalWattsNow` (e.g. "740 W") with sublabel showing `estimatedKwhToday` (e.g. "4.2 kWh today"). Below it, render a Recharts horizontal bar chart showing per-room wattage from `perRoomWatts`, using `pos-navy` bars, with room display names as labels and watt values as data labels. The whole component must update live as `useUsage()`'s socket-driven state changes — no polling interval, no refresh needed.
"""

**Definition of done:**
- [ ] Total wattage KPI and per-room bar chart both visible and correctly summed against manually-checked DB state
- [ ] Chart updates live when a device is toggled

#### Prompt 14.3: Active Alerts Panel
**Goal:** Timestamped, visible list of current anomalies.
**Rubric target:** Required feature, explicit PDF line item.
**Depends on:** 12.4

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/web/src/components/dashboard/AlertsPanel.tsx` consuming `useAlerts()`. Render a list of unresolved alerts, each row showing a warning icon (`lucide-react` `AlertTriangle`, colored `pos-red` for `after_hours`, `pos-amber` for `continuous_run`), the alert's `message`, and a relative timestamp ("3 minutes ago" — implement a small `formatRelativeTime(date: Date): string` utility in `apps/web/src/lib/time.ts` rather than adding a date library dependency for just this). New alerts arriving via the `alert:new` socket event should animate in at the top of the list using Framer Motion (`AnimatePresence`, matching the TasteBD `AlertBanner` entrance style: fade + slide down). Show an empty-state message "No active alerts — everything looks good." with a green checkmark icon when the list is empty, styled with `pos-green`.
"""

**Definition of done:**
- [ ] Alerts appear with a visible entrance animation, correct icon per type, and a working relative timestamp
- [ ] Empty state renders correctly when there are zero unresolved alerts

#### Prompt 14.4: Assemble the dashboard page + reconnect handling
**Goal:** Wire everything into `/` as the actual demo-ready page, and handle socket disconnects gracefully.
**Rubric target:** Working dashboard with real-time data; reliability.
**Depends on:** 14.1, 14.2, 14.3, 13.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Assemble `apps/web/src/app/page.tsx` inside the shell from Module 12.2: top row = 3 `KpiCard`s (Total Devices On, Total Wattage, Active Alerts count), middle = `OfficeFloorPlan` (left, larger) beside `AlertsPanel` (right, scrollable if long), bottom = `DeviceStatusPanel` beside `PowerMeter`. Wire the TopBar's connection-status pill (from 12.2) to the real `connected` boolean from `useSocket()`. On disconnect, additionally show a small non-blocking toast/banner ("Reconnecting to live data...") using a simple custom component (no need for a toast library) that auto-dismisses once `connected` becomes true again via Socket.IO's built-in auto-reconnect. Confirm the full page is responsive down to a reasonable tablet width (judges may view on laptops of varying sizes) using Tailwind's `grid`/`flex` responsive classes.
"""

**Definition of done:**
- [ ] Full dashboard renders with all panels populated from real backend data
- [ ] Killing and restarting the backend shows the reconnect banner, then clears automatically once data resumes
- [ ] Commit: `feat: complete real-time dashboard page — status panel, power meter, alerts, floor plan`

---

### MODULE 15 — Testing, Documentation & Deployment Prep

#### Prompt 15.1: Alert engine unit tests
**Goal:** Prove the two required alert rules behave correctly, in isolation.
**Rubric target:** Technical Execution — testing rigor.
**Depends on:** 7.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Install `vitest` in `apps/backend`. Create `apps/backend/src/services/alertEngine.test.ts` with tests using a mocked Prisma client (or an in-memory SQLite test DB, whichever is faster to set up given remaining time — prefer an isolated test SQLite file reset per test if time allows, otherwise mock): (1) a device "on" at 8:30 AM triggers no after-hours alert; (2) a device "on" at 6:00 PM triggers exactly one after-hours alert; (3) running the check twice in a row for the same still-on device does not create a duplicate alert; (4) a room with all 5 devices "on" and `lastChangedAt` 3 hours ago triggers exactly one continuous-run alert for that room; (5) turning one device in that room off causes the room's continuous-run alert to resolve on the next check. Add `"test": "vitest run"` to `apps/backend/package.json`.
"""

**Definition of done:**
- [ ] All 5 test cases pass via `npm run test -w apps/backend`

#### Prompt 15.2: API integration smoke test
**Goal:** One script that exercises the full REST surface against a running backend.
**Rubric target:** Technical Execution.
**Depends on:** 6.4, 9.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `apps/backend/src/scripts/smokeTest.ts`, a standalone script (run with `ts-node`, not part of the app) that, against a running local backend, calls every REST endpoint (`/health`, `/api/rooms`, `/api/rooms/work1`, `/api/rooms/does-not-exist`, `/api/devices`, `/api/usage`, `/api/alerts`, `/api/bot/status` with the API key header) and asserts each returns the expected status code and top-level shape, printing a pass/fail summary line per endpoint and exiting non-zero if anything failed. Add npm script `smoke-test`.
"""

**Definition of done:**
- [ ] `npm run smoke-test -w apps/backend` against a running backend prints all-pass

#### Prompt 15.3: README matching the documentation rubric
**Goal:** The actual submission README — setup, architecture, run instructions.
**Rubric target:** Well structured and documented codebase (15%); Deliverables requirement.
**Depends on:** 2.1, 2.2, 5.1

**Paste-ready prompt for Claude Code / Codex:**
"""
Write the root `README.md` with these exact sections in order: (1) **Problem** — 3-4 sentences restating the office monitoring problem in our own words; (2) **What We Built** — bullet list of the dashboard, bot, alert engine, AI layer, and the bonus floor-plan visualization; (3) **Architecture** — embed `docs/architecture-diagram.png` and a short paragraph summarizing `docs/architecture.md`; (4) **Hardware Concept** — embed `docs/circuit-schematic.png` and link to `docs/hardware-schematic.md`; (5) **Tech Stack** — one line per app (backend/web/bot) naming the key libraries; (6) **Setup & Run (local)** — exact commands: clone, `npm install` at root, copy each app's `.env.example` to `.env` and fill in values, `npm run db:seed -w apps/backend`, then the three `npm run dev:*` root scripts in separate terminals, in that order; (7) **Live Demo Links** — placeholders for the deployed dashboard URL and a note on how judges reach the Discord bot; (8) **AI/Model Attribution** — name the Anthropic model used and note it's used only for response phrasing, never for device logic, satisfying the zero-tolerance attribution rule; (9) **Team** — placeholder for team name/members. Keep language plain, no marketing fluff.
"""

**Definition of done:**
- [ ] README renders correctly on GitHub with both images embedded
- [ ] A teammate unfamiliar with the project could follow section 6 and get it running

#### Prompt 15.4: Fresh-clone QA pass
**Goal:** Prove the project runs with zero manual fixes on a machine that's only ever run the README's steps.
**Rubric target:** Deliverables — "does it run with zero manual fixes."
**Depends on:** 15.3

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `docs/QA_CHECKLIST.md`: a literal step-by-step checklist for one teammate to follow on a clean clone (ideally a different machine or at minimum a fresh directory + fresh `npm install`), following only the README, with a checkbox per step: clone succeeds, root install succeeds, each `.env` copied and filled, seed runs and reports 18 devices, all three apps start without errors, dashboard loads and shows live-updating data within 30 seconds, a manual device toggle (via a temporary debug script or direct DB edit) reflects on both the dashboard and via `!status` in Discord within one simulator tick, and at least one alert can be manually triggered and observed on both the dashboard Alerts Panel and as a proactive Discord message. Do not skip any step even if "it obviously works" — the point is catching what only shows up on a clean environment (missing env var, wrong default port, etc.).
"""

**Definition of done:**
- [ ] Checklist fully checked off on an actual clean clone before submission
- [ ] Any failure found gets fixed and the checklist re-run from the failing step onward

#### Prompt 15.5: Deployment
**Goal:** Judge-facing URLs, no install friction.
**Rubric target:** Deliverables / Final-round readiness (deployment requirement applies to Finals but do it now to de-risk).
**Depends on:** 15.4

**Paste-ready prompt for Claude Code / Codex:**
"""
Create `docs/DEPLOYMENT.md` documenting the deploy steps actually taken (fill in as you go, don't pre-invent): backend deployed to Render as a Web Service (build: `npm install && npm run build -w apps/backend`, start: `npm start -w apps/backend`, env vars set in Render's dashboard matching `.env.example`, SQLite file on Render's persistent disk mount), bot deployed to Render as a Background Worker (same repo, different start command), web dashboard deployed to Vercel with `NEXT_PUBLIC_BACKEND_URL` pointed at the live Render backend URL and `WEB_ORIGIN` on the backend updated to the live Vercel URL for CORS. After deploying, re-run the relevant parts of `docs/QA_CHECKLIST.md` against the live URLs, not just localhost. Update the README's "Live Demo Links" section (15.3) with the real URLs once confirmed working.
"""

**Definition of done:**
- [ ] Live dashboard URL loads and shows real-time data from the live backend
- [ ] Live bot responds correctly in a real Discord server
- [ ] Final commit before submission: `chore: deployment, final QA, README links`

---

## Step 5: Build Order & Time Allocation (24h Preliminary)

Assumes a 3–4 person team splitting into a **Backend/IoT/AI track** and a **Frontend track** that converge for Module 14 onward. Adjust ±1–2h for your team's actual pace.

| Hours | Backend/IoT/AI track | Frontend track |
|---|---|---|
| 0–1 | Module 1 (scaffold, together) | Module 1 (together) |
| 1–2 | Module 2 (architecture/API contract, together) | Module 2 (together) |
| 2–4 | Module 3 (DB schema + seed) | Module 12.1–12.2 (design tokens, shell) |
| 4–7 | Module 4 (simulator engine) | Module 12.3–12.4 (KPI card, hooks — stub against contract) |
| 7–9 | Module 6 (core REST) — Module 5 (hardware docs) in parallel by a 3rd/4th member | Module 13.1 (static floor plan SVG) |
| 9–11 | Module 7 (realtime + alert engine) | Module 13.2–13.3 (animated floor plan) |
| 11–13 | Module 8 (security/config) | Module 14.1 (device status panel, against real API once live) |
| 13–15 | Module 9 (AI layer) | Module 14.2 (power meter) |
| 15–17 | Module 10 (bot core commands) | Module 14.3 (alerts panel) |
| 17–18 | Module 11 (bot proactive alerts) | Module 14.4 (assemble dashboard page) |
| 18–20 | Module 15.1–15.2 (tests) | Cross-team: integration bugfixing against the real, wired system |
| 20–22 | Module 15.5 (deployment — backend/bot) | Module 15.5 (deployment — web) |
| 22–23.5 | Module 15.3–15.4 (README, fresh-clone QA — whole team) |
| 23.5–24 | Buffer: demo video recording, final submission, breathe |

**Hard checkpoint:** by hour 11 you must have live device data flowing end-to-end through the backend (even with a placeholder frontend) — if not, cut Module 13 (bonus floor plan) first, then trim Module 11 (bonus proactive alerts) before touching MVP scope.

---

## Step 6: README & Submission Checklist (summary)

This is covered in full by Prompts 15.3–15.5 above. Quick pre-submission checklist:

- [ ] New public repo created **after** problem release, named `Techathon2026-[TeamName]`
- [ ] Real incremental commit history (one per module minimum, not a single dump commit)
- [ ] README has Problem, What We Built, Architecture (+diagram image), Hardware Concept (+schematic image), Tech Stack, Setup steps, Live URLs, AI/model attribution, Team
- [ ] `docs/architecture-diagram.png` — hand-drawn/Excalidraw, not Mermaid
- [ ] `docs/circuit-schematic.png` — real Wokwi screenshot, one representative room
- [ ] No secrets committed anywhere (`.env` files gitignored, only `.env.example` committed)
- [ ] Demo video ≤3 minutes: dashboard live, bot live, one alert triggered on camera, 30-second architecture explanation
- [ ] Submitted via the official portal before the deadline — late submissions aren't accepted, so submit with buffer, not at the wire