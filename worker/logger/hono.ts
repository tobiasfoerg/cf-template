import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

import { LogLevel, type Logger } from ".";

export type LoggerVariables = {
	logger: Logger;
};

export function loggerMiddleware(logger: Logger): MiddlewareHandler {
	return createMiddleware<{ Variables: LoggerVariables }>(async (ctx, next) => {
		ctx.set("logger", logger);

		const url = new URL(ctx.req.url);
		const start = Date.now();

		logger.log({
			level: LogLevel.INF,
			timestamp: Date.now(),
			message: `REQ: ${ctx.req.method} ${url.pathname}`,
		});

		await next();

		logger.log({
			level: LogLevel.INF,
			timestamp: Date.now(),
			message: `RES: ${ctx.req.method} ${url.pathname} ${ctx.res.status} ${Date.now() - start}ms`,
		});
	});
}
