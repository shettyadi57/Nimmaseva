# Nimma Seva — GramOne & Seva Sindhu Smart Token & Queue Management System
### Shivamogga District Administration • Government of Karnataka (ಕರ್ನಾಟಕ ಸರ್ಕಾರ)

[![Government of Karnataka](https://img.shields.io/badge/Government_of_Karnataka-Shivamogga_District-065f46?style=for-the-badge)](https://karnataka.gov.in)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production_Live-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_Offline-ea580c?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_Python_3.11-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Laravel 11](https://img.shields.io/badge/Backend-Laravel_11_PHP_8.3-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React 18](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Kannada First](https://img.shields.io/badge/Language-Kannada_First_(ಕನ್ನಡ)-ff9933?style=for-the-badge)](#-kannada-first-language-policy--persistence)
[![Docker](https://img.shields.io/badge/Docker-Multi_Stack_Orchestration-2563eb?style=for-the-badge&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-Government_Open_Public_Use-1e293b?style=for-the-badge)](#-license)

---

## 📑 Table of Contents

1. [Project Overview & Mission](#-project-overview--mission)
2. [Dual-Backend High-Level Architecture](#-dual-backend-high-level-architecture)
3. [Exhaustive Feature Directory](#-exhaustive-feature-directory)
   - [Citizen Portal Experience](#1-citizen-portal-experience)
   - [Dynamic Counter Allocation & AI Auto-Balancing Matrix](#2-dynamic-counter-allocation--ai-auto-balancing-matrix)
   - [Digital Coupon Pass & WebRTC QR Scanner Engine](#3-digital-coupon-pass--webrtc-qr-scanner-engine)
   - [Staff & Admin Operator Console](#4-staff--admin-operator-console)
   - [Hall Display Board & Audio Synthesis](#5-hall-display-board--audio-synthesis)
   - [Public Grievance Redressal (CPGRAMS/IPGRS Model)](#6-public-grievance-redressal-cpgramsipgrs-model)
   - [Karnataka Welfare & Guarantee Schemes Directory](#7-karnataka-welfare--guarantee-schemes-directory)
   - [Document Requirement Explorer](#8-document-requirement-explorer)
   - [Kannada First Language Policy & Persistence](#9-kannada-first-language-policy--persistence)
4. [Hybrid Token, Dynamic Allocation & Prediction Engine](#-hybrid-token-dynamic-allocation--prediction-engine)
5. [Database Schema & Data Models (SQLAlchemy & Eloquent)](#-database-schema--data-models)
6. [Complete REST API & WebSocket Documentation](#-complete-rest-api--websocket-documentation)
   - [Authentication & Citizen Direct Login](#authentication-endpoints-apiauth)
   - [Dynamic Counter Matrix & Auto-Balancing](#dynamic-counter-matrix-endpoints-apicounters)
   - [Offices, Services & Token Reservations](#center--office-endpoints-apioffices)
   - [Queue Operations, Grievances & Schemes](#real-time-queue-operations-apiqueue)
   - [Laravel 11 Backend API Parity Reference](#laravel-11-backend-api-parity-reference)
   - [Real-Time WebSocket Protocol](#websocket-protocol-wsqueueoffice_id)
7. [Security Architecture & Hardening](#-security-architecture--hardening)
8. [Configuration & Environment Variables](#-configuration--environment-variables)
9. [Installation & Deployment Instructions](#-installation--deployment-instructions)
   - [A. Production Deployment via Vercel (Frontend PWA)](#a-production-deployment-via-vercel-frontend-pwa)
   - [B. Production Deployment via Docker Compose (FastAPI Fullstack)](#b-production-deployment-via-docker-compose-fastapi-fullstack)
   - [C. Enterprise Deployment via Laravel 11 (PHP 8.3 + MySQL + Redis)](#c-enterprise-deployment-via-laravel-11-backend-php-83)
   - [D. Local Manual Development Setup (Windows / Linux / macOS)](#d-local-manual-development-setup)
   - [E. Running Automated Test Suites](#e-running-automated-test-suites)
10. [Repository Directory Structure](#-repository-directory-structure)
11. [Troubleshooting & Frequently Asked Questions](#-troubleshooting--frequently-asked-questions)
12. [Government Dignitaries & Project Credits](#-government-dignitaries--project-credits)

---

## 🏛️ Project Overview & Mission

**Nimma Seva (ನಿಮ್ಮ ಸೇವಾ)** is a citizen-centric, enterprise-grade **Progressive Web Application (PWA)** and **Distributed Queue Management System** designed for **GramOne**, **Seva Sindhu**, and **Bapuji Seva Kendra** citizen service centers across **Shivamogga District, Karnataka**.

### The Challenge Addressed
Traditional public service centers experience severe crowding, unpredictable wait times, manual paper token distribution, neglect of elderly/disabled citizens, counter bottlenecks where some counters are idle while others are overwhelmed, and a complete lack of real-time visibility into server uptime and counter availability.

### The Solution Delivered
- **Dual Enterprise Backend Option**: Run on lightweight asynchronous **FastAPI (Python 3.11)** or enterprise-grade **Laravel 11 (PHP 8.3)** with full API parity, Redis queues, and MySQL/PostgreSQL persistence.
- **Dynamic Counter Matrix & Load Balancing**: Real-time counter allocation that intelligently maps active service counters to high-congestion services, preventing bottlenecks and saving an estimated 10–25 minutes per citizen.
- **Digital Coupon Pass & WebRTC QR Scanner**: Instant digital pass generation with dynamic countdowns, animated QR codes, verification codes, and an integrated WebRTC camera scanner for instant counter check-in and token tracking.
- **Decentralized Slot Booking**: Citizens can reserve appointments from smartphones or kiosks before visiting the center, with instant phone login (no mandatory OTP required for quick access).
- **Automated Priority Routing**: Priority tiering for Senior Citizens (60+), Persons with Disabilities (PwD), Pregnant Women, and Emergency statutory/medical cases.
- **Real-Time Synchronized Queue**: Ultra-low latency WebSocket synchronization between citizen phones, operator consoles, and large-screen hall displays.
- **AI-Inspired Predictive Timeline Engine**: Dynamically forecasts service completion probabilities and queue wait time using historical rolling averages and active counter capacity.
- **Offline Resilient Architecture**: Full PWA capabilities with service worker caching and graceful offline mock fallbacks ensuring the interface remains operational during network drops.
- **Kannada-First Localization**: Native, high-fidelity default localization in **Kannada (ಕನ್ನಡ)** with user preference persistence across browser sessions, alongside English and Hindi.

---

## 🏗️ Dual-Backend High-Level Architecture

Nimma Seva features an interchangeable dual-backend architecture. The React 18 TypeScript frontend connects seamlessly to either the FastAPI Python backend or the Laravel 11 PHP backend via standard REST and WebSocket protocols.

```mermaid
flowchart TB
    subgraph Citizens["Citizen & Operator Touchpoints"]
        MobilePWA["Mobile PWA (Android / iOS)"]
        DesktopWeb["Desktop Browser (Citizen Portal)"]
        AdminConsole["Staff & Admin Operator Console"]
        HallTV["Hall Display Board (TV / Monitor)"]
        CamScanner["WebRTC Camera QR Scanner"]
    end

    subgraph CDN["Edge & Delivery Layer"]
        VercelEdge["Vercel Edge / Static CDN"]
        NginxRevProxy["Nginx Reverse Proxy & SSL"]
    end

    subgraph FrontendApp["Frontend Application (React 18 + TypeScript + Vite)"]
        ReactRouter["React Router v7 SPA"]
        ZustandStore["Zustand Global State"]
        CounterMatrixUI["Dynamic Counter Matrix Control"]
        CouponEngine["Digital Coupon Modal & QR Pass"]
        LangContext["Language Provider (Kannada First)"]
        LeafletGPS["Leaflet GPS & Map Engine"]
        SpeechSynth["Web Speech Kannada/English Voice"]
        OfflineSW["Workbox Service Worker & Cache"]
    end

    subgraph BackendOptions["Interchangeable Dual Backend Layer"]
        subgraph PythonBackend["FastAPI Backend (Python 3.11)"]
            FastAPIRouter["FastAPI ASGI Router"]
            PythonCounters["Counter Allocation Engine"]
            PythonPredict["Tatkal Wait Prediction Service"]
            PythonPDF["ReportLab PDF Generator"]
            PythonWS["FastAPI WebSocket Manager"]
        end

        subgraph LaravelBackend["Laravel 11 Backend (PHP 8.3)"]
            LaravelKernel["Laravel 11 REST API"]
            LaravelCounters["CounterService & Load Balancer"]
            LaravelPredict["PredictionService"]
            LaravelPDF["DomPDF / Blade Pass Engine"]
            LaravelReverb["Laravel Reverb / QueueUpdated Event"]
            LaravelSanctum["Sanctum Auth & Spatie RBAC"]
        end
    end

    subgraph DataPersistence["Data Persistence & Caching Layer"]
        DBPostgres[("PostgreSQL 15 / MySQL 8.0 / SQLite")]
        RedisCache[("Redis 7.2 (Queues & State Cache)")]
        AuditStore[("Immutable Audit Trail")]
    end

    Citizens --> VercelEdge
    VercelEdge --> FrontendApp
    Citizens --> NginxRevProxy
    NginxRevProxy --> FrontendApp

    FrontendApp -- "REST APIs (/api/*)" --> FastAPIRouter
    FrontendApp -- "REST APIs (/api/*)" --> LaravelKernel
    FrontendApp -- "WebSockets (/ws/* or Reverb)" --> PythonWS
    FrontendApp -- "WebSockets (/ws/* or Reverb)" --> LaravelReverb

    PythonCounters <--> DBPostgres
    PythonCounters <--> RedisCache
    LaravelCounters <--> DBPostgres
    LaravelCounters <--> RedisCache

    PythonWS -. "State Broadcast" .-> HallTV
    PythonWS -. "Live Sound / Updates" .-> MobilePWA
    LaravelReverb -. "Queue Broadcast" .-> HallTV
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
- **Hierarchical Form Flow**: Step 1: Center Selection ➔ Step 2: Service & Document Verification ➔ Step 3: Citizen Demographics & Priority Tagging ➔ Step 4: Time Slot & Instant Direct or OTP Confirmation.
- **Operating Hours Enforcement**: Automatically verifies current local time against office hours (`09:00 AM - 05:00 PM`) and lunch breaks (`01:00 PM - 02:00 PM`). Prevents same-day booking after 05:00 PM, offering next working day priority scheduling.
- **Real-Time Quota Guard**: Prevents overbooking beyond `max_daily_tokens` configured per center.

#### 🦽 Automated Priority & Vulnerable Citizen Routing
- Flags citizens qualifying for priority treatment:
  - **Senior Citizens (Age 60+)**: Automatically allocated priority token range `81-90` with dedicated counter routing.
  - **Persons with Disabilities (PwD)**: Dedicated queue priority with zero-step queue jumping.
  - **Pregnant & Lactating Mothers**: High-priority allocation.
  - **Medical & Statutory Emergencies**: Direct assignment into emergency token band `91-100`.

#### 🔐 Flexible Authentication Suite (Direct Phone Login, Firebase & SMTP OTP)
- **Instant Citizen Phone Login**: One-tap phone login (`/api/auth/citizen-direct-login`) allowing citizens to access bookings, passes, and coupons without mandatory SMS hurdles.
- **Firebase SMS Verification**: E.164 phone normalization (`+91`), invisible reCAPTCHA widget handling, and direct SMS verification codes.
- **Email OTP Verification**: Free SMTP integration (compatible with Gmail SMTP) sending a 6-digit cryptographically secure verification code expiring in 10 minutes.
- **Instant Demo Bypass**: Permissive test mode for local demonstration and inspection without requiring active SMS credits.

---

### 2. Dynamic Counter Allocation & AI Auto-Balancing Matrix

To eliminate single-counter bottlenecks where citizens wait 45+ minutes for high-demand services while other counters sit idle, Nimma Seva introduces a **Dynamic Counter Matrix & Load Balancing Engine**:

#### 🎛️ Counter Allocation Matrix Capabilities
- **Multi-Service Specialization**: Operators can assign multiple service IDs to each counter desk or set dedicated express modes (e.g., Counter 1 handles Caste/Income and Aadhaar; Counter 2 handles Revenue; Counter 3 handles Ration Cards).
- **Real-Time Congestion Index**: Computes per-service waiting queues, average turnaround times, and active desk capacity in real time.
- **Bottleneck Detection**: Automatically detects when queue depth for any specific service exceeds threshold limits while adjacent counters have spare capacity.
- **One-Click AI Dynamic Auto-Balancing**: Admin operators can click **"Auto-Balance Matrix"** to dynamically reallocate idle or under-utilized counters to high-congestion queues, saving 15–30 minutes per citizen.
- **Dynamic Counter Re-balancing API**: Both FastAPI (`POST /api/counters/{office_id}/auto-balance`) and Laravel (`POST /api/counters/{officeId}/auto-balance`) calculate optimal counter re-assignments and broadcast changes immediately to all connected clients.

---

### 3. Digital Coupon Pass & WebRTC QR Scanner Engine

#### 🎫 Official Citizen Digital Coupon Pass (`CouponModal.tsx`)
- **Karnataka Seal & Government Branding**: Styled in accordance with Karnataka state insignia, featuring gold/amber borders and glassmorphism styling.
- **Dual Predictive Timeline**: Shows exact estimated call time, service processing duration, and expected completion time, plus a badge showing **"Saved ~X mins via Dynamic Allocation"**.
- **Cryptographic Anti-Counterfeit Code**: Ephemeral 6-character verification string (e.g., `VF-83921`) to prevent pass forgery.
- **Real QR Code Engine (`RealQRCode.tsx`)**: High-definition client-side canvas and vector SVG rendering of the token pass verification URL with one-tap download.
- **Integrated Actions**: One-click pass printing, PDF download, and WhatsApp/SMS share triggers.

#### 📷 WebRTC Camera QR Scanner (`QRScannerModal.tsx`)
- **Live Camera Stream**: Uses HTML5 WebRTC `navigator.mediaDevices.getUserMedia` with real-time video stream and `jsqr` computer vision decoding.
- **Multi-Mode Input**:
  1. *Live Camera Video Stream*: Automatic scanning with viewfinder guide and auditory confirmation chime upon detection.
  2. *Image Drag-and-Drop / File Upload*: Citizens or staff can upload screenshots or photos of QR passes for instant decoding.
  3. *Manual Token / Phone Lookup*: Fast manual search by token number (e.g., `G-24`) or 10-digit mobile number.
- **Dual Persona Workflows**:
  - **Citizen Mode**: Instantly opens the citizen's Digital Coupon Pass with live queue countdown.
  - **Staff / Admin Mode**: Empowers counter operators to check-in citizens, verify document credentials, advance token state (`Call`, `Mark Served`, `Transfer Counter`), or re-route between counters.

---

### 4. Staff & Admin Operator Console

#### 🔐 Role-Based Access Control (RBAC)
- Secure JWT authentication for operators, office admins, and district administrators.
- Automatic session invalidation and redirection on token expiration (8-hour sliding window).
- Compatible with Laravel Sanctum and Spatie Permissions for enterprise RBAC.

#### 🎛️ Counter Queue Control Center (`/admin/queue`)
Operators possess complete control over the token lifecycle:
- **Call Next Token**: Pulls the highest priority pending token according to the hybrid priority scheduling algorithm.
- **Skip Token**: Marks a citizen absent after multiple calls; places them into a grace re-call buffer.
- **Recall Token**: Re-announces the citizen's number over the public hall display with visual flashing and voice synthesis.
- **Mark Served / Complete**: Records completion timestamp, logs statutory fee collected, and updates daily throughput analytics.
- **Cancel Token**: Void invalid or non-compliant applications with mandatory reason logging.
- **Transfer Token**: Re-routes a citizen's token to a neighboring counter or specialized desk with full state preservation.
- **Dynamic Counter Matrix Panel**: View real-time counter states, re-assign service tags, and trigger dynamic auto-balancing directly from the queue console.

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

### 5. Hall Display Board & Audio Synthesis (`/display/:officeId`)

- **TV / Monitor Fullscreen Layout**: Designed for high-definition 4K and 1080p LED displays installed in center waiting halls.
- **Dual Display Columns**:
  - **Currently Serving**: Displays Token ID, Citizen Name, Service Name, and Assigned Counter Number in ultra-large amber/emerald typography.
  - **Up Next**: Displays the next 5 upcoming tokens so citizens can prepare their documents.
- **Bilingual Voice Synthesis**: Uses browser Web Speech API to vocalize announcements in Kannada and English:
  - *"ಟೋಕನ್ ಸಂಖ್ಯೆ 25, ಕೌಂಟರ್ 2 ಕ್ಕೆ ದಯವಿಟ್ಟು ಬನ್ನಿ."*
  - *"Token number 25, please proceed to Counter number 2."*
- **Flashing Visual Prompts**: CSS keyframe pulse animations highlight recently called tokens for hearing-impaired citizens.

---

### 6. Public Grievance Redressal (`/grievance`)

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

### 7. Karnataka Welfare & Guarantee Schemes Directory (`/schemes`)

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
- Citizens enter their **Age**, **Gender**, **Annual Income**, and **Occupation** to instantly see schemes they qualify for, along with required documents, benefit summaries, and direct Seva Sindhu application links.

---

### 8. Document Requirement Explorer (`/services`)

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

### 9. Kannada First Language Policy & Persistence

In compliance with the **Karnataka Official Language Act** and to maximize digital inclusion for rural citizens across Shivamogga, Nimma Seva defaults strictly to **Kannada (`kn`)**:
- **Default Locale**: Kannada (`kn`) is the initial default locale upon first landing.
- **Preference Persistence**: Any language selection (Kannada, English, or Hindi) is stored in browser `localStorage` (`nimma_seva_lang`) and remembered across visits.
- **Voice & Display Parity**: Hall displays, audio announcements, and digital passes render seamlessly in Kannada typography.

---

## ⚙️ Hybrid Token, Dynamic Allocation & Prediction Engine

### 1. Hybrid Split Range Allocation
To guarantee fair access between digitally literate citizens booking online and rural walk-in citizens without smartphones, Nimma Seva uses an **Intelligent Hybrid Split Range Engine**:

| Segment | Allocated Daily Range | Description | Priority Level |
|---|---|---|---|
| **Walk-in Citizens** | `01 – 10`, `41 – 50` | Reserved exclusively for on-site kiosk attendees | Normal |
| **Online Bookings** | `11 – 40`, `51 – 80` | Web & Mobile PWA reservations | Normal |
| **Vulnerable / Priority** | `81 – 90` | Senior Citizens (60+), PwD, Pregnant Women | **High** |
| **Statutory Emergency** | `91 – 100` | Court hearings, emergency medical relief | **Critical** |

### 2. Dynamic Counter Allocation & Bottleneck Minimizer
When a token is booked, the allocation engine evaluates:
1. Which counters are currently assigned to the requested service.
2. Active queue depth at each counter.
3. Historical processing efficiency of the assigned desk operator.
4. Estimated time saved versus standard single-counter queues:

$$\text{Time Saved (mins)} = \max\left(0, \text{Std Wait Time} - \left(\frac{\text{Queue Depth Ahead}}{\text{Active Service Counters}}\right) \times \text{Avg Service Mins}\right)$$

### 3. Tatkal Completion Probability Algorithm
Calculates the likelihood of token completion before office closure using:

$$\text{Estimated Wait (mins)} = \left(\frac{\text{Queue Depth Ahead}}{\text{Active Counters}}\right) \times \text{Avg Processing Time (mins)}$$

$$\text{Probability Score (\%)} = \max\left(5\%, 100\% - \left(\frac{\text{Estimated Wait}}{\text{Mins Remaining in Workday}} \times 100\right)\right)$$

- **$\ge 80\%$**: High completion confidence (Green badge).
- **$50\% - 79\%$**: Medium confidence; recommend arriving early (Amber badge).
- **$< 50\%$**: High risk of queue rollover; suggest booking for the next morning (Red badge).

---

## 🗄️ Database Schema & Data Models

Nimma Seva supports **PostgreSQL 15**, **MySQL 8.0**, and **SQLite**. Below are the primary entities modeled in both SQLAlchemy (FastAPI) and Eloquent (Laravel):

### Core Entities Overview

```
+---------------------------------------------------------------------------------+
|                                 users                                           |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER / BIGINT   | Primary Key, Auto-increment            |
| full_name         | VARCHAR            | Full Legal Name                        |
| email             | VARCHAR (Unique)   | Optional Contact Email (Indexed)       |
| phone             | VARCHAR (Indexed)  | 10-digit Indian Mobile Number          |
| hashed_password   | VARCHAR (Nullable) | Bcrypt Hash (for Staff/Admin accounts) |
| aadhaar           | VARCHAR            | Masked / 12-digit Aadhaar              |
| age               | INTEGER            | Age in years                           |
| gender            | VARCHAR            | Male / Female / Other                  |
| role              | VARCHAR            | citizen / operator / admin / auditor   |
| created_at        | TIMESTAMP          | UTC Registration Timestamp             |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                                 offices                                         |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER / BIGINT   | Primary Key, Auto-increment            |
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
| id                | INTEGER / BIGINT   | Primary Key, Auto-increment            |
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
| id                | INTEGER / BIGINT   | Primary Key, Auto-increment            |
| token_number      | VARCHAR (Indexed)  | Assigned Token Identifier (e.g. G-24)  |
| verification_code | VARCHAR            | 6-character anti-counterfeit string    |
| citizen_name      | VARCHAR            | Applicant Full Name                    |
| phone             | VARCHAR (Indexed)  | SMS Notification Phone Number          |
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
| counter_number    | INTEGER            | Dynamically allocated counter desk     |
| amount_paid       | FLOAT              | Statutory fee collected                |
| tatkal_prob       | INTEGER            | Completion likelihood (0 - 100%)       |
| time_saved_mins   | INTEGER            | Estimated time saved by load balancer  |
| created_at        | TIMESTAMP          | UTC Creation Timestamp                 |
+-------------------+--------------------+----------------------------------------+

+---------------------------------------------------------------------------------+
|                               queue_states                                      |
+-------------------+--------------------+----------------------------------------+
| id                | INTEGER / BIGINT   | Primary Key, Auto-increment            |
| office_id         | INTEGER (FK, Unique| References offices.id                  |
| current_token     | VARCHAR            | Token presently at counter             |
| next_token        | VARCHAR            | Token on deck                          |
| active_counters   | INTEGER            | Number of physically staffed desks     |
| is_paused         | BOOLEAN            | Queue hold toggle                      |
| counter_matrix    | JSON (Optional)    | Dynamic mapping of counter assignments |
| updated_at        | TIMESTAMP          | Last state transition timestamp        |
+-------------------+--------------------+----------------------------------------+
```

---

## 📡 Complete REST API & WebSocket Documentation

All REST endpoints reside under prefix `/api`. Interactive OpenAPI Swagger documentation for the FastAPI backend is served at `/docs`, and Laravel route definitions reside under `laravel-backend/routes/api.php`.

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/citizen-direct-login` | Instant citizen phone login (no OTP needed; creates session) | No |
| `POST` | `/api/auth/login` | Authenticate staff/admin using email & password; returns JWT Bearer token | No |
| `POST` | `/api/auth/register` | Register citizen or staff user account | No |
| `POST` | `/api/auth/send-email-otp` | Sends a 6-digit verification code via SMTP | No |
| `POST` | `/api/auth/verify-email-otp`| Verifies 6-digit code for citizen verification | No |
| `POST` | `/api/auth/send-otp` | Sends citizen phone SMS OTP | No |
| `POST` | `/api/auth/verify-otp` | Verifies citizen phone SMS OTP | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile and roles | **Yes (Bearer)** |
| `POST` | `/api/auth/logout` | Revoke active access token | **Yes (Bearer)** |

### Dynamic Counter Matrix Endpoints (`/api/counters`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/counters/{office_id}` | Fetch live counter matrix, service congestion metrics & AI recommendations | No |
| `POST` | `/api/counters/{office_id}/allocate` | Manually update a counter's assigned services, operational mode, or status | **Yes (Admin)** |
| `POST` | `/api/counters/{office_id}/auto-balance` | One-click AI auto-balancer that resolves bottlenecks and redistributes queues | **Yes (Admin)** |

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
| `POST` | `/api/bookings` | Create new citizen token reservation (triggers dynamic counter allocation) | No |
| `GET` | `/api/bookings` | List all bookings for a center / date filter | **Yes (Staff)** |
| `GET` | `/api/bookings/token/{token_number}` | Fetch token pass details by token code | No |
| `GET` | `/api/bookings/{id}/pdf` | Stream official ReportLab (or DomPDF) token pass | No |
| `POST` | `/api/bookings/{id}/cancel` | Cancel an active booking pass | No |
| `GET` | `/api/bookings/citizen/phone/{phone}` | Fetch all past/upcoming tokens by phone number | No |
| `POST` | `/api/bookings/{id}/rating` | Submit citizen satisfaction rating (1-5 stars) | No |

### Real-Time Queue Operations (`/api/queue`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/queue/state/{office_id}` | Fetch current queue state (called token, next token, active counters) | No |
| `POST` | `/api/queue/call-next` | Advance queue and announce next citizen | **Yes (Staff)** |
| `POST` | `/api/queue/skip` | Skip absent citizen and push to recall buffer | **Yes (Staff)** |
| `POST` | `/api/queue/recall` | Re-announce current token over display board | **Yes (Staff)** |
| `POST` | `/api/queue/complete` | Mark citizen served and log statutory collection | **Yes (Staff)** |
| `POST` | `/api/queue/pause` | Pause / resume queue execution | **Yes (Staff)** |
| `POST` | `/api/queue/transfer` | Transfer token to a different counter or specialized desk | **Yes (Staff)** |

### Public Grievances Endpoints (`/api/grievances`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/grievances` | Submit a new citizen grievance; returns `ticket_id` (format: `GRV-XXXXXX`) | No |
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
| `GET` | `/api/public/stats` | Public hero counter statistics (total served, active centers) | No |

---

### Laravel 11 Backend API Parity Reference
The Laravel 11 backend under `laravel-backend/` provides 1:1 route compatibility with the FastAPI backend. You can toggle between backends simply by changing your frontend's `VITE_API_URL`:
- FastAPI Backend: `http://localhost:8000/api`
- Laravel Backend: `http://localhost:8080/api`

---

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
  "timestamp": "2026-10-02T15:30:00Z"
}
```

---

## 🔒 Security Architecture & Hardening

1. **Strict Input Sanitization**:
   - Pydantic v2 schemas reject malformed payloads, enforcing exact phone regexes, 12-digit numeric Aadhaar standards, and sanitized text inputs preventing SQL Injection and Cross-Site Scripting (XSS).
2. **In-Memory & Redis Rate Limiting**:
   - Sliding window middleware protects public booking and authentication routes against DDoS and automated credential stuffing attacks.
3. **Enterprise HTTP Security Headers**:
   - `Content-Security-Policy`: Restricts unauthorized script injection.
   - `X-Frame-Options: DENY`: Complete clickjacking mitigation.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
   - `Strict-Transport-Security (HSTS)`: Enforces secure TLS encryption.
4. **Cryptographic Anti-Counterfeit Verification**:
   - Every digital token pass embeds an anti-fraud security code (`verification_code`) generated with cryptographic entropy, verifiable by staff via the WebRTC QR scanner at the counter desk.

---

## ⚙️ Configuration & Environment Variables

### Root / FastAPI Backend Configuration (`backend/.env` & `.env`)
| Variable | Description | Default / Example Value |
|---|---|---|
| `PROJECT_NAME` | Display name of the system | `"Nimma Seva - Shivamogga Smart Seva"` |
| `API_V1_STR` | Prefix for API routes | `"/api"` |
| `SECRET_KEY` | Hex secret for signing JWT tokens | Run `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | JWT hashing algorithm | `"HS256"` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Staff JWT lifetime in minutes | `480` (8 Hours) |
| `DATABASE_URL` | SQLAlchemy Database Connection URI | `sqlite:///./nimmaseva.db` or `postgresql://postgres:secret@localhost:5432/nimmaseva` |
| `SMTP_HOST` | Outbound SMTP server | `"smtp.gmail.com"` |
| `SMTP_PORT` | SMTP communication port | `587` |
| `SMTP_USER` | SMTP authentication username / email | `"your-email@gmail.com"` |
| `SMTP_PASSWORD` | SMTP authentication app password | `"your-app-password"` |
| `SMTP_FROM_NAME` | Outbound sender title | `"Nimma Seva Karnataka"` |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins array | `["http://localhost:5173", "https://your-domain.vercel.app"]` |

### Laravel 11 Backend Configuration (`laravel-backend/.env`)
| Variable | Description | Default / Example Value |
|---|---|---|
| `APP_NAME` | Laravel Application Name | `"NimmaSeva"` |
| `APP_ENV` | Environment mode | `local` / `production` |
| `APP_KEY` | Application encryption key | Auto-generated via `php artisan key:generate` |
| `DB_CONNECTION` | Database engine | `mysql` |
| `DB_HOST` | MySQL database host | `mysql` (Docker) or `127.0.0.1` |
| `DB_PORT` | MySQL database port | `3306` (Internal) / `3307` (External) |
| `DB_DATABASE` | Database name | `nimmaseva` |
| `DB_USERNAME` | Database username | `nimmaseva` |
| `DB_PASSWORD` | Database password | `nimmaseva_secret` |
| `REDIS_HOST` | Redis cache & queue host | `redis` |
| `REDIS_PORT` | Redis port | `6379` (Internal) / `6380` (External) |
| `REVERB_APP_KEY` | WebSocket Reverb Key | Generated key for real-time broadcasts |

### Frontend Configuration (`frontend/.env`)
| Variable | Description | Default / Example Value |
|---|---|---|
| `VITE_API_URL` | Base URL for backend API | `"/api"` (or `http://localhost:8000/api` / `http://localhost:8080/api`) |
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

### B. Production Deployment via Docker Compose (FastAPI Fullstack)

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

### C. Enterprise Deployment via Laravel 11 Backend (PHP 8.3)

To run the enterprise PHP/Laravel stack with MySQL 8, Redis, Nginx, and queue workers:

#### On Windows (PowerShell):
```powershell
cd laravel-backend
.\start-windows.ps1
```

#### On Linux / macOS (Bash):
```bash
cd laravel-backend
chmod +x start.sh
./start.sh
```

#### Manual Docker Steps for Laravel Backend:
```bash
cd laravel-backend
cp .env.example .env
docker compose up -d --build

# Run migrations and seed data
docker compose exec app php artisan key:generate --ansi
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
```

- Laravel API Endpoint: `http://localhost:8080/api`
- Laravel Health Check: `http://localhost:8080/api/health`
- WebSocket Reverb: `ws://localhost:6001`
- MySQL 8.0 External Port: `localhost:3307`
- Redis 7.2 External Port: `localhost:6380`

---

### D. Local Manual Development Setup

#### 1. Backend Setup (FastAPI Python)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
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
FastAPI Swagger documentation will be live at `http://127.0.0.1:8000/docs`.

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

### E. Running Automated Test Suites

The backend includes automated test suites covering dynamic counter allocation, wait-time prediction algorithms, citizen direct authentication, and API endpoints:

```bash
cd backend
pytest tests/test_counters_and_predictions.py -v
```

---

## 📁 Repository Directory Structure

```
Nimmaseva/
├── .npmrc                           # Root npm config (legacy-peer-deps=true)
├── .env.example                     # Sample environment variable template
├── docker-compose.yml               # Production multi-container orchestration (FastAPI + Postgres)
├── package.json                     # Root npm script runner
├── vercel.json                      # Vercel root deployment configuration
├── README.md                        # Master project documentation
│
├── backend/                         # FastAPI Application Core (Python 3.11)
│   ├── Dockerfile                   # Python container build
│   ├── requirements.txt             # Python packages & dependencies
│   ├── tests/                       # Automated Test Suites
│   │   ├── test_counters_and_predictions.py # Counter matrix & prediction unit tests
│   │   └── test_security.py         # Security & token test suite
│   └── app/
│       ├── main.py                  # ASGI FastAPI application entrypoint
│       ├── seed.py                  # Database auto-seed generator
│       ├── api/                     # REST API Route Controllers
│       │   ├── admin.py             # Staff & operator actions, audit trail
│       │   ├── analytics.py         # KPI calculations & CSV exporter
│       │   ├── auth.py              # JWT authentication & direct citizen login
│       │   ├── bookings.py          # Token creation, cancel, and lookup
│       │   ├── counters.py          # Dynamic counter allocation matrix & auto-balancing
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
│       │   ├── counter_allocation_service.py # Dynamic counter matrix & bottleneck balancer
│       │   ├── pdf_service.py       # ReportLab PDF pass generator
│       │   ├── prediction_service.py# AI-inspired Tatkal wait estimator
│       │   ├── qr_service.py        # Base64 QR code encoding service
│       │   ├── queue_service.py     # Hybrid token range allocator
│       │   └── token_service.py     # Anti-counterfeit verification codes
│       └── websockets/
│           └── connection_manager.py# Real-time WebSocket event broadcaster
│
├── laravel-backend/                 # Laravel 11 Backend Alternative (PHP 8.3)
│   ├── Dockerfile                   # Multi-stage PHP 8.3-FPM build
│   ├── docker-compose.yml           # MySQL 8, Redis, Reverb, Nginx, App, Worker
│   ├── composer.json                # Composer PHP packages (Sanctum, DomPDF, etc.)
│   ├── start-windows.ps1            # Windows 1-click startup script
│   ├── start.sh                     # Linux/macOS 1-click startup script
│   ├── app/
│   │   ├── Events/QueueUpdated.php  # WebSocket queue broadcast event
│   │   ├── Http/Controllers/Api/   # API Controllers (Auth, Booking, Counters, etc.)
│   │   ├── Models/                  # Eloquent models (Booking, User, Office, etc.)
│   │   └── Services/                # CounterService, PredictionService, PdfService
│   ├── database/
│   │   ├── migrations/              # Database schema migrations
│   │   └── seeders/DatabaseSeeder.php # Initial data seeder
│   ├── resources/views/pdf/         # Blade templates for printable passes
│   └── routes/api.php               # Complete Laravel REST API routes
│
├── frontend/                        # React 18 TypeScript PWA
│   ├── .npmrc                       # Frontend npm peer dependency config
│   ├── Dockerfile                   # Frontend container build
│   ├── index.html                   # HTML5 template with PWA meta & fonts
│   ├── package.json                 # Frontend dependencies (React, Vite, Leaflet, jsQR)
│   ├── tailwind.config.js           # Government of Karnataka theme palette
│   ├── tsconfig.json                # TypeScript compiler configuration
│   ├── vercel.json                      # Subdirectory Vercel deployment rules
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
│       │   ├── CouponModal.tsx      # Official Citizen Digital Pass voucher modal
│       │   ├── DynamicCounterMatrixControl.tsx # Counter matrix control & auto-balancer
│       │   ├── ErrorBoundary.tsx    # Crash containment & reload fallback
│       │   ├── Footer.tsx           # Official state footer & policy links
│       │   ├── Header.tsx           # Dignitaries bar, theme, language & scan quick buttons
│       │   ├── KarnatakaBadge.tsx   # Official emblem & state crest badge
│       │   ├── PWAInstallBanner.tsx # Native mobile install prompt banner
│       │   ├── QRScannerModal.tsx   # WebRTC live camera scanner & token lookup
│       │   ├── RealQRCode.tsx       # Dynamic Canvas/SVG 2D QR Code generator
│       │   ├── ServerDownModal.tsx  # Portal downtime alert dialog
│       │   └── map/
│       │       └── OfficeMap.tsx    # Interactive Leaflet map with GPS pins
│       ├── context/                 # React Context Providers
│       │   ├── LanguageContext.tsx  # Kannada-first localization with localStorage persistence
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
│       │       ├── QueueManagement.tsx # Counter queue control panel & matrix
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

### 1. Which backend should I use — FastAPI or Laravel 11?
Both backends are fully production-grade and share identical REST API contracts:
- **Choose FastAPI (Python 3.11)**: If you prefer asynchronous ASGI performance, native Python AI/ML integrations, or lightweight ReportLab PDF streaming.
- **Choose Laravel 11 (PHP 8.3)**: If your organization runs standard PHP/MySQL infrastructure, requires Laravel Sanctum RBAC, Redis queue workers, or Blade-templated PDF documents.
The React frontend connects transparently to either backend via `VITE_API_URL`.

### 2. How do I grant camera permissions for the WebRTC QR Scanner?
Modern browsers enforce that camera access (`navigator.mediaDevices.getUserMedia`) is restricted to secure origins (`https://` or `localhost`). If using a remote IP without SSL, use the built-in **"Upload QR Image"** or **"Manual Token Lookup"** tabs inside the QR Scanner modal.

### 3. How does the One-Click AI Dynamic Auto-Balancing work?
When an admin navigates to `/admin/queue` or views the **Dynamic Counter Matrix Control**, the system evaluates the real-time congestion per service. Clicking **"Auto-Balance Matrix"** invokes the backend algorithm, which reallocates idle or under-burdened counters to overloaded queues (e.g., reassigning Counter 3 to assist with Aadhaar Updates) and logs estimated time saved.

### 4. Can the application run if the backend server is offline?
**Yes.** The frontend incorporates a **Resilient Mock Architecture** in [`frontend/src/services/api.ts`](file:///c:/Users/Adithya%20s%20shetty/Nimma%20Seva/Nimmaseva/frontend/src/services/api.ts). If the backend is not connected or network connectivity drops, the app seamlessly defaults to built-in sample data for offices, services, token booking, dynamic counter allocations, and queue management without throwing runtime errors.

### 5. Why is Kannada the default language?
In adherence with the **Government of Karnataka language policy**, Kannada (`kn`) is set as the primary default language across the portal to maximize digital accessibility for all citizens across Shivamogga. Citizens can switch to English or Hindi at any time via the top header bar, and their preference is stored in `localStorage` (`nimma_seva_lang`).

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
