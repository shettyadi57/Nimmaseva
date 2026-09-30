# Nimma Seva — GramOne & Seva Sindhu Smart Token & Queue Management System
### Shivamogga District Administration • Government of Karnataka (ಕರ್ನಾಟಕ ಸರ್ಕಾರ)

[![Government of Karnataka](https://img.shields.io/badge/Government_of_Karnataka-Shivamogga_District-065f46?style=for-the-badge)](https://karnataka.gov.in)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production_Live-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_Offline-ea580c?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.11-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Single_Command_Deploy-2563eb?style=for-the-badge&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-Government_Open_Public_Use-1e293b?style=for-the-badge)](#-license)

---

## 📑 Table of Contents

1. [Project Overview & Mission](#-project-overview--mission)
2. [High-Level Architecture](#-high-level-architecture)
3. [Exhaustive Feature Directory](#-exhaustive-feature-directory)
   - [Citizen Portal Experience](#1-citizen-portal-experience)
   - [Staff & Admin Operator Console](#2-staff--admin-operator-console)
   - [Hall Display Board & Audio Synthesis](#3-hall-display-board--audio-synthesis)
   - [Public Grievance Redressal (CPGRAMS/IPGRS Model)](#4-public-grievance-redressal-cpgramsipgrs-model)
   - [Karnataka Welfare & Guarantee Schemes Directory](#5-karnataka-welfare--guarantee-schemes-directory)
   - [Document Requirement Explorer](#6-document-requirement-explorer)
4. [Hybrid Token & Prediction Engine](#-hybrid-token--prediction-engine)
5. [Database Schema & Data Models](#-database-schema--data-models)
6. [Complete REST API & WebSocket Documentation](#-complete-rest-api--websocket-documentation)
7. [Security Architecture & Hardening](#-security-architecture--hardening)
8. [Configuration & Environment Variables](#-configuration--environment-variables)
9. [Installation & Deployment Instructions](#-installation--deployment-instructions)
   - [A. Production Deployment via Vercel](#a-production-deployment-via-vercel-frontend-pwa)
   - [B. Production Deployment via Docker Compose](#b-production-deployment-via-docker-compose-fullstack)
   - [C. Local Development Setup (Windows / Linux / macOS)](#c-local-development-setup-manual)
10. [Repository Directory Structure](#-repository-directory-structure)
11. [Troubleshooting & Frequently Asked Questions](#-troubleshooting--frequently-asked-questions)
12. [Government Dignitaries & Project Credits](#-government-dignitaries--project-credits)

---

## 🏛️ Project Overview & Mission

**Nimma Seva (ನಿಮ್ಮ ಸೇವಾ)** is a citizen-centric, enterprise-grade **Progressive Web Application (PWA)** and **Distributed Queue Management System** designed for **GramOne**, **Seva Sindhu**, and **Bapuji Seva Kendra** citizen service centers across **Shivamogga District, Karnataka**.

### The Challenge Addressed
Traditional public service centers experience severe crowding, unpredictable wait times, manual paper token distribution, neglect of elderly/disabled citizens, and a complete lack of real-time visibility into server uptime and counter availability.

### The Solution Delivered
- **Decentralized Slot Booking**: Citizens can reserve appointments from smartphones or kiosks before visiting the center.
- **Priority Tiering**: Automated priority routing for Senior Citizens (60+), Persons with Disabilities (PwD), Pregnant Women, and Emergency medical/legal cases.
- **Real-Time Synchronized Queue**: Ultra-low latency WebSocket synchronization between citizen phones, operator consoles, and large-screen hall displays.
- **AI-Inspired Tatkal Wait Estimator**: Dynamically forecasts service completion probabilities and queue wait time using historical rolling averages and active counter capacity.
- **Offline Resilient Architecture**: Full PWA capabilities with service worker caching and graceful offline mock fallbacks ensuring the interface remains operational during network drops.
- **Bilingual Interface**: Native, high-fidelity localization in **Kannada (ಕನ್ನಡ)** and **English**.

---

## 🏗️ High-Level Architecture

```mermaid
flowchart TB
    subgraph Citizens["Citizen Touchpoints"]
        MobilePWA["Mobile PWA (Android / iOS)"]
        DesktopWeb["Desktop Browser"]
        HallTV["Hall Display Board (TV / Monitor)"]
    end

    subgraph CDN["Edge & Delivery Layer"]
        VercelEdge["Vercel Edge / Static CDN"]
        NginxRevProxy["Nginx Reverse Proxy & SSL"]
    end

    subgraph FrontendApp["Frontend Application (React 18 + Vite)"]
        ReactRouter["React Router v7 SPA"]
        ZustandStore["Zustand Global State"]
        LeafletGPS["Leaflet GPS & Map Engine"]
        SpeechSynth["Web Speech Kannada/English Voice"]
        OfflineSW["Workbox Service Worker & Cache"]
    end

    subgraph BackendApp["Backend Application (FastAPI + Python 3.11)"]
        SecMiddleware["Security & Rate-Limiter Middleware"]
        AuthModule["JWT & Firebase/SMTP Auth"]
        TokenEngine["Hybrid Token & Range Engine"]
        PredictionEngine["Tatkal Wait Prediction Service"]
        PDFEngine["ReportLab PDF Generator"]
        WSManager["WebSocket Connection Manager"]
    end

    subgraph DataPersistence["Data Persistence Layer"]
        PostgreSQL[("PostgreSQL 15 / SQLite Database")]
        AuditStore[("Immutable Audit Trail")]
    end

    Citizens --> VercelEdge
    VercelEdge --> FrontendApp
    Citizens --> NginxRevProxy
    NginxRevProxy --> FrontendApp
    FrontendApp -- "REST APIs (JSON)" --> SecMiddleware
    FrontendApp -- "Realtime WebSocket" --> WSManager
    SecMiddleware --> AuthModule
    SecMiddleware --> TokenEngine
    TokenEngine --> PredictionEngine
    TokenEngine --> PDFEngine
    TokenEngine --> PostgreSQL
    TokenEngine --> AuditStore
    WSManager --> PostgreSQL
    WSManager -. "State Broadcast" .-> HallTV
    WSManager -. "Live Notification" .-> MobilePWA
```

---

## 🌟 Exhaustive Feature Directory

### 1. Citizen Portal Experience

#### 📍 Intelligent Geolocation & Nearest Center Locator
- **GPS Auto-Detection**: Prompts for browser geolocation and calculates distance using the Haversine formula against all GramOne and Seva Sindhu offices in Shivamogga.
- **Interactive Leaflet Map**: Displays centers with custom colored map pins, status markers (Active, Maintenance, High Footfall), address, phone numbers, and estimated road transit time in minutes.
- **Taluk & Village Hierarchy**: Filter by all 7 Taluks of Shivamogga:
  - *Shivamogga Urban & Rural*
  - *Bhadravathi*
  - *Sagar*
  - *Shikaripura*
  - *Soraba*
  - *Thirthahalli*
  - *Hosanagara*

#### 📝 Multi-Step Token Reservation Engine
- **Hierarchical Form Flow**: Step 1: Center Selection ➔ Step 2: Service & Document Verification ➔ Step 3: Citizen Demographics & Priority Tagging ➔ Step 4: Time Slot & OTP Authentication.
- **Operating Hours Enforcement**: Automatically verifies current local time against office hours (`09:00 AM - 05:00 PM`) and lunch breaks (`01:00 PM - 02:00 PM`). Prevents same-day booking after 05:00 PM, offering next working day priority scheduling.
- **Real-Time Quota Guard**: Prevents overbooking beyond `max_daily_tokens` configured per center.

#### 🦽 Automated Priority & Vulnerable Citizen Routing
- Flags citizens qualifying for priority treatment:
  - **Senior Citizens (Age 60+)**: Automatically allocated priority token range `81-90`.
  - **Persons with Disabilities (PwD)**: Dedicated queue priority with zero-step queue jumping.
  - **Pregnant & Lactating Mothers**: High-priority allocation.
  - **Medical & Statutory Emergencies**: Direct assignment into emergency token band `91-100`.

#### 🔐 Dual Verification Suite (Mobile Phone & Email OTP)
- **Firebase SMS Verification**: E.164 phone normalization (`+91`), invisible reCAPTCHA widget handling, and direct SMS verification codes.
- **Email OTP Verification**: Free SMTP integration (compatible with Gmail SMTP) sending a 6-digit cryptographically secure verification code expiring in 10 minutes.
- **Instant Demo Bypass**: Permissive test mode for local demonstration and inspection without requiring active SMS credits.

#### 🎫 Official Digital Token Pass & ReportLab PDF Generator
- **High-Definition QR Code**: Dynamic Base64 QR code encoding the verification link and token metadata.
- **Anti-Fraud Security Code**: Ephemeral 6-character cryptographic verification string (e.g., `VF-83921`) to prevent token counterfeiting.
- **Official PDF Generator**: Server-side ReportLab generation complete with:
  - Official Seal of Karnataka emblem watermark.
  - Bilingual headers (ಕನ್ನಡ / English).
  - Center address, operating timings, counter window, and statutory fee receipt.
  - List of mandatory physical documents required at the counter.
  - Direct print styling and one-tap WhatsApp / SMS share integration.

#### ⏱️ Real-Time Queue Tracker (`/queue`)
- **Instant Status Inspection**: Enter token number or mobile number to inspect live queue position.
- **Metrics Presented**:
  - Currently called token at Counter 1, 2, and 3.
  - Citizen's exact position in line and number of people ahead.
  - Dynamic estimated wait time (minutes).
  - Assigned counter number once called.
- **Live Sound Alerts**: Web Audio API auditory chime whenever counter calls or token status transitions occur.

---

### 2. Staff & Admin Operator Console

#### 🔐 Role-Based Access Control (RBAC)
- Secure JWT-based authentication for operators and district administrators.
- Automatic session invalidation and redirection on token expiration (8-hour sliding window).

#### 🎛️ Counter Queue Control Center (`/admin/queue`)
Operators possess complete control over the token lifecycle:
- **Call Next Token**: Pulls the highest priority pending token according to the hybrid priority scheduling algorithm.
- **Skip Token**: Marks a citizen absent after multiple calls; places them into a grace re-call buffer.
- **Recall Token**: Re-announces the citizen's number over the public hall display with visual flashing.
- **Mark Served / Complete**: Records completion timestamp, logs statutory fee collected, and updates daily throughput analytics.
- **Cancel Token**: Void invalid or non-compliant applications with mandatory reason logging.
- **Transfer Token**: Re-routes a citizen's token to a neighboring center or specialized counter with state preservation.
- **Pause / Resume Queue**: Temporarily freeze token callouts during administrative breaks or hardware diagnostics.

#### ⚡ Real-Time Service Server Status Toggles (`/admin/services`)
- Allows district IT administrators to toggle individual government services between:
  - `Active`: Operational and accepting bookings.
  - `Maintenance`: Scheduled maintenance; displays warning to citizens.
  - `Server Down`: Major state portal outage; immediately halts bookings, triggers user modal alerts, and recommends alternative dates.

#### 📊 Live KPI Dashboard & Reporting (`/admin/dashboard` & `/admin/analytics`)
- **Live Metrics**: Today's total bookings, completed tokens, active queue count, cancelled tokens, revenue collected, and no-show rate.
- **Interactive Recharts Graphs**:
  - Hourly traffic distribution (peak hours analysis from 09:00 AM to 05:00 PM).
  - Weekly and monthly revenue generation.
  - Service demand distribution (Revenue Department vs Food & Civil Supplies vs Transport).
  - Online vs Walk-in booking ratios.
- **One-Click CSV Export**: Instant export of all booking records, financial settlements, and audit logs for district administration reporting.

#### 🛡️ Immutable Audit Log Trail (`/admin/audit-log`)
- Complete historical record of all operator actions: token status changes, service status toggles, user cancellations, and queue pause events.
- Tracks `operator_id`, `action`, `details`, and `timestamp` in UTC.

---

### 3. Hall Display Board & Audio Synthesis (`/display/:officeId`)

- **TV / Monitor Fullscreen Layout**: Designed for high-definition 4K and 1080p LED displays installed in center waiting halls.
- **Dual Display Columns**:
  - **Currently Serving**: Displays Token ID, Citizen Name, Service Name, and Assigned Counter Number in ultra-large amber/emerald typography.
  - **Up Next**: Displays the next 5 upcoming tokens so citizens can prepare their documents.
- **Bilingual Voice Synthesis**: Uses browser Web Speech API to vocalize announcements in Kannada and English:
  - *"ಟೋಕನ್ ಸಂಖ್ಯೆ 25, ಕೌಂಟರ್ 2 ಕ್ಕೆ ದಯವಿಟ್ಟು ಬನ್ನಿ."*
  - *"Token number 25, please proceed to Counter number 2."*
- **Flashing Visual Prompts**: CSS keyframe pulse animations highlight recently called tokens for hearing-impaired citizens.

---

### 4. Public Grievance Redressal (`/grievance`)

Built following the **Centralized Public Grievance Redress and Monitoring System (CPGRAMS)** and Karnataka **IPGRS** guidelines:
- **Unique Ticket Number**: Auto-generates reference IDs in format `GRV-XXXXXX`.
- **Classification Categories**:
  - *Delayed Counter Service*
  - *Staff Misbehavior or Non-cooperation*
  - *Overcharging or Bribery Demand*
  - *Hardware / Network Portal Downtime*
  - *Incorrect Document Rejection*
  - *Accessibility / Infrastructure Issue*
- **Live Ticket Tracker**: Citizens can enter their Ticket ID or Mobile Number to view real-time investigation stages:
  `Submitted` ➔ `Under Review` ➔ `Investigation in Progress` ➔ `Resolved / Rejected`.
- **Officer Resolution Notes**: Final disposal remarks and corrective action documentation displayed transparently to the citizen.

---

### 5. Karnataka Welfare & Guarantee Schemes Directory (`/schemes`)

Comprehensive database of major Karnataka State flagship initiatives:
1. **Gruha Lakshmi (ಗೃಹಲಕ್ಷ್ಮಿ)**: ₹2,000 monthly financial assistance to female heads of households.
2. **Yuva Nidhi (ಯುವನಿಧಿ)**: ₹3,000/month for unemployed degree holders, ₹1,500/month for diploma holders.
3. **Gruha Jyothi (ಗೃಹಜ್ಯೋತಿ)**: Up to 200 units of free domestic electricity.
4. **Shakti Scheme (ಶಕ್ತಿ ಯೋಜನೆ)**: Free bus travel for women across KSRTC and BMTC networks.
5. **Anna Bhagya (ಅನ್ನಭಾಗ್ಯ)**: 10 kg free food grains / direct benefit cash transfer for BPL cardholders.
6. **Raita Vidya Nidhi (ರೈತ ವಿದ್ಯಾನಿಧಿ)**: Scholarship for children of farmers and agricultural laborers.
7. **Sandhya Suraksha Pension (ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ)**: Monthly old-age pension for senior citizens.
8. **Matru Vandana & Arogya Karnataka**: Healthcare and maternity assistance programs.

**Smart Eligibility Filtering Engine**:
- Citizens enter their **Age**, **Gender**, **Annual Income**, and **Occupation** (Farmer, Student, Artisan, Unemployed, Business) to instantly see schemes they qualify for, along with required documents, benefit summaries, and direct Seva Sindhu application links.

---

### 6. Document Requirement Explorer (`/services`)

Detailed statutory checklist for high-volume government services:
- **Caste & Income Certificate (RDPR / Revenue)**
- **RTC / Pahani Extract (Bhoomi Portal)**
- **Khata Extract & Mutation Register (E-Swathu)**
- **New Ration Card & BPL Modification (Ahara)**
- **Senior Citizen Identity Card**
- **Disability UDID Card & Pension**
- **Birth & Death Certificate (E-Janma)**

Each entry itemizes:
- Official Statutory Fee (₹).
- Service Delivery Timeline under Sakala (ಸಕಾಲ) Guarantee Act.
- Mandatory vs Optional Supporting Documents (Aadhaar, Ration Card, Voter ID, Land Records, Affidavit).

---

## ⚙️ Hybrid Token & Prediction Engine

To guarantee fair access between digitally literate citizens booking online and rural walk-in citizens without smartphones, Nimma Seva uses an **Intelligent Hybrid Split Range Engine**:

| Segment | Allocated Daily Range | Description | Priority Level |
|---|---|---|---|
| **Walk-in Citizens** | `01 – 10`, `41 – 50` | Reserved exclusively for on-site kiosk attendees | Normal |
| **Online Bookings** | `11 – 40`, `51 – 80` | Web & Mobile PWA reservations | Normal |
| **Vulnerable / Priority** | `81 – 90` | Senior Citizens (60+), PwD, Pregnant Women | **High** |
| **Statutory Emergency** | `91 – 100` | Court hearings, emergency medical relief | **Critical** |

### Tatkal Prediction Algorithm
Calculates the probability of token completion before office closure using:

$$\text{Estimated Wait (mins)} = \left(\frac{\text{Queue Depth Ahead}}{\text{Active Counters}}\right) \times \text{Avg Processing Time (mins)}$$

$$\text{Probability Score (\%)} = \max\left(5\%, 100\% - \left(\frac{\text{Estimated Wait}}{\text{Mins Remaining in Workday}} \times 100\right)\right)$$

- **$\ge 80\%$**: High completion confidence (Green badge).
- **$50\% - 79\%$**: Medium confidence; recommend arriving early (Amber badge).
- **$< 50\%$**: High risk of queue rollover; suggest booking for the next morning (Red badge).

---

## 🗄️ Database Schema & Data Models

The system is configured with SQLAlchemy ORM supporting both **PostgreSQL 15** and **SQLite**:

```
+---------------------------------------------------------------------------------+
|                                 users                                           |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| full_name         | VARCHAR            | Full Legal Name                        |
| email             | VARCHAR (Unique)   | Optional Contact Email (Indexed)       |
| phone             | VARCHAR            | 10-digit Indian Mobile Number          |
| hashed_password   | VARCHAR            | Bcrypt Hash                            |
| aadhaar           | VARCHAR            | Masked / 12-digit Aadhaar              |
| age               | INTEGER            | Age in years                           |
| gender            | VARCHAR            | Male / Female / Other                  |
| role              | VARCHAR            | citizen / operator / admin             |
| created_at        | TIMESTAMP          | UTC Registration Timestamp             |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                                 offices                                         |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| name              | VARCHAR            | Center Title (e.g. GramOne Shivamogga) |
| type              | VARCHAR            | GramOne / SevaSindhu / BSK             |
| address           | VARCHAR            | Physical Street Address                |
| district          | VARCHAR            | Default "Shivamogga"                   |
| taluk             | VARCHAR            | Taluk Name (Indexed)                   |
| village           | VARCHAR            | Gram Panchayat / Village               |
| latitude          | FLOAT              | Geographic Latitude Coordinate         |
| longitude         | FLOAT              | Geographic Longitude Coordinate        |
| phone             | VARCHAR            | Landline / Helpdesk Phone              |
| working_hours     | VARCHAR            | Default "09:00 AM - 05:00 PM"          |
| lunch_break       | VARCHAR            | Default "01:00 PM - 02:00 PM"          |
| max_daily_tokens  | INTEGER            | Daily Quota Limit                      |
| server_status     | VARCHAR            | Active / Maintenance / Down            |
| offline_range     | VARCHAR            | Token bands for offline walk-ins       |
| online_range      | VARCHAR            | Token bands for web bookings           |
| priority_range    | VARCHAR            | Token bands for Senior / PwD           |
| emergency_range   | VARCHAR            | Token bands for emergency cases        |
| created_at        | TIMESTAMP          | UTC Creation Timestamp                 |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                                 services                                        |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| name              | VARCHAR            | Official Scheme / Certificate Name     |
| code              | VARCHAR (Unique)   | Unique Shortcode (e.g. RD-INC-01)      |
| category          | VARCHAR            | Revenue, Civil Supplies, Welfare, etc. |
| fee               | FLOAT              | Official Government Fee (₹)            |
| avg_time_mins     | INTEGER            | Average counter processing duration    |
| daily_capacity    | INTEGER            | Maximum throughput capacity            |
| is_active         | BOOLEAN            | Enable / Disable service               |
| server_status     | VARCHAR            | Active / Maintenance / Down            |
| required_docs     | JSON               | Array of mandatory document strings    |
| description       | TEXT               | Informational details                  |
| created_at        | TIMESTAMP          | UTC Creation Timestamp                 |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                                 bookings                                        |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| token_number      | VARCHAR (Indexed)  | Assigned Token Identifier (e.g. G-24)  |
| verification_code | VARCHAR            | 6-character anti-counterfeit string    |
| citizen_name      | VARCHAR            | Applicant Full Name                    |
| phone             | VARCHAR            | SMS Notification Phone Number          |
| aadhaar           | VARCHAR            | Masked Aadhaar (XXXX-XXXX-1234)        |
| age               | INTEGER            | Applicant Age                          |
| gender            | VARCHAR            | Gender Identity                        |
| is_priority       | BOOLEAN            | Flag for Priority Queue                |
| priority_reason   | VARCHAR            | Senior Citizen, PwD, Pregnant, etc.    |
| booking_type      | VARCHAR            | Online / Walk-in / Priority / Emergency|
| office_id         | INTEGER (FK)       | References offices.id                  |
| service_id        | INTEGER (FK)       | References services.id                 |
| booking_date      | VARCHAR            | Reservation creation date (YYYY-MM-DD) |
| visit_date        | VARCHAR            | Scheduled appointment date (YYYY-MM-DD)|
| visit_time        | VARCHAR            | Scheduled slot window                  |
| status            | VARCHAR            | Pending/Called/In Progress/Completed...|
| counter_number    | INTEGER            | Counter window assigned on call        |
| amount_paid       | FLOAT              | Statutory fee collected                |
| tatkal_prob       | INTEGER            | Completion likelihood (0 - 100%)       |
| created_at        | TIMESTAMP          | UTC Creation Timestamp                 |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                               queue_states                                      |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| office_id         | INTEGER (FK, Unique| References offices.id                  |
| current_token     | VARCHAR            | Token presently at counter             |
| next_token        | VARCHAR            | Token on deck                          |
| active_counters   | INTEGER            | Number of physically staffed desks     |
| is_paused         | BOOLEAN            | Queue hold toggle                      |
| updated_at        | TIMESTAMP          | Last state transition timestamp        |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                                 grievances                                      |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| ticket_id         | VARCHAR (Unique)   | Format GRV-XXXXXX (Indexed)            |
| citizen_name      | VARCHAR            | Complainant Name                       |
| mobile            | VARCHAR            | Complainant Phone                      |
| token_number      | VARCHAR (Nullable) | Associated Token, if applicable        |
| center_name       | VARCHAR            | Center complained against              |
| category          | VARCHAR            | Service Delay, Misbehavior, Fee, etc.  |
| description       | TEXT               | Detailed incident narrative            |
| status            | VARCHAR            | Submitted/Under Review/Resolved...     |
| resolution_notes  | TEXT (Nullable)    | Disposing Officer Comments             |
| submitted_at      | TIMESTAMP          | Filing Timestamp                       |
| resolved_at       | TIMESTAMP (Nullable| Resolution Timestamp                   |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                                 audit_logs                                      |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER            | Primary Key, Auto-increment            |
| user_name         | VARCHAR            | Staff Operator / System Actor          |
| action            | VARCHAR            | CALL_TOKEN, SKIP, CANCEL, STATUS_CHANGE|
| details           | TEXT               | JSON payload or descriptive metadata   |
| timestamp         | TIMESTAMP          | Event Timestamp (UTC)                  |
+-------------------+--------------------+----------------------------------------+
```

---

## 📡 Complete REST API & WebSocket Documentation

All REST endpoints reside under prefix `/api`. Interactive OpenAPI Swagger documentation is served at `/docs`.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate staff/admin using email & password; returns JWT Bearer token | No |
| `POST` | `/api/auth/register` | Register citizen or staff user account | No |
| `POST` | `/api/auth/send-email-otp` | Sends a 6-digit verification code via SMTP | No |
| `POST` | `/api/auth/verify-email-otp`| Verifies 6-digit code for citizen verification | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile and roles | **Yes (Bearer)** |

### Center & Office Endpoints (`/api/offices`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/offices` | Retrieve all GramOne & Seva Sindhu offices | No |
| `GET` | `/api/offices/{id}` | Retrieve specific office metadata, hours, and status | No |
| `GET` | `/api/offices/nearby` | Query centers sorted by distance (`?lat=13.92&lng=75.56`) | No |
| `PUT` | `/api/offices/{id}/status` | Toggle center operational status (`Active`/`Maintenance`/`Down`) | **Yes (Admin)** |

### Government Services Endpoints (`/api/services`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/services` | List all available citizen services and fees | No |
| `GET` | `/api/services/{id}` | Inspect service details, requirements, and SLA days | No |
| `PUT` | `/api/services/{id}/server-status` | Toggle service health state (`Active`/`Maintenance`/`Down`) | **Yes (Admin)** |

### Token Reservation & Booking Endpoints (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/bookings` | Create new citizen token reservation | No |
| `GET` | `/api/bookings` | List all bookings for a center / date filter | **Yes (Staff)** |
| `GET` | `/api/bookings/token/{token_number}` | Fetch token pass details by token code | No |
| `GET` | `/api/bookings/{id}/pdf` | Stream official ReportLab PDF token pass | No |
| `POST` | `/api/bookings/{id}/cancel` | Cancel an active booking pass | No |
| `GET` | `/api/bookings/citizen/phone/{phone}` | Fetch all past/upcoming tokens by phone | No |

### Real-Time Queue Operations (`/api/queue`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/queue/state/{office_id}` | Fetch current queue state (called token, next token) | No |
| `POST` | `/api/queue/call-next` | Advance queue and announce next citizen | **Yes (Staff)** |
| `POST` | `/api/queue/skip` | Skip absent citizen and push to recall buffer | **Yes (Staff)** |
| `POST` | `/api/queue/recall` | Re-announce current token over display board | **Yes (Staff)** |
| `POST` | `/api/queue/complete` | Mark citizen served and log collection | **Yes (Staff)** |
| `POST` | `/api/queue/pause` | Pause / resume queue execution | **Yes (Staff)** |

### Public Grievances Endpoints (`/api/grievances`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/grievances` | Submit a new citizen grievance; returns `ticket_id` | No |
| `GET` | `/api/grievances/{ticket_id}` | Inspect grievance resolution timeline and status | No |
| `GET` | `/api/grievances` | List all grievances (filterable by center & status) | **Yes (Admin)** |
| `PUT` | `/api/grievances/{id}/status` | Update grievance status and add resolution remarks | **Yes (Admin)** |

### Welfare Schemes Endpoints (`/api/schemes`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/schemes` | Retrieve all Karnataka welfare schemes | No |
| `POST` | `/api/schemes/filter` | Match schemes against user demographics (age, gender, income) | No |

### Analytics & Audit Trails (`/api/analytics` & `/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/summary` | Today's footfall, revenue, no-show rate, hourly splits | **Yes (Admin)** |
| `GET` | `/api/analytics/export-csv` | Download CSV records of daily booking and collections | **Yes (Admin)** |
| `GET` | `/api/admin/audit-logs` | Retrieve immutable staff action history | **Yes (Admin)** |

### WebSocket Protocol (`/ws/queue/{office_id}`)
- Connect via `ws://<HOST>/ws/queue/{office_id}` or `wss://<HOST>/ws/queue/{office_id}`.
- Instant unidirectional & bidirectional JSON broadcast messages whenever counter states update:
```json
{
  "type": "QUEUE_UPDATE",
  "office_id": 1,
  "current_token": "G-14",
  "next_token": "G-15",
  "counter_number": 2,
  "active_counters": 3,
  "is_paused": false,
  "timestamp": "2026-09-30T17:15:00Z"
}
```

---

## 🔒 Security Architecture & Hardening

1. **Strict Input Sanitization**:
   - Pydantic v2 schemas reject malformed payloads, enforcing exact phone regexes, 12-digit numeric Aadhaar standards, and sanitized text inputs preventing SQL Injection and Cross-Site Scripting (XSS).
2. **In-Memory Rate Limiting**:
   - Custom sliding window middleware protects public booking and authentication routes against DDoS and automated credential stuffing attacks.
3. **Enterprise HTTP Security Headers**:
   - `Content-Security-Policy`: Restricts unauthorized script injection.
   - `X-Frame-Options: DENY`: Complete clickjacking mitigation.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
   - `Strict-Transport-Security (HSTS)`: Enforces secure TLS encryption.
4. **Cryptographic Anti-Counterfeit Verification**:
   - Every digital token pass embeds an anti-fraud security code (`verification_code`) generated with cryptographic entropy, verifiable by staff at the counter desk.

---

## ⚙️ Configuration & Environment Variables

### Backend Configuration (`backend/.env`)
| Variable | Description | Default / Example Value |
|---|---|---|
| `PROJECT_NAME` | Display name of the system | `"Nimma Seva - Shivamogga Smart Seva"` |
| `API_V1_STR` | Prefix for API routes | `"/api"` |
| `SECRET_KEY` | Hex secret for signing JWT tokens | Run `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | JWT hashing algorithm | `"HS256"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Staff JWT lifetime in minutes | `480` (8 Hours) |
| `DATABASE_URL` | SQLAlchemy Database Connection URI | `sqlite:///./nimmaseva.db` or `postgresql://user:pass@localhost:5432/nimmasevadb` |
| `SMTP_HOST` | Outbound SMTP server | `"smtp.gmail.com"` |
| `SMTP_PORT` | SMTP communication port | `587` |
| `SMTP_USER` | SMTP authentication username / email | `"your-email@gmail.com"` |
| `SMTP_PASSWORD` | SMTP authentication app password | `"your-app-password"` |
| `SMTP_FROM_NAME` | Outbound sender title | `"Nimma Seva Karnataka"` |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins array | `["http://localhost:5173", "https://your-domain.vercel.app"]` |

### Frontend Configuration (`frontend/.env`)
| Variable | Description | Default / Example Value |
|---|---|---|
| `VITE_API_URL` | Base URL for FastAPI backend | `"/api"` (Uses proxy/reverse proxy in prod) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | Optional (Embedded fallback provided) |
| `VITE_FIREBASE_AUTH_DOMAIN`| Firebase Auth Domain | `nimmaseva-73159.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `nimmaseva-73159` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket | `nimmaseva-73159.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| FCM Sender ID | `239897408131` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:239897408131:web:...` |

---

## 🚀 Installation & Deployment Instructions

### A. Production Deployment via Vercel (Frontend PWA)

The repository is pre-configured with root and subdirectory `vercel.json` configurations supporting instant continuous deployment via Git:

1. Push your repository to GitHub / GitLab.
2. In the [Vercel Dashboard](https://vercel.com), select **Add New Project** and import `Nimmaseva`.
3. If Root Directory is left as default (`.`):
   - Vercel automatically runs `cd frontend && npm install --legacy-peer-deps && npm run build`.
   - Output directory is set to `frontend/dist`.
4. If Root Directory is set to `frontend`:
   - Vercel uses `frontend/vercel.json` and outputs from `dist`.
5. Environment Variables:
   - Add `VITE_API_URL` pointing to your deployed backend (e.g. `https://api.yourdomain.gov.in/api`).
   - If no backend is provided, the application automatically enters **Resilient Standalone Mode** with rich demo mock fallbacks.

---

### B. Production Deployment via Docker Compose (Fullstack)

To run the complete production stack (Nginx, PostgreSQL 15, FastAPI, and Vite React frontend) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/shettyadi57/Nimmaseva.git
cd Nimmaseva

# 2. Copy and configure environment variables
cp .env.example .env

# 3. Spin up all containerized services
docker compose up --build -d
```

- Public Portal: `http://localhost`
- API Documentation: `http://localhost/docs` or `http://localhost:8000/docs`

To initialize default admin credentials and district offices:
```bash
docker compose exec backend python app/seed.py
```

---

### C. Local Development Setup (Manual)

#### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database with sample offices, services, schemes, and admin
python app/seed.py

# Launch development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup (React 18 + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (respecting legacy peer dependencies)
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
```
Access the application at `http://localhost:5173`.

#### Default Seeded Admin Credentials:
- **Email**: `admin@nimmaseva.in`
- **Password**: `Admin@123`
- *(Important: Rotate credentials immediately after initial installation)*

---

## 📁 Repository Directory Structure

```
Nimmaseva/
├── .npmrc                           # Root npm config (legacy-peer-deps=true)
├── .env.example                     # Sample environment variable template
├── docker-compose.yml               # Production multi-container orchestration
├── package.json                     # Root npm script runner
├── vercel.json                      # Vercel root deployment configuration
├── README.md                        # Master project documentation
│
├── backend/                         # FastAPI Application Core
│   ├── Dockerfile                   # Python container build
│   ├── requirements.txt             # Python packages & dependencies
│   └── app/
│       ├── main.py                  # ASGI FastAPI application entrypoint
│       ├── seed.py                  # Database auto-seed generator
│       ├── api/                     # REST API Route Controllers
│       │   ├── admin.py             # Staff & operator actions, audit trail
│       │   ├── analytics.py         # KPI calculations & CSV exporter
│       │   ├── auth.py              # JWT authentication & OTP routers
│       │   ├── bookings.py          # Token creation, cancel, and lookup
│       │   ├── grievances.py        # Public grievance redressal routes
│       │   ├── notifications.py     # Push & alert handlers
│       │   ├── offices.py           # Center directory & distance query
│       │   ├── public.py            # Public portal metadata
│       │   ├── queue.py             # Real-time counter queue transitions
│       │   ├── schemes.py           # Karnataka welfare schemes query
│       │   └── services.py          # Government service checklist & fees
│       ├── core/                    # Engine Configuration
│       │   ├── config.py            # Pydantic environment configuration
│       │   ├── database.py          # SQLAlchemy engine & session factory
│       │   ├── dependencies.py      # Auth & database dependency injections
│       │   ├── security.py          # Password hashing & JWT generation
│       │   └── security_middleware.py # Rate limiter & security headers
│       ├── models/
│       │   └── models.py            # SQLAlchemy database tables & relations
│       ├── schemas/
│       │   └── schemas.py           # Pydantic v2 validation models
│       ├── services/
│       │   ├── pdf_service.py       # ReportLab PDF pass generator
│       │   ├── prediction_service.py# AI-inspired Tatkal wait estimator
│       │   ├── qr_service.py        # Base64 QR code encoding service
│       │   ├── queue_service.py     # Hybrid token range allocator
│       │   └── token_service.py     # Anti-counterfeit verification codes
│       └── websockets/
│           └── connection_manager.py# Real-time WebSocket event broadcaster
│
├── frontend/                        # React 18 TypeScript PWA
│   ├── .npmrc                       # Frontend npm peer dependency config
│   ├── Dockerfile                   # Frontend container build
│   ├── index.html                   # HTML5 template with PWA meta & fonts
│   ├── package.json                 # Frontend dependencies (React, Vite, Leaflet)
│   ├── tailwind.config.js           # Government of Karnataka theme palette
│   ├── tsconfig.json                # TypeScript compiler configuration
│   ├── vercel.json                  # Subdirectory Vercel deployment rules
│   ├── vite.config.ts               # Vite build & VitePWA manifest setup
│   ├── public/                      # Static Assets & PWA Icons
│   │   ├── favicon.svg              # Government Emblem SVG favicon
│   │   ├── manifest.json            # Web App Manifest
│   │   ├── pwa-192x192.png          # Mobile home screen icon (192px)
│   │   └── pwa-512x512.png          # Splash screen & maskable icon (512px)
│   └── src/
│       ├── App.tsx                  # Master routing configuration
│       ├── main.tsx                 # React DOM mount point & ErrorBoundary
│       ├── index.css                # Global styles, glassmorphism, animations
│       ├── components/              # Modular UI Components
│       │   ├── AdminLayout.tsx      # Sidebar & header for admin panel
│       │   ├── ErrorBoundary.tsx    # Crash containment & reload fallback
│       │   ├── Footer.tsx           # Official state footer & policy links
│       │   ├── Header.tsx           # Dignitaries bar, theme, language toggle
│       │   ├── KarnatakaBadge.tsx   # Official emblem & state crest badge
│       │   ├── PWAInstallBanner.tsx # Native mobile install prompt banner
│       │   ├── ServerDownModal.tsx  # Portal downtime alert dialog
│       │   └── map/
│       │       └── OfficeMap.tsx    # Interactive Leaflet map with GPS pins
│       ├── context/                 # React Context Providers
│       │   ├── LanguageContext.tsx  # Kannada / English localization
│       │   └── ThemeContext.tsx     # Light / Dark mode management
│       ├── lib/
│       │   └── firebase.ts          # Firebase Phone Auth & reCAPTCHA helper
│       ├── pages/                   # Application Views & Routes
│       │   ├── Accessibility.tsx    # Accessibility statement
│       │   ├── BookingForm.tsx      # Multi-step token booking wizard
│       │   ├── CitizenLogin.tsx     # Citizen portal login view
│       │   ├── DisplayBoard.tsx     # Waiting hall LED screen display
│       │   ├── Grievance.tsx        # Grievance submission & tracking
│       │   ├── Home.tsx             # Citizen landing portal & hero stats
│       │   ├── Hyperlinking.tsx     # State hyperlinking guidelines
│       │   ├── MyBookings.tsx       # Citizen active tokens & history
│       │   ├── Privacy.tsx          # Privacy policy (DPDP Act aligned)
│       │   ├── QueueTracker.tsx     # Live token queue tracker & audio
│       │   ├── SchemeSearch.tsx     # Welfare scheme eligibility engine
│       │   ├── ServiceDocuments.tsx # Service fee & document catalog
│       │   ├── Sitemap.tsx          # Complete portal navigation sitemap
│       │   ├── Terms.tsx            # Terms of service
│       │   ├── TokenView.tsx        # Digital pass, QR code, and PDF
│       │   └── admin/               # Administrator & Operator Suite
│       │       ├── Analytics.tsx    # Footfall & revenue visualizations
│       │       ├── AuditLog.tsx     # Immutable audit log inspection
│       │       ├── Dashboard.tsx    # Operator KPI overview
│       │       ├── Login.tsx        # Staff JWT authentication
│       │       ├── QueueManagement.tsx # Counter queue control panel
│       │       ├── Services.tsx     # Service server status toggle
│       │       └── Settings.tsx     # Office profile & hours config
│       ├── services/
│       │   └── api.ts               # Axios HTTP client & resilient mock layer
│       ├── store/
│       │   └── useStore.ts          # Zustand global state store
│       └── types/
│           └── index.ts             # Comprehensive TypeScript definitions
│
└── nginx/
    └── nginx.conf                   # Reverse proxy, caching, and SSL config
```

---

## ❓ Troubleshooting & Frequently Asked Questions

### 1. Why did the Vercel deployment previously fail?
Vercel previously encountered an invalid regex rewrite pattern (`/((?!.*\\.).*)`) in `vercel.json`. This has been resolved by using standard SPA route rewriting:
```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```
Vercel automatically serves real static files (`/assets/*`, `/sw.js`, `/manifest.webmanifest`, `/favicon.svg`) first, forwarding all virtual client-side routes to `/index.html`.

### 2. How do I fix npm peer dependency conflicts during local install?
Due to Vite 8 plugins and React 18, install using the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```
Both `.npmrc` files in the repository root and `frontend/` have `legacy-peer-deps=true` enabled to ensure seamless automation.

### 3. Can the application run if the backend server is offline?
**Yes.** The frontend incorporates a **Resilient Mock Architecture** in [`frontend/src/services/api.ts`](file:///c:/Users/Adithya%20s%20shetty/Nimma%20Seva/Nimmaseva/frontend/src/services/api.ts). If the FastAPI backend is not connected or network connectivity fails, the app seamlessly defaults to built-in sample data for offices, services, token booking, and queue management without throwing fatal runtime exceptions.

### 4. How do I configure real SMS delivery for Firebase Phone Auth?
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Navigate to **Authentication** ➔ **Sign-in method** ➔ Enable **Phone**.
3. Under **Authorized domains**, add your Vercel production domain (e.g. `your-app.vercel.app`) and `localhost`.
4. Copy the API configuration keys into your `frontend/.env` file.

---

## 🎖️ Government Dignitaries & Project Credits

Built in alignment with the administrative standards of the **Government of Karnataka**:

- **Sri Siddaramaiah** — Hon'ble Chief Minister of Karnataka
- **Sri D.K. Shivakumar** — Hon'ble Deputy Chief Minister of Karnataka
- **Sri Priyank Kharge** — Hon'ble Minister for Information Technology, Biotechnology, and Rural Development & Panchayat Raj

**Shivamogga District Administration Digitalization Initiative**  
*GramOne & Seva Sindhu Public Service Delivery Transformation Project.*

---

## 📄 License
This application is developed for public governance and citizen service delivery under the aegis of the **Government of Karnataka • Shivamogga District Administration**.  
All rights reserved © 2026.
