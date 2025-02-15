import type { DB } from "@/db";
import * as schema from "@/db/schema";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, multiSession, openAPI, organization } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import type { Context } from "hono";
import type { HonoEnv } from "../../../../worker/app";
import { ac, admin, member, owner } from "../permissions";

function getSessionMetadata(cf?: CfProperties) {
	return {
		city: cf?.city,
		country: cf?.country,
		latitude: cf?.latitude,
		longitude: cf?.longitude,
	};
}

type SessionMetaData = ReturnType<typeof getSessionMetadata>;

export function initServerAuth(db: DB, ctx: Context<HonoEnv>) {
	const options = {
		appName: "cf-dashboard",
		database: drizzleAdapter(db, { provider: "sqlite", schema }),
		secondaryStorage: {
			async set(key, value, expirationTtl) {
				return await ctx.env.KV.put(key, value, { expirationTtl });
			},
			async get(key) {
				return await ctx.env.KV.get(key, "text");
			},
			async delete(key) {
				return await ctx.env.KV.delete(key);
			},
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60, // Cache duration in seconds
			},
		},
		emailAndPassword: {
			enabled: true,
		},

		advanced: {
			ipAddress: {
				ipAddressHeaders: ["cf-connecting-ip"],
			},
		},
		user: {
			additionalFields: {
				firstName: {
					type: "string",
					required: true,
				},
				lastName: {
					type: "string",
					required: true,
				},
			},
		},
		plugins: [passkey(), organization({ ac, roles: { owner, admin, member } }), multiSession(), openAPI()],
	} satisfies BetterAuthOptions;

	return betterAuth({
		...options,
		plugins: [...options.plugins],
	});
}
