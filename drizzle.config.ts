import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function getLocalD1() {
	try {
		const basePath = path.resolve(".wrangler");
		const dbFile = fs
			.readdirSync(basePath, { encoding: "utf-8", recursive: true })
			.find((f) => f.endsWith(".sqlite"));

		if (!dbFile) {
			throw new Error(`.sqlite file not found in ${basePath}`);
		}

		const url = path.resolve(basePath, dbFile);
		return url;
	} catch (err) {
		console.log(`Error  ${err}`);
	}
}

const isProd = () => process.env.NODE_ENV === "production";

function getCredentials() {
	const prod = {
		driver: "d1-http",
		dbCredentials: {
			accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID,
			databaseId: "",
			token: process.env.CLOUDFLARE_D1_API_TOKEN,
		},
	};

	const dev = {
		dbCredentials: {
			url: getLocalD1(),
		},
	};
	return isProd() ? prod : dev;
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema/index.ts",
	dialect: "sqlite",
	...getCredentials(),
});
