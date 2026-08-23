-- backend/worker/src/db/seed.sql

-- 1. Insert two test farms
INSERT INTO farms (id, name, user_id) VALUES (101, 'Vidal Premium Poultry', 1);
INSERT INTO farms (id, name, user_id) VALUES (202, 'Free Tier Test Plot', 2);

-- 2. Grant 'coop_manager' subscription access ONLY to Farm 101
INSERT INTO farm_subscriptions (farm_id, module_name, status) VALUES (101, 'coop_manager', 'active');

-- 3. Add some dummy chicken batch data for Farm 101 to read
INSERT INTO chicken_batches (farm_id, start_date, count, status) VALUES (101, '2026-08-01', 150, 'laying');
