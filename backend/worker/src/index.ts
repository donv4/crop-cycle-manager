// backend/worker/src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// 📡 GLOBAL CROSS-ORIGIN RESOURCE SHARING SECURITY PASS
// Allows your Samsung S20+ mobile device to communicate smoothly with the server over Wi-Fi
app.use("/*", cors({
	origin: "*",
	allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type", "Accept", "X-Farm-Id"],
}));

// 🌿 CROP MODULE ENDPOINT: Fetch all active cultivation rows for a specific farm
app.get("/api/crop/rows", async (c) => {
	const farmId = c.req.query("farm_id") || "101";

	try {
		const { results } = await c.env.agri_ledger_db.prepare(`
			SELECT id, farm_id, crop_type, planting_date, harvest_status, days_to_maturity, companion_crop, soil_notes 
			FROM crop_rows 
			WHERE farm_id = ? 
			ORDER BY planting_date DESC;
		`).bind(parseInt(farmId, 10)).all();

		return c.json({ success: true, data: results || [] });
	} catch (error: any) {
		console.error("[D1 Get Crop Rows Crash]:", error.message);
		return c.json({ success: false, error: "Failed to load cultivation beds." }, 500);
	}
});

// 🌿 CROP MODULE ENDPOINT: Plant and register a brand new crop row row entry
app.post("/api/crop/plant", async (c) => {
	try {
		const body = await c.req.json();
		const { farm_id, crop_type, planting_date, harvest_status, days_to_maturity, companion_crop, soil_notes, transplant_date } = body;

		const result = await c.env.agri_ledger_db.prepare(`
			INSERT INTO crop_rows (farm_id, crop_type, planting_date, harvest_status, days_to_maturity, companion_crop, soil_notes, transplant_date)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?);
		`).bind(
			parseInt(farm_id, 10) || 101,
			crop_type,
			planting_date || new Date().toISOString().split("T")[0],
			harvest_status || "planted",
			parseInt(days_to_maturity, 10) || 75,
			companion_crop || null,
			soil_notes || null,
			transplant_date || null
		).run();

		return c.json({ success: true, message: "Cultivation row successfully synchronized into cloud ledger tables." });
	} catch (error: any) {
		console.error("[D1 Plant Row Error]:", error.message);
		return c.json({ success: false, error: "Failed to record planting event data." }, 500);
	}
});

// 🌿 CROP MODULE ENDPOINT: Modify the active tracking state profile of an existing row
app.post("/api/crop/update-status", async (c) => {
	try {
		const body = await c.req.json();
		const { row_id, harvest_status, farm_id } = body;

		await c.env.agri_ledger_db.prepare(`
			UPDATE crop_rows 
			SET harvest_status = ? 
			WHERE id = ? AND farm_id = ?;
		`).bind(harvest_status, parseInt(row_id, 10), parseInt(farm_id, 10) || 101).run();

		return c.json({ success: true, message: "Row status successfully modified." });
	} catch (error: any) {
		console.error("[D1 Status Update Error]:", error.message);
		return c.json({ success: false, error: "Failed to update row tracking state." }, 500);
	}
});

// 🌿 CROP MODULE ENDPOINT: Completely erase and clear out a cultivation row cell profile
app.post("/api/crop/remove", async (c) => {
	try {
		const body = await c.req.json();
		const { row_id, farm_id } = body;

		await c.env.agri_ledger_db.prepare(`
			DELETE FROM crop_rows 
			WHERE id = ? AND farm_id = ?;
		`).bind(parseInt(row_id, 10), parseInt(farm_id, 10) || 101).run();

		return c.json({ success: true, message: "Row cleared cleanly from main tracking map database indices." });
	} catch (error: any) {
		console.error("[D1 Remove Row Error]:", error.message);
		return c.json({ success: false, error: "Failed to drop crop row entry records." }, 500);
	}
});

// 🌿 CROP MODULE ENDPOINT: Dynamic search dictionary lookup autocomplete panel
app.get("/api/crop/dictionary-lookup", async (c) => {
	const searchName = c.req.query("name") || "";
	if (!searchName.trim()) return c.json({ success: true, data: [] });

	try {
		const { results } = await c.env.agri_ledger_db.prepare(`
			SELECT id, name, default_dtm, companion 
			FROM crop_encyclopedia 
			WHERE name LIKE ? 
			LIMIT 6;
		`).bind(`%${searchName}%`).all();

		return c.json({ success: true, data: results || [] });
	} catch (error: any) {
		console.error("[D1 Encyclopedia Lookup Error]:", error.message);
		return c.json({ success: false, error: "Failed to search crop libraries." }, 500);
	}
});

// GLOBAL HEALTH MONITOR CHECK ROUTE
app.get("/", (c) => c.text("🌿 CropCycle Manager Backend Server Is Natively Active on the Edge."));

export default app;
