# 🗺️ WayPoint — GIS Route Planner

A professional, full-stack GIS waypoint planning and route editor platform. Create, edit, export, and import GPS routes with a modern dark-theme map interface.

![WayPoint App](./docs/screenshot.png)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ Interactive Map | Pan, zoom, click to add waypoints |
| 📍 Waypoint CRUD | Add, delete, drag, reorder waypoints |
| 🔗 Auto Route Lines | Polyline drawn between waypoints in real-time |
| 📊 Route Stats | Distance (Haversine), estimated travel time, segment breakdown |
| 📄 JSON Export | Live preview, copy to clipboard, download as file |
| 📥 JSON Import | Upload a route JSON to recreate all markers |
| 🌍 Map Layers | Street, Satellite (Esri), Terrain (OpenTopo), Dark (CARTO) |
| 🔍 Search | Nominatim geocoding with debounced input |
| 📡 My Location | Browser geolocation with map fly-to |
| ↩️ Undo | Step back through waypoint history (20 steps) |
| 💾 Save to DB | Persist routes via Express/MongoDB backend |
| 📱 Responsive | Works on desktop, tablet, mobile |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (optional — falls back to in-memory)

### 1. Clone & Install

```bash
cd e:\map

# Install frontend
cd frontend
npm install

# Install backend
cd ../backend
npm install
```

### 2. Configure environment

```bash
# Backend .env (already created at backend/.env)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/waypointdb
CORS_ORIGIN=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1 — Backend
cd e:\map\backend
node server.js

# Terminal 2 — Frontend
cd e:\map\frontend
npm run dev
```

Open **http://localhost:5173** in your browser. 🎉

---

## 📁 Project Structure

```
e:\map\
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapView.tsx         # Main map container
│   │   │   │   ├── MapController.tsx   # Waypoints + polylines + click
│   │   │   │   ├── MapToolbar.tsx      # Layer switcher + action buttons
│   │   │   │   ├── SearchBar.tsx       # Nominatim geocoding search
│   │   │   │   └── CoordDisplay.tsx    # Live coordinate HUD
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx         # Tab container + header
│   │   │   │   ├── WaypointList.tsx    # Drag-to-reorder waypoint list
│   │   │   │   ├── JsonPanel.tsx       # Live JSON preview + import/export
│   │   │   │   └── RouteStats.tsx      # Distance/time stats
│   │   │   └── UI/
│   │   │       └── ToastContainer.tsx  # Notification toasts
│   │   ├── hooks/
│   │   │   ├── useMap.ts               # Leaflet hooks (click, fly-to, sync)
│   │   │   └── useSavedRoutes.ts       # Backend save/load hook
│   │   ├── store/
│   │   │   └── mapStore.ts             # Zustand global state
│   │   ├── services/
│   │   │   └── routeService.ts         # Axios API client
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   └── utils/
│   │       ├── haversine.ts            # Distance calculations
│   │       └── jsonExport.ts           # JSON build/parse/download
│   ├── vite.config.ts
│   └── index.html
│
├── backend/
│   ├── config/
│   │   └── db.js                       # MongoDB connection
│   ├── models/
│   │   └── Route.js                    # Mongoose schema
│   ├── controllers/
│   │   └── routeController.js          # CRUD + in-memory fallback
│   ├── routes/
│   │   └── routes.js                   # Express router
│   └── server.js                       # Entry point
│
├── example-route.json                  # Sample route to import
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/health` | Server health + DB status |
| GET | `/api/routes` | Get all routes |
| POST | `/api/routes` | Create a route |
| GET | `/api/routes/:id` | Get single route |
| PUT | `/api/routes/:id` | Update route |
| DELETE | `/api/routes/:id` | Delete route |
| DELETE | `/api/routes/all` | Clear all routes |

### Create Route — Request Body

```json
{
  "routeName": "My Route",
  "waypoints": [
    { "id": 1, "latitude": 20.2961, "longitude": 85.8245 },
    { "id": 2, "latitude": 28.6139, "longitude": 77.2090 }
  ],
  "totalDistance": 1287.45
}
```

---

## 🗺️ Map Controls

| Action | How |
|--------|-----|
| Add Waypoint | **Click** on map |
| Move Waypoint | **Drag** marker |
| Delete Waypoint | Click 🗑️ in sidebar list |
| Reorder Waypoints | **Drag rows** in sidebar list |
| Undo | Click ↩ button or toolbar |
| Clear All | Click 🗑️ in toolbar |
| Switch Layer | Toolbar: Street / Satellite / Terrain / Dark |
| Search Location | Top search bar |
| My Location | 🎯 button in toolbar |
| Export JSON | JSON tab → Copy / Download |
| Import JSON | JSON tab → Import JSON Route |

---

## 📄 JSON Format

```json
{
  "routeName": "Sample Route",
  "createdAt": "2026-05-15T00:00:00Z",
  "waypoints": [
    { "id": 1, "latitude": 20.2961, "longitude": 85.8245, "name": "WP 1" },
    { "id": 2, "latitude": 28.6139, "longitude": 77.2090, "name": "WP 2" }
  ],
  "metadata": {
    "totalDistance": 1287.45,
    "estimatedTime": 1287.45,
    "waypointCount": 2,
    "units": "km"
  }
}
```

---

## 🔑 Optional API Keys

Add to `backend/.env`:

```env
# Mapbox (premium satellite layers)
VITE_MAPBOX_API_KEY=pk.eyJ1...

# OpenRouteService (road snapping)
OPENROUTESERVICE_API_KEY=your_key
```

---

## 🚀 Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve dist/ with nginx or any static host
# Run backend with pm2 or similar
npm install -g pm2
cd ../backend && pm2 start server.js --name waypoint-api

# Set production env vars
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Atlas URI
CORS_ORIGIN=https://yourdomain.com
```

---

## 🛠️ Tech Stack

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Leaflet + Zustand + react-icons

**Backend:** Node.js + Express.js + Mongoose + Morgan + Helmet + CORS

**Database:** MongoDB (with in-memory fallback)

**Maps:** OpenStreetMap + Esri Satellite + OpenTopoMap + CARTO Dark

**Geocoding:** Nominatim (OpenStreetMap)

---

> Built with ❤️ — A professional GIS route editor platform
# map
