# Shivamogga Smart Seva Token Management System (GramOne & Seva Sindhu)

A production-ready **Progressive Web Application (PWA)** built for GramOne and Seva Sindhu public service centers across Shivamogga District, Government of Karnataka.

![Government of Karnataka Banner](https://img.shields.io/badge/Government_of_Karnataka-Shivamogga_District-065f46?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Installable_Offline-ea580c?style=for-the-badge)
![Docker Ready](https://img.shields.io/badge/Docker-Single_Command_Deploy-2563eb?style=for-the-badge)

---

## 🌟 Key Features

### 🏛️ Citizen Portal
- **Automatic Geolocation Detection**: Detects user coordinates, displays nearest GramOne and Seva Sindhu offices on an interactive Leaflet map with distance & estimated driving travel time.
- **Multi-Step Token Booking**: Multi-step booking form with dynamic taluk, village, and service selection.
- **Aadhaar & OTP Authentication**: 12-digit Aadhaar validation and mobile OTP verification.
- **Priority Queue Allocation**: Automatic priority slot assignment for Senior Citizens (60+), Persons with Disabilities (PwD), Pregnant Women, and Emergency Cases.
- **Hybrid Token Engine**: Intelligent split ranges for Online vs Walk-in vs Priority & Emergency citizens.
- **AI-Inspired Tatkal Prediction Engine**: Real-time completion probability estimation (Low, Medium, High, Very High) based on queue size, active counters, server status, and processing time.
- **Official Digital Token Pass & PDF Generator**: ReportLab PDF token downloading, print support, base64 QR code generation, and verification code.
- **Live Queue Tracking**: Real-time WebSocket token board displaying currently called token, next token, people ahead, and counter numbers.
- **Karnataka Government Scheme Search**: Search eligible schemes (Gruha Lakshmi, Yuva Nidhi, Raita Vidya Nidhi, Sandhya Suraksha Pension) based on age, gender, income, and occupation.

### 🛡️ Staff / Admin Operator Panel
- **Secure Admin Authentication**: JWT token authentication for staff operators.
- **Live KPI Dashboard**: Today's bookings, revenue collected, completed vs cancelled vs pending tokens, online vs walk-in split, and no-show rate.
- **Counter Queue Control Panel**: Call Next Token, Skip Token, Recall Token, Mark Served/Completed, Cancel Token, Transfer Token to another office, and Pause/Resume Queue.
- **Service Server Status Control**: Toggle individual services between `Active`, `Maintenance`, and `Server Down` to immediately control bookings.
- **Analytics & Reporting**: Interactive Recharts graphs showing peak hour traffic distribution, weekly revenue, and service demand breakdown.
- **CSV Data Export**: One-click export of citizen booking records to CSV.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, Leaflet, Recharts |
| **PWA** | Service Worker (Offline caching), Web Manifest, Native Web Push Notifications |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy, Pydantic v2, WebSockets, Passlib, PyJWT |
| **PDF & QR** | ReportLab, Python-QRCode |
| **Database** | PostgreSQL 15 |
| **Reverse Proxy** | Nginx |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Quick Start with Docker Compose

To start the entire application stack (Database, Backend, Frontend, and Nginx reverse proxy) in a single command:

```bash
docker compose up --build
```

Access the application in your browser:
- **Public Citizen Portal & Admin**: [http://localhost](http://localhost)
- **Backend API Documentation**: [http://localhost/docs](http://localhost/docs) or [http://localhost:8000/docs](http://localhost:8000/docs)

### Demo Admin Credentials
- **Email**: `admin@nimmaseva.in`
- **Password**: `Admin@123`

---

## 🧪 Local Manual Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python app/seed.py
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) for frontend development.

---

## 📁 Repository Architecture

```
d:\Nimmaseva\
├── backend/
│   ├── app/
│   │   ├── api/          # Auth, Bookings, Offices, Queue, Services, Admin, Schemes, Analytics
│   │   ├── core/         # Config, Database engine, JWT Security
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic validation models
│   │   ├── services/     # Token, Slot engine, PDF ReportLab, QR, Tatkal prediction
│   │   ├── websockets/   # WebSocket connection manager
│   │   ├── seed.py       # Auto seed data
│   │   └── main.py       # FastAPI application entrypoint
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/           # Manifest.json, Service worker sw.js
│   ├── src/
│   │   ├── components/   # Header, Footer, KarnatakaBadge, OfficeMap
│   │   ├── pages/        # Home, BookingForm, TokenView, QueueTracker, SchemeSearch, Admin pages
│   │   ├── services/     # Axios API & WebSocket client
│   │   ├── store/        # Zustand global state
│   │   ├── types/        # TypeScript interfaces
│   │   └── index.css     # Tailwind CSS styles
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf        # Reverse proxy config
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔒 Security & Rules
- All user input is strictly validated with Pydantic and Zod schemas.
- Aadhaar authentication enforces 12 numeric digits (demo mode).
- Service and office server status checks prevent bookings when services are marked down or undergoing maintenance.
- Operating hours rule automatically locks same-day booking after 05:00 PM and schedules for the next working day.

---

## 📄 License
Government of Karnataka • Shivamogga District Administration Digitalization Project.
