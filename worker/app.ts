import { WorkerEntrypoint, env } from "cloudflare:workers";
import { Hono } from "hono";
import { type RequestIdVariables, requestId } from "hono/request-id";

import { getLoadContext } from "@/context";
import { reactRouter } from "@worker/middleware/react-router";
import { ConsoleReporter, type Logger, LoggerBuilder } from "./logger";
import { type LoggerVariables, loggerMiddleware } from "./logger/hono";
import type { InstrumentationConfig } from "./opentelemetry/config";
import { Instrument } from "./opentelemetry/instrumentation";
import { instrumentServerBuild } from "./opentelemetry/instrumentations/react-router";

import * as serverBuild from "virtual:react-router/server-build";

export interface HonoEnv {
	Bindings: Env;
	Variables: RequestIdVariables & LoggerVariables;
}

const APP_NAME = "cf-dashboard";

const config: InstrumentationConfig = {
	service: {
		name: APP_NAME,
		version: env.CF_VERSION_METADATA.id,
		namespace: "cf-dashboard",
	},
	endpoint: process.env.OPENTELEMETRY_ENDPOINT,
};

@Instrument(config)
export default class Handler extends WorkerEntrypoint<Env> {
	private app: Hono<HonoEnv>;
	private logger: Logger;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.app = new Hono<HonoEnv>();
		this.logger = new LoggerBuilder(ctx)
			.loglevel(process.env.LOG_LEVEL)
			.register(new ConsoleReporter())
			.build(APP_NAME);

		this.bootstrap();
	}

	private bootstrap() {
		this.app
			.use(requestId({ headerName: "Cf-Ray" }))
			.use(loggerMiddleware(this.logger))
			.use(
				reactRouter({
					build: instrumentServerBuild(serverBuild),
					mode: import.meta.env.PROD ? "production" : "development",
					loadContext: (ctx) => getLoadContext(ctx),
				}),
			);
	}
	override async fetch(request: Request<unknown, CfProperties<unknown>>) {
		using _ = this.logger;

		return await this.app.fetch(request, this.env, this.ctx);
	}
}
