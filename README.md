# FitTrack

A sleek, self-hosted workout and nutrition tracking app built with Next.js and SQLite. Designed to run on your home server (Umbrel or any Docker host) with zero cloud dependencies — your data stays yours.

![FitTrack Dashboard](https://placehold.co/1200x600/0f0f10/a78bfa?text=FitTrack)

---

## Features

- **Workout Logging** — Log sets, reps, and weight. Warmup sets, drop sets, rest timer, and personal-best detection
- **Routine Builder** — Create reusable workout routines with default sets/reps/rest per exercise
- **Exercise Library** — 76 built-in exercises across Chest, Back, Legs, Shoulders, Arms, Core, and Cardio
- **Nutrition Diary** — Track meals (breakfast, lunch, dinner, snacks) with calorie and macro breakdowns
- **Custom Foods** — Add your own foods with full macro profiles
- **Dashboard** — Daily calorie progress, macro rings, and a 52-week consistency heatmap
- **Progress Charts** — Per-exercise history chart showing max weight over time
- **Export / Import** — Full JSON backup and CSV exports for workouts and nutrition
- **US Measurements** — Weight in lbs, height in ft/in (stored as metric internally)
- **Dark-mode UI** — Mobile-friendly, responsive design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Database | SQLite via [Drizzle ORM](https://orm.drizzle.team/) + `better-sqlite3` |
| UI | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Validation | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| Runtime | Node.js 20, Docker |

---

## Quick Start (Docker Compose)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the repo

```bash
git clone https://github.com/mcwiseman97/fittrack.git
cd fittrack
```

### 2. Start the app

```bash
docker compose up --build -d
```

The first build takes a few minutes. Once done, open your browser to:

```
http://localhost:3080
```

Or replace `localhost` with your server's IP address.

### 3. Stop the app

```bash
docker compose down
```

---

## Deploying on Umbrel

FitTrack is designed to run as an Umbrel home server app.

### Manual install on Umbrel

1. SSH into your Umbrel:
   ```bash
   ssh umbrel@umbrel.local
   ```

2. Clone the repo into your Umbrel app directory:
   ```bash
   cd ~/umbrel/app-data   # or wherever you store custom apps
   git clone https://github.com/mcwiseman97/fittrack.git
   cd fittrack
   ```

3. Start it:
   ```bash
   docker compose up --build -d
   ```

4. Access at `http://<your-umbrel-ip>:3080`

---

## Configuration

All configuration is done via environment variables in `docker-compose.yml`.

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `/data/fittrack.db` | Path to the SQLite database file |
| `PORT` | `3000` | Internal container port (mapped to 3080 on host) |

The SQLite database is stored in a Docker volume at `./data/fittrack/` on your host. It persists across restarts and container rebuilds.

---

## Data & Backups

### Export your data
Go to **Settings → Export / Import** in the app to download:
- **Full JSON backup** — complete database export, can be re-imported
- **Workouts CSV** — all workout sessions
- **Nutrition CSV** — all food log entries

### Manual backup
The database file is at:
```
./data/fittrack/fittrack.db   # relative to docker-compose.yml
```
Copy this file to back up everything.

---

## Development

### Run locally without Docker

**Prerequisites:** Node.js 20+, npm

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
```

Open `http://localhost:3000`.

The database is created automatically at `./fittrack.db` on first run.

### Useful scripts

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run db:studio    # Open Drizzle Studio (database browser)
```

---

## Project Structure

```
fittrack/
├── src/
│   ├── app/                  # Next.js App Router pages & API routes
│   │   ├── api/              # REST API endpoints
│   │   ├── dashboard/        # Dashboard page
│   │   ├── nutrition/        # Nutrition diary pages
│   │   ├── workouts/         # Workout pages (log, routines, history)
│   │   └── settings/         # Settings page
│   ├── components/
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── layout/           # App shell, sidebar, bottom nav
│   │   ├── nutrition/        # Nutrition components
│   │   ├── workouts/         # Workout components
│   │   ├── settings/         # Settings forms
│   │   └── ui/               # shadcn/ui base components
│   ├── db/
│   │   ├── index.ts          # DB connection + inline migrations
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── seed.ts           # Exercise seed data (76 exercises)
│   ├── hooks/                # React hooks (active workout, rest timer)
│   ├── lib/                  # Utilities, constants, validators, export
│   └── types/                # Shared TypeScript types
├── Dockerfile
├── docker-compose.yml
└── umbrel/
    └── app.yml               # Umbrel app manifest
```

---

## License

MIT — do whatever you like with it.

---

*Built with [Claude Code](https://claude.ai/claude-code)*
