// backend/worker/src/types.ts
import type { Context } from "hono";
import { z } from "zod"; // 🌟 THE FIX: Back to pure, standard Zod with zero custom wrappers!

export interface Env {
  DB: D1Database;
  agri_ledger_db: D1Database;
}

export type AppContext = Context<{ Bindings: Env }>;

// Core task model definition template using standard Zod configurations
export const Task = z.object({
	name: z.string().openapi({ example: "lorem" }),
	slug: z.string(),
	description: z.string().optional(),
	completed: z.boolean().default(false),
	due_date: z.string().date(), // Handled natively under modern Chanfana routing passes
});
