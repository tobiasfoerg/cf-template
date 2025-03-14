import { integer } from "drizzle-orm/sqlite-core";

export const timestamps = {
	createdAt: integer({ mode: "timestamp" })
		.$default(() => new Date())
		.notNull(),
	updatedAt: integer({ mode: "timestamp" })
		.$default(() => new Date())
		.$onUpdate(() => new Date())
		.notNull(),
	deletedAt: integer({ mode: "timestamp" }),
};
