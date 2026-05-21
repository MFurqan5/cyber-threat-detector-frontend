# CyberGuard AI — Frontend

Premium cybersecurity threat detection dashboard built with React + Vite.

## Tech Stack

- **React 18** + **Vite**
- **TailwindCSS** — utility-first styling
- **Framer Motion** — animations and page transitions
- **Recharts** — data visualizations
- **Axios** — API communication
- **Lucide React** — icons

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

App runs on **http://localhost:5173**

### 3. Backend connection

The frontend connects to FastAPI at `http://localhost:8000`.

Make sure your backend is running:
```bash
cd backend
uvicorn main:app --reload
```

> **Note:** If the backend is offline, all pages gracefully fall back to demo data automatically.

## Pages

| Route | Page | API Endpoint |
|-------|------|-------------|
| `/` | Dashboard | `GET /stats` |
| `/url-scanner` | URL Scanner | `POST /scan/url` |
| `/email-scanner` | Email Scanner | `POST /scan/email` |
| `/cache` | Cache Analytics | `GET /cache/status` |
| `/history` | Scan History | `GET /history` |
| `/settings` | Settings | — |

## Project Structure

```
src/
├── components/
│   ├── navbar/       Navbar.jsx
│   ├── sidebar/      Sidebar.jsx
│   └── ui/           UIComponents.jsx, AnimatedBackground.jsx
├── layouts/          AppLayout.jsx
├── pages/            Dashboard, URLScanner, EmailScanner, CacheAnalytics, ScanHistory, Settings
└── services/         api.js (all axios calls)
```

## API Service

All API calls are in `src/services/api.js`:

```js
import { scanUrl, scanEmail, getStats, getHistory, getCacheStatus } from './services/api'
```

## Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy to Vercel, Netlify, or any static host.
