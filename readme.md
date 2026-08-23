# 🌾 AgriLedger Platform Ecosystem (vibezlabs.com)

Welcome to the **AgriLedger Platform**, a high-performance, multi-tenant agricultural enterprise suite engineered under the **VibezLabs** software portfolio. The platform splits features across independent, modular applications that scale individually, support multi-tenant entitlement security gates, and compile into completely standalone applications with unique homescreen launchers and icons.

---

## 🏗️ Architecture Blueprint & Core Components

```text
       [ Physical Smartphone Device ] (Samsung Galaxy S20+)
                     │
         Expo SDK 57 Mobile Frontend
     (Dynamic Variant Compilation Target)
                     │
        ┌────────────┴────────────┐
   [Wi-Fi / Mobile Connection]   [Offline Data Status]
        │                         │
  Live API Requests        Persistent Queue
        │                   (AsyncStorage)
        ▼                         ▼
   Cloudflare Edge Worker   Local Device Memory
   (Hono Routing Engine)    (Syncs on Network Return)
        │
   SQLite Database
   (Cloudflare D1 Production Tables)
```

### Core Architecture Capabilities
* **Dynamic Monorepo Compilation Variant Switching:** Controlled via a custom `app.config.js` environment target variable framework (`APP_VARIANT`). Compiles fully isolated single-purpose apps (`com.vibezlabs.coopmanager`, `com.vibezlabs.cropcycle`, etc.) with dedicated application icon sets and launcher packages out of the same unified codebase folder.
* **Hono.js Edge Worker Engine (Custom Domain Runtime):** Powers the server framework deployed directly live onto your custom cloud domain at `https://vibezlabs.com`.
* **Robust Multi-Tenant Security Interceptor Middleware:** Employs a custom asynchronous request fallback buffer stream parsing system (`verifyModuleAccess`) that extracts `farm_id` checks across URL variables, raw payload bodies, or headers seamlessly to enforce strict feature licensing gates.
* **3-Second Client Abort Timeout Guard & AsyncStorage Cache:** Intercepts hanging threads in low-signal rural barn zones, cutting requests off after 3000ms to block application crashes, appending dropped data sequences down to device memory storage arrays for silent cloud synchronization retry threads.
* **Independent Marketplace App Engine:** A standalone multi-user marketplace allowing direct consumer purchase order operations alongside automated farmer data harvest ingestion adapters.
* **Smart Auto-Fill Field Dictionary Matrix:** Automatically handshakes with your live D1 `crop_encyclopedia` table while you type, delivering an instant absolute-positioned floating lookup menu matching real-world biological companion configurations.

---

## 🚀 Instant Restoration & Launch Commands

When restarting this workspace in your next session, execute these commands inside your separate VS Code terminal panels:

### 🟢 Panel 1: Backend Deployment and Database Operations
```bash
# Navigate to the backend worker subdirectory
cd backend/worker

# Force a clean remote database schema synchronization pass
npx wrangler d1 execute agri-ledger-prod-db --remote --file=src/db/schema.sql

# Seed / Restore active tenant authorizations for testing (Farm 101)
npx wrangler d1 execute agri-ledger-prod-db --remote --command="INSERT OR IGNORE INTO farm_subscriptions (farm_id, module_name, status) VALUES (101, 'coop_manager', 'active'), (101, 'farm_finance', 'active'), (101, 'crop_cycle', 'active'), (101, 'market_sync', 'active'), (101, 'hive_mind', 'active');"

# Restore master agricultural encyclopedia rows inside Cloudflare D1
npx wrangler d1 execute agri-ledger-prod-db --remote --command="INSERT OR IGNORE INTO crop_encyclopedia (name, default_dtm, companion) VALUES ('Tomato', 75, 'Basil, Marigolds, Carrots'), ('Sweet Corn', 85, 'Pole Beans, Squash, Melons'), ('Bell Peppers', 75, 'Basil, Onions, Spinach'), ('Carrots', 70, 'Onions, Rosemary, Radishes'), ('Cucumber', 60, 'Beans, Peas, Marigolds, Radish');"

# Deploy backend updates live to ://vibezlabs.com
npx wrangler deploy
```

### 🔵 Panel 2: Launching and Compiling Mobile Framework Targets
```bash
# Navigate to your mobile frontend directory
cd frontend

# Launch the combined master platform suite (All-in-One Dashboard view)
npm run start:platform

# Launch CoopManager as an isolated, standalone app target
npm run start:coop

# Launch CropCycle as an isolated, standalone app target
npm run start:crops

# Note: Remember to press 's' in the Metro Bundler terminal to target the Expo Go runtime!
```

---

## 🎨 Current Workspace Feature Matrix Status

* **Security & Context Variables:** Explicitly added a structural `Variables` proxy layer mapping to your Hono initialization (`{ Bindings: Env; Variables: Variables }`), allowing you to fetch `c.get('parsedBody')` without throwing compiler validation blocks.
* **CoopManager:** Completed. Interacts with remote D1 tables to query flock targets and logs daily layers metrics.
* **Farm Finance ROI Dashboard:** Completed. Automatically tracks ledger expense operations using safe integer cent conversions to prevent floating-point calculation lags.
* **Market Sync:** Completed. Shifted into a fully featured, independent community marketplace supporting dynamic consumer "Buy 1" order deduction engines and developer-level `as any` type bypass safety hooks.
* **CropCycle:** Completed & Advanced. Dynamically calculates progress bars relative to planting date thresholds using native `Math.floor` limits, handles accordion summaries, safely isolates `keyExtractor` loops with optional chaining layout guards, and populates floating autocomplete options overlay menus.
* **Hive Mind:** Outlined. Next up in active application UI implementation layout cycles.
