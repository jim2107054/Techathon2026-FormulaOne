# Techathon Nationals 2026 - FormulaOne

## Problem
Office lights and fans are easy to leave running after people leave, and nobody has a single place to check what is still on. That means wasted power, avoidable bills, and no quick way for the boss or staff to spot problems. We built a shared live monitoring system that tracks office devices, shows the current state on a dashboard, and answers the same questions from Discord. It also detects suspicious patterns like after-hours usage and rooms that have been fully powered for too long.

## What We Built
- A shared backend that stores live room, device, usage, and alert state.
- A real-time Next.js dashboard with KPI cards, device status, power usage, alerts, and an animated office floor plan.
- A Discord bot with `!status`, `!room <name>`, and `!usage` commands.
- An alert engine for after-hours usage and continuous full-room power usage.
- An AI response layer with deterministic fallback so device logic never depends on model availability.

## Architecture
![Architecture Diagram](docs/architecture-diagram.svg)

Architecture summary: the simulated device layer runs inside the backend and updates device state in SQLite through Prisma. The same backend serves REST data to the dashboard and Discord bot, emits live Socket.IO events to the dashboard, and runs the alert engine that creates and resolves alerts from current device state. See [docs/architecture.md](docs/architecture.md) and [docs/api-contract.md](docs/api-contract.md) for the written system contract.

## Hardware Concept
![Circuit Schematic](docs/circuit-schematic.svg)

The hardware demo models one representative room with an ESP32, relay-driven fans, LED light stand-ins, and an optional ACS712 current sensor. The same pattern extends to the full office layout of 3 rooms. See [docs/hardware-schematic.md](docs/hardware-schematic.md).

## Tech Stack
- Backend: Node.js, TypeScript, Express, Socket.IO, Prisma, SQLite, Zod, Vitest.
- Web: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Recharts, lucide-react.
- Bot: discord.js, TypeScript, Axios, Socket.IO client.

## Setup & Run (local)
1. Clone the repository.
2. Run `npm install` at the repo root.
3. Copy each app's `.env.example` to `.env` and fill in the values (every variable is documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).
4. Generate the Prisma client: `npx prisma generate -w apps/backend`.
5. Apply the schema: `npm run db:init -w apps/backend`.
6. Seed rooms + devices: `npm run db:seed -w apps/backend`.
7. Start the backend: `npm run dev:backend`.
8. Start the web app: `npm run dev:web`.
9. Start the bot: `npm run dev:bot` (enable the **Message Content Intent** in the Discord Developer Portal first).

## Live Demo Links
- Dashboard URL: `TBD`
- Discord bot access note: invite the deployed bot to the judging server and share the command list there.

## AI/Model Attribution
The AI phrasing layer uses Google's Gemini (`gemini-2.0-flash`). It is used only to rewrite already-computed facts into friendlier wording. Device state, power logic, alert rules, and system decisions are deterministic and still work when the AI layer is unavailable — set `GEMINI_API_KEY` to enable it; without a key the bot serves deterministic fallback text.

## Team
- Team name: `FormulaOne`
- Members: `TBD`
