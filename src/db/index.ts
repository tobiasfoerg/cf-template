import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function init_db(db: D1Database) {
	return drizzle(db, { schema });
}

export type DB = ReturnType<typeof init_db>;
