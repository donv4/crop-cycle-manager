### 🌿 Crop-Cycle Manager

A standalone, specialized, offline-first mobile cultivation tracking ledger and crop variety diagnostics engine built specifically for independent agricultural production. This application is an isolated product within the **VibezLabs** platform ecosystem. 

### 🗂️ Workspace Architecture

The repository is structured to separate the cross-platform mobile frontend from the high-performance edge computing server layers: 

text

C:\Users\donv\Documents\vibezlabs-apps\crop-cycle-manager\
├── frontend/                # Cross-Platform React Native / Expo Mobile App
│   ├── assets/              # Hardened production brand graphics assets
│   ├── src/
│   │   ├── app/             # Expo Stack Navigation routing layout controllers
│   │   ├── context/         # Standalone bypass permission contexts
│   │   ├── hooks/           # Synchronous activity logging orchestrators
│   │   └── services/        # Abort-timeout guarded network dispatchers
│   ├── app.config.js        # Static isolated app metadata and EAS slot maps
│   └── eas.json             # Android preview compilation profile blueprints
│
└── backend/
    └── worker/              # Hono.js Cloudflare Edge Server Root
        ├── src/
        │   ├── index.ts     # CORS protected REST endpoint route map handlers
        │   └── types.ts     # Chanfana-Zod validated strict data structures
        ├── tsconfig.json    # Worker compiler engine type definition links
        └── wrangler.jsonc   # Cloudflare custom routing domain & D1 DB bindings

Use code with caution.

### ⚡ Technical Infrastructure Core

### 1. Offline-First Resilience

* **3-Second Abort Guard:** All mutations (POST, PUT, DELETE) pass through a strict network timeout barrier. If cellular or low-signal Wi-Fi latencies exceed 3000ms, the transaction safely switches to local hardware arrays via @CropCycle:offline_sync_queue.
* **Sequential Queue Flushing:** Cached payloads persist down on device storage and flush oldest-to-newest when network frequencies recover, preventing data synchronization gaps out in the field.

### 2. Local Procurement Lookup Matrix

* Contains embedded static lookups for verified inputs across Dominica (including **Agri Sales & Services Co. Ltd** on Kennedy Avenue and **Jaco’s Feeds and Fertilizers** in Rockaway).
* Dynamically cross-references companion planting profiles for high-rotation regional crops including **Bell Peppers, Tomatoes, Lettuce, Onions, Potatoes, Cabbage, String Beans, Bananas, and Plantains** natively without firing airborne traffic queries.

### 🛠️ Step-by-Step Developer Operations Guide

### 🟢 Local Sandbox Debugging Pipeline

To run the application locally on a home router network bridge linking your PC directly with your mobile test device over a hardware clipboard mirror window: 

1. **Find your Computer's Local IP Address:** 

powershell

ipconfig
# Note down your active IPv4 Address (e.g., 192.168.100.6)

Use code with caution.
2. **Boot the Backend Server Engine via Local Worker Container:** 

powershell

cd backend/worker
npx wrangler dev --local --port 8787 --ip 0.0.0.0 --config wrangler.jsonc

Use code with caution.

*The --ip 0.0.0.0 flag opens your firewall parameters, allowing incoming connections over the local router.*
3. **Verify Frontend Endpoint Mapping (frontend/src/services/api.ts):** 

typescript

const getBaseUrl = (): string => 'http://192.168.100.6:8787';

Use code with caution.
4. **Initialize and Boot the Mobile Frontend Bundle:** 

powershell

cd frontend
npm install --legacy-peer-deps
npm run start

Use code with caution.

*Press s to stream the cleared bundle straight onto your phone display layout.*

### 🚀 Production Deployment Pipeline

### 1. Push Backend Updates to the Cloudflare Edge

Ensure your typescript types are correctly generated before bundling server configurations: 

powershell

cd backend/worker
npx wrangler types
npx wrangler deploy

Use code with caution.

*Deploys the Hono runtime live onto your verified custom domain routing layer at https://agri.vibezlabs.com.* 

### 2. Compile an Independent Shareable Android Installation Package (.apk)

To distribute an installable file to testers and fellow farmers for field evaluation before listing on official play stores: 

powershell

cd frontend
# Ensure app.config.js holds your unique cloud project identifier token
# projectId: "d7b5ad67-9921-4bdc-bd8c-0f99df1d020e"
eas build --platform android --profile preview-crops

Use code with caution.

*Outputs a shortened secure download cloud URL and a scannable QR code to install the standalone application natively.*