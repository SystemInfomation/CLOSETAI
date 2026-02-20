# ClosetAI – Your Wardrobe, Now Sentient

> Daily color-perfect athletic fits engineered for your exact drip. Powered by AI + perceptual color science.

---

## Features

- **Inventory System** — Full wardrobe management with color swatches, tags, search, and filtering
- **StyleForge Planner** — AI-powered daily & weekly outfit generation with color harmony optimization
- **Color Harmony Engine** — Complementary, analogous, triadic, and monochrome scoring
- **Drip Analytics** — Wardrobe health score, color distribution charts, outfit history, and achievement badges
- **Gamification** — Streak counter, drip scores, confetti celebrations, and unlockable badges
- **Neon Void Grid Design** — Dark cyber-athletic aesthetic with animated hex grid, glow effects, and 60fps Framer Motion animations
- **PWA Ready** — Installable progressive web app with offline-first architecture
- **Clean Start** — Begin with an empty wardrobe and add your own items

## Tech Stack

### Frontend
- **Next.js 16** (App Router, React 19, Turbopack)
- **Tailwind CSS v4** + custom Neon Void Grid design system
- **Framer Motion 12** for animations
- **Zustand** with persist middleware for state management
- **Recharts** for analytics charts
- **Lucide React** icons
- **Sonner** toast notifications
- **canvas-confetti** for celebrations

### Backend
- **Node.js 22** + **Fastify**
- **MongoDB** + **Mongoose 8** with strict schemas
- **Zod** for validation
- **JWT** + **bcrypt** for auth

## Quick Start

### Prerequisites
- Node.js 22+
- npm 11+
- MongoDB (local or Atlas M0 free cluster) — _optional, only needed for backend persistence_

### 1. Clone & Install

```bash
git clone https://github.com/SystemInfomation/CLOSETAI.git
cd CLOSETAI

# Frontend
cd frontend
npm install

# Backend (optional)
cd ../backend
npm install
```

### 2. Configure Environment

#### Backend (required if running the API)

Copy the example file and fill in your values:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# MongoDB connection string
# Local:  mongodb://localhost:27017/closetai
# Atlas:  mongodb+srv://<user>:<password>@cluster.mongodb.net/closetai
MONGODB_URI=mongodb://localhost:27017/closetai

# Port for the Fastify API server
PORT=4000

# Secret key for signing JWT tokens — change this to a long random string in production
JWT_SECRET=change-this-to-a-long-random-secret

# Default user ID for data operations
DEFAULT_USER=yourname
```

#### Frontend (optional — only needed to connect to the backend API)

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
# URL of the backend API server
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> **Note:** The frontend works standalone without a backend — it uses Zustand + localStorage for all state. The backend is only needed if you want MongoDB persistence.

### 3. Seed Database (Optional)

If you want to pre-populate the backend database with sample clothing items:

```bash
cd backend
npx tsx src/seed.ts
```

This seeds the database for the user configured in `DEFAULT_USER`.

### 4. Run Development Servers

```bash
# Terminal 1 - Frontend (localhost:3000)
cd frontend
npm run dev

# Terminal 2 - Backend (localhost:4000, optional)
cd backend
npm run dev
```

### 5. Open the App

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
CLOSETAI/
├── frontend/               # Next.js 16 App
│   ├── .env.local.example  # Frontend env template
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing page hero
│       │   ├── layout.tsx         # Root layout + nav
│       │   ├── globals.css        # Neon Void Grid design system
│       │   ├── inventory/page.tsx # Wardrobe inventory
│       │   ├── planner/page.tsx   # StyleForge outfit planner
│       │   └── analytics/page.tsx # Drip analytics dashboard
│       ├── components/
│       │   └── Navigation.tsx     # Global nav bar
│       ├── lib/
│       │   ├── utils.ts           # cn() utility
│       │   └── colorHarmony.ts    # Color harmony engine
│       └── store/
│           └── wardrobeStore.ts   # Zustand store (starts empty)
│
├── backend/                # Fastify API (optional)
│   ├── .env.example        # Backend env template
│   └── src/
│       ├── index.ts               # Server entry
│       ├── db.ts                  # MongoDB connection
│       ├── seed.ts                # Optional seed script
│       ├── models/
│       │   ├── Clothing.ts        # Clothing schema
│       │   └── OutfitHistory.ts   # Outfit history schema
│       ├── routes/
│       │   ├── clothing.ts        # CRUD endpoints
│       │   ├── planner.ts         # Outfit generation
│       │   └── analytics.ts       # Wardrobe analytics
│       └── lib/
│           └── colorHarmony.ts    # Server color engine
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clothing` | List clothing (filters: type, tag, sort) |
| POST | `/api/clothing` | Add clothing item |
| PUT | `/api/clothing/:id` | Update clothing item |
| DELETE | `/api/clothing/:id` | Delete clothing item |
| POST | `/api/clothing/:id/wear` | Log wear event |
| POST | `/api/planner/daily` | Generate daily outfit |
| POST | `/api/planner/week` | Generate weekly outfits |
| POST | `/api/planner/wear` | Log outfit as worn |
| GET | `/api/analytics` | Get wardrobe analytics |
| GET | `/api/health` | Health check |

## Color Harmony Engine

The engine scores outfit combinations (0–100) based on:
- **Hue relationship** — Complementary (88), monochrome (85), triadic (82), analogous (78)
- **Contrast ratio** — Bonus for visual distinction between top and bottom
- **Variety factor** — Less-worn items get scoring boosts to encourage rotation

## License

MIT