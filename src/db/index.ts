import { env } from "cloudflare:workers";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";
import { relations } from "./relations";

export const db = drizzle(env.DB, { schema, relations, casing: "snake_case" });

export type DB = DrizzleD1Database<typeof schema>;
