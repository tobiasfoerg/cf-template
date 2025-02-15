import { createMiddleware } from "hono/factory";
import { type AppLoadContext, type ServerBuild, createRequestHandler } from "react-router";

interface ReactRouterMiddlewareOptions {
	build: ServerBuild | Promise<ServerBuild>;
	mode?: "development" | "production";
	loadContext: AppLoadContext;
}

export const reactRouter = ({ mode, build, loadContext }: ReactRouterMiddlewareOptions) => {
	return createMiddleware(async (c) => {
		const requestHandler = createRequestHandler(await build, mode);

		return await requestHandler(c.req.raw, loadContext);
	});
};
