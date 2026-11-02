Welcome back! I hope the planting went well and the app worked for you in the field. 🌿

Updating the `README.md` is exactly the right move. Right now, your doc talks about "Hono.js" and "React Native" in abstract terms, but it doesn't capture the hard-won knowledge we built today (like the D1 seed data, the offline queue constraints, and the exact build commands).

Here is a complete, production-ready `README.md` that you can copy and paste over your existing one. I've written it as a professional developer hand-off so that if you step away for 6 months, you (or another dev) know exactly how to boot this up.

### 📋 Copy this into `readme.md`

```markdown
# 🌿 Crop-Cycle Manager (VibezLabs)

A standalone, offline-first mobile cultivation tracking ledger and crop variety diagnostics engine built for independent agricultural production in Dominica.

## 🗂️ Workspace Architecture

```text
crop-cycle-manager/
├── frontend/                # Cross-Platform React Native / Expo Mobile App
│   ├── assets/              # Brand graphics (Leaf icon, splash screen)
│   ├── src/
│   │   ├── app/             # Expo Router (screens & routing)
│   │   ├── components/      # Reusable UI elements
│   │   ├── context/         # Global state (SubscriptionContext)
│   │   ├── data/            # Static lookups (Dominica suppliers, companion matrix)
│   │   ├── hooks/           # useFarmSync (sync orchestrators)
│   │   └── services/        # api.ts & offline-queue.ts (network dispatchers)
│   ├── app.config.js        # App metadata, icons, and EAS project ID
│   └── eas.json             # EAS Build profiles (preview-crops, production)
│
└── backend/
    └── worker/              # Hono.js Cloudflare Edge Server
        ├── src/
        │   ├── index.ts     # REST API endpoints (CORS protected)
        │   └── types.ts     # Type definitions
        ├── tsconfig.json    # Worker compiler settings
        └── wrangler.jsonc   # Cloudflare domain & D1 bindings
```

## ⚡ Technical Infrastructure Core

### 1. Offline-First Resilience
- **3-Second Abort Guard:** All mutations (POST, PUT, DELETE) pass through an `AbortController` timeout. If network latency exceeds 3000ms, the transaction safely switches to local hardware storage (`@CropCycle:offline_sync_queue`).
- **Sequential Queue Flushing:** Cached payloads persist in `AsyncStorage` and flush oldest-to-newest when network connectivity is restored.
- **Optimistic UI:** The frontend updates instantly on button press. If the request is queued offline, the UI retains the change and shows a "📦 Offline" status message.

### 2. Local Procurement Lookup Matrix
- Contains embedded static lookups for verified inputs across Dominica (including **Agri Sales & Services Co. Ltd** and **Jaco’s Feeds and Fertilizers**).
- Dynamically cross-references companion planting profiles for regional crops natively without firing airborne traffic queries.

---

## 🛠️ Step-by-Step Developer Operations Guide

### 🟢 Local Sandbox Debugging Pipeline

1. **Boot the Backend Server (Local Worker):**
   ```powershell
   cd backend/worker
   npx wrangler dev --local --port 8787 --ip 0.0.0.0 --config wrangler.jsonc
   ```

2. **Verify Frontend Endpoint Mapping:**
   Open `frontend/src/services/api.ts` and ensure `getBaseUrl()` returns your local IP:
   ```typescript
   const getBaseUrl = (): string => 'http://192.168.100.6:8787'; 
   ```

3. **Boot the Mobile Frontend:**
   ```powershell
   cd frontend
   npm install --legacy-peer-deps
   npm run start
   ```

### 🚀 Production Deployment Pipeline

#### 1. Push Backend Updates to Cloudflare
```powershell
cd backend/worker
npx wrangler types
npx wrangler deploy
```
*Deploys the live Hono runtime to `https://agri.vibezlabs.com`.*

#### 2. Compile a Shareable Android Package (.apk)
```powershell
cd frontend
npx eas-cli build --platform android --profile preview-crops --clear-cache
```
*Outputs a secure download URL and a scannable QR code to install the standalone application natively.*

---

## 🗄️ Cloudflare D1 Database Management

### Live Schema Notes
The production database (`agri_ledger_db`) requires the following tables:
- `farms` (Must contain at least one row for foreign key mapping, e.g., `id: 101, name: 'Test Farm Dominica', user_id: 1`)
- `crop_rows` (Cultivation tracking rows)
- `crop_encyclopedia` (Autocomplete dictionary)

### Adding Crop Varieties to Production
To push new seeds/varieties to the live dropdown, run:
```powershell
npx wrangler d1 execute agri_ledger_db --remote --command="INSERT INTO crop_encyclopedia (name, default_dtm, companion) VALUES ('Cucumber (Poinsett)', 55, 'Beans, Corn, Peas');"
```

### Known Production Quirks
- **Foreign Key Constraints:** Deleting/inserting rows requires the `farm_id` (e.g., `101`) to exist in the `farms` table with a valid `user_id`.
- **Duplicate Columns:** The `transplant_date` column is active. Do not attempt to `ALTER TABLE` it again.

---

## 📱 App Icons & Assets
- **`icon.png`**: App drawer icon (1024x1024)
- **`android-icon-foreground.png`**: Adaptive icon foreground (transparent)
- **`splash-icon.png`**: Loading screen logo
- **`favicon.png`**: Web browser tab logo
```

---