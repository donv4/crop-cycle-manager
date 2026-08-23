CREATE TABLE IF NOT EXISTS farms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL CHECK (module_name IN ('coop_manager', 'crop_cycle', 'hive_mind', 'farm_finance', 'market_sync')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'trial')),
  expires_at DATETIME,
  UNIQUE(farm_id, module_name)
);

CREATE TABLE IF NOT EXISTS chicken_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  status TEXT NOT NULL CHECK (status IN ('growing', 'laying', 'processed'))
);

CREATE TABLE IF NOT EXISTS crop_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  harvest_status TEXT NOT NULL CHECK (harvest_status IN ('planted', 'growing', 'harvesting', 'completed'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  category TEXT NOT NULL, 
  chicken_batch_id INTEGER REFERENCES chicken_batches(id) ON DELETE SET NULL,
  crop_row_id INTEGER REFERENCES crop_rows(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sales_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, 
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit_cents INTEGER NOT NULL CHECK (price_per_unit_cents >= 0),
  total_revenue_cents INTEGER NOT NULL CHECK (total_revenue_cents >= 0),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Pending')),
  sale_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS available_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farm_id, item_type)
);

-- Marketplace Independent Listings (Both manually created or auto-harvested from other apps)
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farm_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    available_stock INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'sold_out', 'suspended'
    source_module TEXT DEFAULT 'independent', -- 'independent', 'crop_cycle', 'coop_manager'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Consumer Interaction Orders Ledger
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    consumer_name TEXT NOT NULL,
    consumer_phone TEXT NOT NULL,
    quantity_purchased INTEGER NOT NULL,
    total_amount_cents INTEGER NOT NULL,
    order_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(listing_id) REFERENCES marketplace_listings(id)
);

CREATE INDEX IF NOT EXISTS idx_chicken_batches_farm ON chicken_batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_expenses_farm_date ON expenses(farm_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_farm_date ON sales_ledger(farm_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_inventory_farm_item ON available_inventory(farm_id, item_type);

CREATE TABLE IF NOT EXISTS market_inventory (
    id INTEGER PRIMARY KEY,
    farm_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    FOREIGN KEY(farm_id) REFERENCES farms(id)
);
