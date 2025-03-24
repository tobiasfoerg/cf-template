import { SpanKind, type SpanOptions, context, trace } from "@opentelemetry/api";
import type { LoaderFunction, LoaderFunctionArgs, ServerBuild, unstable_MiddlewareFunction } from "react-router";
import { unwrap, wrap } from "../wrap";

function prepareServerBuild(serverBuild: ServerBuild): ServerBuild {
	const build = { ...serverBuild };
	// NOTE: augment the route.modules to be able to instrument the loaders and actions,
	// because the getter is not configurable and not writable
	for (const routeId in build.routes) {
		if (build.routes[routeId]?.module) {
			build.routes[routeId].module = { ...build.routes[routeId].module };
		}
	}
	return build;
}

export function instrumentServerBuild(serverBuild: ServerBuild, config: { loader?: boolean } = {}) {
	const preparedBuild = prepareServerBuild(serverBuild);
	const proxyHandler: ProxyHandler<ServerBuild> = {
		get(target, prop) {
			if (prop === "routes") {
				const routes = Reflect.get(target, prop);
				return instrumentServerRouteManifest(routes);
			}

			return Reflect.get(target, prop);
		},
	};

	return wrap(preparedBuild, proxyHandler);
}

type ServerRouteManifest = NonNullable<ServerBuild["routes"]>;

function instrumentServerRouteManifest(routes: ServerRouteManifest) {
	const proxyHandler: ProxyHandler<ServerRouteManifest> = {
		get(target, prop) {
			const route = Reflect.get(target, prop);
			if (typeof route === "object" && route !== null) {
				return instrumentServerRoute(route);
			}
		},
	};

	return wrap(routes, proxyHandler);
}

type ServerRoute = NonNullable<ServerRouteManifest[string]>;

function instrumentServerRoute(route: ServerRoute) {
	const proxyHandler: ProxyHandler<ServerRoute> = {
		get(target, prop) {
			if (prop === "module") {
				// NOTE: This is a workaround for the fact that the modules getter are not configurable/ writable
				const module = Reflect.get(target, prop);

				return instrumentRouteModule(module, route);
			}
			return Reflect.get(target, prop);
		},
	};

	return wrap(route, proxyHandler);
}

type ServerRouteModule = ServerRoute["module"];

function instrumentRouteModule(module: ServerRouteModule, route: ServerRoute) {
	const proxyHandler: ProxyHandler<ServerRouteModule> = {
		get(target, prop) {
			if ((prop === "loader" || prop === "action") && typeof target[prop] === "function") {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				const originalLoader = Reflect.get(target, prop)!;

				return instrumentLoaderOrAction(originalLoader, prop, route);
			}

			if (prop === "unstable_middleware" && typeof target[prop] === "function") {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				const middlewares = Reflect.get(target, prop)!;

				return middlewares.map((middleware) => instrumentMiddleware(middleware, route));
			}

			return Reflect.get(target, prop);
		},
	};
	return wrap(module, proxyHandler);
}

function instrumentLoaderOrAction(fn: LoaderFunction, kind: "loader" | "action", route: ServerRoute) {
	const handler: ProxyHandler<LoaderFunction> = {
		async apply(target, thisArg, argArray: Parameters<LoaderFunction>) {
			const args = argArray[0] as LoaderFunctionArgs;
			const tracer = trace.getTracer("react-router");

			const span = tracer.startSpan(`${kind} ${route.path}`, {
				attributes: {
					"http.method": args.request.method,
					"http.url": args.request.url,
					"http.route": route.path,
				},
			});

			try {
				const bound = target.bind(unwrap(thisArg));
				return await context.with(context.active(), executeLoader, undefined, bound, args);
			} finally {
				//exportSpans();
			}
		},
	};

	return wrap(fn, handler);
}

function executeLoader(fn: LoaderFunction, args: LoaderFunctionArgs) {
	const tracer = trace.getTracer("react-router");
	const method = args.request.method;
	const options: SpanOptions = {
		kind: SpanKind.SERVER,
	};
	return tracer.startActiveSpan(`react-router ${method}`, options, context.active(), async (span) => {
		try {
			const response = await fn(args);

			return response;
		} catch (error) {
			console.error("Error in loader", error);
			throw error;
		} finally {
			span.end();
		}
	});
}

type MiddlewareFn = unstable_MiddlewareFunction<Response>;

function instrumentMiddleware(middlewareFn: MiddlewareFn, route: ServerRoute) {
	const handler: ProxyHandler<MiddlewareFn> = {
		async apply(target, thisArg, argArray: Parameters<MiddlewareFn>) {
			const result = await Reflect.apply<MiddlewareFn, Parameters<MiddlewareFn>, ReturnType<MiddlewareFn>>(
				target,
				thisArg,
				argArray,
			);

			return result;
		},
	};

	return wrap(middlewareFn, handler);
}
