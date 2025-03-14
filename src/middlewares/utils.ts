import type { unstable_MiddlewareFunction } from "react-router";

export function createMiddleware<Result = Response>(handler: unstable_MiddlewareFunction<Result>) {
	return handler;
}
