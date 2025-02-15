import { Hono } from "hono";
import { type LanguageVariables, languageDetector } from "hono/language";
import { logger } from "hono/logger";
import { type RequestIdVariables, requestId } from "hono/request-id";

import { AUTH_CONTEXT, type Context, DB_CONTEXT, provide } from "@/context/index.js";
import { init_db } from "@/db/index.js";
import { initServerAuth } from "@/lib/auth/.server/index.js";
import { reactRouter } from "./middleware/react-router.js";

const server_build = import.meta.hot
	? // @ts-ignore - In the dev server this is the server-build generated by react-router
		import("virtual:react-router/server-build").catch()
	: // @ts-ignore - This file won’t exist if it hasn’t yet been built
		import("./dist/server/index.js").catch();

export interface HonoEnv {
	Bindings: Env;
	Variables: LanguageVariables & RequestIdVariables;
}

const app = new Hono<HonoEnv>();

app.use(requestId({ headerName: "Cf-Ray" }));
app.use(logger());
app.use(
	languageDetector({
		supportedLanguages: ["en", "de"],
		fallbackLanguage: "en",
	}),
);

app.use(async (ctx, next) => {
	const handler = reactRouter({
		build: server_build,
		mode: import.meta.env.PROD ? "production" : "development",
		loadContext: {
			locale: ctx.get("language"),
			timezone: (ctx.req.raw.cf?.timezone ?? "UTC") as string,
			cf: ctx.req.raw.cf,
		},
	});
	const db = init_db(ctx.env.DB);
	const server_auth = initServerAuth(db, ctx);

	return await provide(
		new Map<Context<unknown>, unknown>([
			[AUTH_CONTEXT, server_auth],
			[DB_CONTEXT, db],
		]),
		async () => await handler(ctx, next),
	);
});

export default app;
