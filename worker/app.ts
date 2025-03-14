import { Hono } from "hono";
import { logger } from "hono/logger";
import { type RequestIdVariables, requestId } from "hono/request-id";

import { WorkerEntrypoint, env } from "cloudflare:workers";
import { getLoadContext } from "@/context";
import { reactRouter } from "@worker/middleware/react-router";
import { ConsoleReporter, LogLevel, type Logger, LoggerBuilder } from "./logger";

export interface HonoEnv {
	Bindings: Env;
	Variables: RequestIdVariables;
}

export default class extends WorkerEntrypoint<Env> {
	private app: Hono<HonoEnv>;
	private logger: Logger;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.app = new Hono<HonoEnv>();
		this.logger = new LoggerBuilder(ctx).loglevel(LogLevel.INFO).register(new ConsoleReporter()).build("app");

		this.bootstrap();
	}

	private bootstrap() {
		this.app
			.use(requestId({ headerName: "Cf-Ray" }))
			.use(logger())
			.use(this.logger.middleware())
			.use(async (ctx, next) => {
				const handler = reactRouter({
					build: await import("virtual:react-router/server-build"),
					mode: import.meta.env.PROD ? "production" : "development",
					loadContext: getLoadContext(ctx),
				});

				return await handler(ctx, next);
			});
	}
	override async fetch(request: Request<unknown, CfProperties<unknown>>) {
		using _ = this.logger;

		console.log("fetching", request.url, { importEnv: env, processEnv: process.env, entryEnv: this.env });

		return await this.app.fetch(request, this.env, this.ctx);
	}
}
