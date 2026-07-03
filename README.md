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
![Architecture Diagram](docs/architecture-diagram.png)

Architecture summary: the simulated device layer runs inside the backend and updates device state in SQLite through Prisma. The same backend serves REST data to the dashboard and Discord bot, emits live Socket.IO events to the dashboard, and runs the alert engine that creates and resolves alerts from current device state. See [docs/architecture.md](/D:/Techathon2026-FormulaOne/docs/architecture.md:1) and [docs/api-contract.md](/D:/Techathon2026-FormulaOne/docs/api-contract.md:1) for the written system contract.

## Hardware Concept
![Circuit Schematic](docs/circuit-schematic.png)

The hardware demo models one representative room with an ESP32, relay-driven fans, LED light stand-ins, and an optional ACS712 current sensor. The same pattern extends to the full office layout of 3 rooms. See [docs/hardware-schematic.md](/D:/Techathon2026-FormulaOne/docs/hardware-schematic.md:1).

## Tech Stack
- Backend: Node.js, TypeScript, Express, Socket.IO, Prisma, SQLite, Zod, Vitest.
- Web: Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Recharts, lucide-react.
- Bot: discord.js, TypeScript, Axios, Socket.IO client.

## Setup & Run (local)
1. Clone the repository.
2. Run `npm install` at the repo root.
3. Copy each app's `.env.example` to `.env` and fill in the values.
4. Run `npm run db:init -w apps/backend`.
5. Run `npm run db:seed -w apps/backend`.
6. Start the backend with `npm run dev:backend`.
7. Start the web app with `npm run dev:web`.
8. Start the bot with `npm run dev:bot`.

## Live Demo Links
- Dashboard URL: `TBD`
- Discord bot access note: invite the deployed bot to the judging server and share the command list there.

## AI/Model Attribution
The AI phrasing layer is designed for Anthropic's `claude-sonnet-4-6`. It is used only to rewrite already-computed facts into friendlier wording. Device state, power logic, alert rules, and system decisions are deterministic and still work when the AI layer is unavailable.

## Team
- Team name: `FormulaOne`
- Members: `TBD`
