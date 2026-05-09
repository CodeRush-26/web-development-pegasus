# Fleet Command MVP

**Fleet Command MVP** is a real-time maritime fleet management system for managing 15 cargo ships transiting through the **Strait of Hormuz** during a geopolitical crisis. The system provides command-center operators, ship captains, and administrators with real-time situational awareness, autonomous pathfinding, AI-powered distress analysis, and role-based command workflows.

## 🎯 Core Scenario

15 commercial cargo ships are in transit through the Persian Gulf, Strait of Hormuz, and Gulf of Oman. The system simulates realistic maritime physics, applies weather penalties, handles geofencing, and enables coordinated crisis response through role-based communication channels.

## ✨ Key Features

### 1. **Real-Time Ship Simulator**

- 1Hz physics engine simulating all 15 ships
- Haversine distance calculations for accurate maritime navigation
- Fuel burn dynamics with weather penalties (1.3x multiplier in adverse conditions)
- 6 ship states: `normal`, `rerouting`, `stopped`, `distressed`, `stranded`, `arrived`, `out_of_fuel`

### 2. **Live WebSocket Broadcast**

- <500ms state delivery to 5+ concurrent clients
- Role-based message filtering (Admin, Captain, User)
- Ship-specific subscriptions for captains

### 3. **Interactive Map Rendering**

- Google Maps integration with smooth interpolation
- Real-time ship position tracking
- Bounding box: Persian Gulf region (22.0°N to 30.5°N, 47.5°E to 60.0°E)

### 4. **Geofencing & Zone Management**

- Admin-drawn restricted zones
- TurfJS-powered breach detection
- Automatic alerts on zone violations

### 5. **Intelligent Pathfinding (A\*)**

- Route optimization around restricted zones
- Weather and fuel feasibility awareness
- Dynamic rerouting on zone changes

### 6. **Role-Based Dashboards**

- **Admin Dashboard**: Fleet overview, zone management, alert monitoring
- **Command Center**: Directive dispatch, ship assignments, escalation handling
- **Captain View**: Personal ship data, incoming directives, status reporting
- **User Dashboard**: Read-only fleet overview

### 7. **Directive & Escalation System**

- Command sends orders to captains
- Accept/Escalate workflow
- Real-time acknowledgment

### 8. **AI Distress Parsing**

- Gemini API integration for natural language processing
- Automatic distress message categorization
- Structured alert generation

### 9. **Weather System**

- Open-Meteo API integration
- Dynamic fuel burn multipliers
- Real-time weather impact on navigation

### 10. **Proximity Warnings**

- 2 km collision detection threshold
- Automatic alert generation
- Real-time notifications

### 11. **Playback & Snapshot System**

- 60-minute rolling history (120 snapshots × 30s intervals)
- Timeline scrubbing for incident review
- Historical state reconstruction

## 🏗️ Architecture

### Frontend Stack

- **React 19 + TypeScript + Vite**
- Routing: React Router v7
- State Management: Zustand
- Styling: Tailwind CSS v4
- Maps: @vis.gl/react-google-maps
- Real-time: Socket.io
- UI Components: Radix UI + Lucide Icons
- Animations: Framer Motion
- Notifications: Sonner

### Backend Stack

- **Node.js + Express + TypeScript**
- Real-time: Socket.io
- Database: MongoDB (Mongoose)
- Authentication: JWT + Google OAuth + OTP
- AI/ML: Google Generative AI (Gemini)
- Geospatial: TurfJS
- Weather: Open-Meteo API
- Payments: Stripe
- Notifications: Web Push API
- File Storage: ImageKit
- Email: Nodemailer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance
- Google Cloud API key (for Gemini)
- Open-Meteo API key (free)
- Stripe account (optional)

### Installation

**1. Clone & Setup**

```bash
git clone <repo>
cd coderush26

# Install dependencies
cd client && npm install
cd ../server && npm install
```

**2. Environment Setup**

Create `.env` files:

**server/.env**

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fleet
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_gemini_key
STRIPE_KEY=your_stripe_key
OPENMETEO_API=https://api.open-meteo.com
NODE_ENV=development
```

**client/.env**

```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
VITE_GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
```

**3. Start Services**

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit `http://localhost:5173` (frontend will connect to backend)

## 🔐 Security

- **Authentication**: JWT tokens (7-day expiry) + Google OAuth + OTP
- **WebSocket Auth**: Token validation per connection
- **RBAC**: Role-based access control on all routes & WebSocket messages
- **Password Security**: bcryptjs hashing
- **CORS**: Configurable origin policy

## 📝 API Endpoints

### Auth

- `POST /api/auth/register` — User signup
- `POST /api/auth/login` — User login
- `POST /api/auth/verify-otp` — OTP verification
- `POST /api/auth/refresh` — Refresh token

### Fleet

- `GET /api/fleet/ships` — List all ships
- `POST /api/fleet/zones` — Create restricted zone
- `DELETE /api/fleet/zones/:id` — Delete zone
- `POST /api/fleet/directives` — Send captain directive
- `PUT /api/fleet/directives/:id` — Captain response

### Users

- `GET /api/users/profile` — Current user profile
- `PUT /api/users/profile` — Update profile

### WebSocket Events

- `fleet_update` — Ship state broadcast (1Hz)
- `directive_sent` → `directive_response` — Command workflow
- `zone_created` / `zone_deleted` — Zone management
- `alert_acknowledged` — Alert dismissal
- `distress_parsed` — AI analysis result

## 🧪 Testing

Run linter:

```bash
cd client && npm run lint
cd server && npm run lint
```
