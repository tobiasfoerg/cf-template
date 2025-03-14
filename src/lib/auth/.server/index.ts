import { env } from "cloudflare:workers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { type BetterAuthOptions, type SecondaryStorage, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, organization } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { SESSION_FRESH_AGE } from "../constants";
import { ac, admin, member, owner } from "../permissions";

class KVSessionStorage implements SecondaryStorage {
	private readonly KV: KVNamespace<string>;
	constructor(KV: KVNamespace) {
		this.KV = KV;
	}
	async get(key: string): Promise<string | null> {
		return await this.KV.get(key, "text");
	}
	async set(key: string, value: string, ttl?: number): Promise<void> {
		return await this.KV.put(key, value, { expirationTtl: ttl });
	}
	async delete(key: string): Promise<void> {
		return await this.KV.delete(key);
	}
}

const options = {
	appName: "cf-dashboard",
	database: drizzleAdapter(db, { provider: "sqlite", schema }),
	secondaryStorage: new KVSessionStorage(env.KV),
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
		freshAge: SESSION_FRESH_AGE, // Freshness duration in seconds
	},
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
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
	plugins: [passkey(), apiKey(), organization({ ac, roles: { owner, admin, member } })],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
	...options,
	plugins: [...options.plugins],
});
