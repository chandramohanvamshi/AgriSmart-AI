# 🌱 AgriSmart AI: Agricultural Crop Advisory & Decision Support System

An end-to-end, production-grade, multi-tenant-ready AI-powered agricultural advisory platform. Built with **React 18**, **Tailwind CSS**, **Node.js Express**, **Drizzle ORM / PostgreSQL**, and the official **@google/genai SDK** utilizing **Gemini 2.5 Pro / Flash**.

---

## 🚀 Key Features

1. **Interactive Crop Advisory Profile Wizard (`/advisory/new`)**:
   - 4-step wizard calibrating field coordinates, soil type (Clay, Loam, Sandy, Silt, Peat, Chalk, Saline), soil pH, and NPK lab test values (PPM).
   - Budget tier alignment: *Low (Resource-Constrained)*, *Moderate (Standard Inputs)*, and *High (Commercial High-Yield)*.
   - Enforces deterministic JSON outputs using `@google/genai` response schemas.

2. **Crop Recommendation & Suitability Index (`/advisory/:id`)**:
   - **Custom Radial Suitability Gauge (0-100%)** visualizing agro-climatic and soil-nutrient fit.
   - **Precision Fertilizer & Nutrition Timeline** showing basal, vegetative, flowering, and maturity stage dosage and incorporation methods.
   - **Irrigation & Water Conservation Protocol** with AWD (Alternate Wetting and Drying) and drip fertigation routines.
   - **Pest, Pathogen & Climate Risk Matrix** with severity-coded risk badges (*Low, Medium, High, Critical*).
   - **Financial Projections & Yield Forecasts** estimating input costs, quintal yield ranges, and gross margins.
   - **Export Suite**: Printable layout, PDF summary trigger, and shareable link generator for field extension officers.

3. **Multimodal Pest & Disease Diagnostic Hub (`/diagnostics`)**:
   - High-resolution leaf photo upload with client-side canvas compression and camera support.
   - Built-in clinical plant pathology sample library (*Tomato Early Blight, Corn Rust, Citrus Canker*) for instant demonstration.
   - Immediate diagnosis via Gemini Multimodal Vision returning clinical symptoms, first-aid measures, organic/biological controls, and chemical interventions with exact dosages.

4. **Advisory Archive & Comparative Analytics (`/history`)**:
   - Filterable, searchable archive of past advisories linked to registered farm fields.
   - Side-by-side **Multi-Crop Comparison Engine** comparing suitability, estimated cost, and projected revenue for up to 3 crops simultaneously.

5. **Localized Multi-Lingual Architecture**:
   - Seamless language switcher in Navbar supporting:
     - 🌐 **English**
     - 🇮🇳 **Hindi (हिन्दी)**
     - 🌾 **Telugu (తెలుగు)**
     - 🌱 **Tamil (தமிழ்)**
     - 🇪🇸 **Spanish (Español)**
     - 🇫🇷 **French (Français)**

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, TanStack Query v5, Wouter.
- **Backend**: Node.js v20+, Express.js, TypeScript runtime (tsx), Multer.
- **Database**: PostgreSQL / Neon Serverless with Drizzle ORM, with built-in in-memory fallback store for offline exploration.
- **AI Engine**: `@google/genai` SDK using Gemini models for reasoning and multimodal computer vision.
- **Validation**: Shared Zod schemas ensuring strict type-safety across client and server.

---

## 📂 Project Structure

```
agrismart-ai/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Navigation, language switcher & status
│   │   │   ├── AdvisoryWizard.tsx     # 4-step interactive advisory wizard
│   │   │   ├── SuitabilityGauge.tsx   # Animated radial SVG suitability gauge
│   │   │   ├── FertilizerTimeline.tsx # Nutrition schedule milestone timeline
│   │   │   ├── ImageUploader.tsx      # Canvas-compressed camera/drag & drop
│   │   │   ├── FarmProfileCard.tsx    # Field card widget with parameters
│   │   │   ├── RiskBadge.tsx          # Severity-coded chip component
│   │   │   ├── ExportPDFButton.tsx    # PDF generation & shareable link
│   │   │   └── SeasonalAlertBanner.tsx# Agro-climatic warning banner
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Metrics, recent advisories & field list
│   │   │   ├── AdvisoryNew.tsx        # Wizard route
│   │   │   ├── AdvisoryDetail.tsx     # Comprehensive advisory report view
│   │   │   ├── Diagnostics.tsx        # Multimodal plant scanner
│   │   │   ├── History.tsx            # Archive & multi-crop comparison
│   │   │   └── Settings.tsx           # Model status, unit standards, languages
│   │   ├── lib/
│   │   │   ├── i18n.tsx               # 6-language translation provider
│   │   │   ├── queryClient.ts         # TanStack Query & API fetcher
│   │   │   └── utils.ts               # Severity colors & formatting
│   │   ├── App.tsx                    # Route definitions & layout
│   │   └── main.tsx                   # React DOM entrypoint
│   └── index.html                     # HTML5 shell with Google Fonts
├── server/
│   ├── lib/
│   │   ├── db.ts                      # PostgreSQL pool & Drizzle ORM setup
│   │   └── gemini.ts                  # @google/genai SDK & agronomic reasoning
│   ├── routes.ts                      # Express API routes
│   ├── storage.ts                     # Storage interface with demo seed data
│   └── index.ts                       # Server runner with Vite middleware
├── shared/
│   └── schema.ts                      # Drizzle tables & Zod validation schemas
├── drizzle.config.ts
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/agrismart_db
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_GEMINI_API_KEY_HERE
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📜 Database Schema (PostgreSQL DDL)

The application adheres to the production SQL specification:
- `users`: User profiles with preferred language settings.
- `farm_profiles`: Field land parcels with soil classification, pH, and irrigation.
- `advisory_requests`: Seasonal requests with NPK PPM soil metrics and budget tiers.
- `advisory_outputs`: Persisted deterministic AI advisory outputs (schedules, risks, financials).
- `diagnostic_records`: Multimodal pathology scans with pathogen detections and treatment plans.
