import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { type ServerBuild, createRequestHandler, type unstable_InitialContext } from "react-router";

declare module "react-router" {
	interface Future {
		unstable_middleware: true;
	}
}

interface ReactRouterMiddlewareOptions {
	build: ServerBuild | Promise<ServerBuild>;
	mode?: "development" | "production";
	loadContext?: unstable_InitialContext | ((ctx: Context) => unstable_InitialContext);
}

export function reactRouter({ mode, build, loadContext }: ReactRouterMiddlewareOptions): MiddlewareHandler {
	return createMiddleware(async (c) => {
		const requestHandler = createRequestHandler(await build, mode);

		const context = typeof loadContext === "function" ? loadContext(c) : loadContext;
		return await requestHandler(c.req.raw, context);
	});
}
