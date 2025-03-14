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
	loadContext: unstable_InitialContext;
}

export const reactRouter = ({ mode, build, loadContext }: ReactRouterMiddlewareOptions) => {
	return createMiddleware(async (c) => {
		const requestHandler = createRequestHandler(await build, mode);

		// @ts-expect-error: requestHandler has wrong types. should be unstable_InitialContext
		return await requestHandler(c.req.raw, loadContext);
	});
};
