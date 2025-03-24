import type { WorkerEntrypoint } from "cloudflare:workers";
import {
	type Exception,
	SpanKind,
	type SpanOptions,
	SpanStatusCode,
	context,
	propagation,
	trace,
} from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { resourceFromAttributes } from "@opentelemetry/resources";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

import type { InstrumentationConfig } from "./config.ts";
import { WorkerTracerProvider } from "./provider.ts";
import { unwrap, wrap } from "./wrap.ts";

type WorkerEntrypointConstructor<Env> = { new (ctx: ExecutionContext, env: Env): WorkerEntrypoint<Env> };
type FetchFn = NonNullable<WorkerEntrypoint["fetch"]>;

export function Instrument(config: InstrumentationConfig) {
	const resource = resourceFromAttributes({});
	propagation.setGlobalPropagator(new W3CTraceContextPropagator());
	const provider = new WorkerTracerProvider([], resource);

	provider.register();

	return function classDecorator<T extends WorkerEntrypointConstructor<Env>>(entrypoint: T): T {
		const classHandler: ProxyHandler<T> = {
			construct(target, [ctx, env]: ConstructorParameters<T>) {
				const createInstance = () => {
					return new target(ctx, env);
				};

				const entrypoint = context.with(context.active(), createInstance);

				return instrumentEntrypoint(entrypoint, config);
			},
		};
		return wrap(entrypoint, classHandler);
	};
}

function instrumentEntrypoint(entrypoint: WorkerEntrypoint, config: InstrumentationConfig): WorkerEntrypoint {
	const handler: ProxyHandler<WorkerEntrypoint> = {
		get(target, prop) {
			if (prop === "fetch" && config.instrumentation?.fetch) {
				const originalFetch = Reflect.get(target, prop);

				if (typeof originalFetch !== "function") {
					return originalFetch;
				}

				return instrumentFetchFn(originalFetch);
			}
			return Reflect.get(target, prop);
		},
	};

	return wrap(entrypoint, handler);
}

function instrumentFetchFn(fetchFn: FetchFn): FetchFn {
	const fetchHandler: ProxyHandler<FetchFn> = {
		async apply(target, thisArg, argArray: Parameters<FetchFn>) {
			const request = argArray[0];
			try {
				const bound = target.bind(unwrap(thisArg));
				return await context.with(context.active(), executeFetch, undefined, bound, request);
			} finally {
				exportSpans();
			}
		},
	};

	return wrap(fetchFn, fetchHandler);
}

function executeFetch(fetchFn: FetchFn, request: Request): Promise<Response> {
	const tracer = trace.getTracer("fetchHandler");
	const method = request.method;
	const options: SpanOptions = {
		kind: SpanKind.SERVER,
	};
	return tracer.startActiveSpan(`fetchHandler ${method}`, options, context.active(), async (span) => {
		const readable = span as unknown as ReadableSpan;
		try {
			const response = await fetchFn(request);
			span.setAttributes(gatherResponseAttributes(response));

			return response;
		} catch (error) {
			span.recordException(error as Exception);
			span.setStatus({ code: SpanStatusCode.ERROR });
			throw error;
		} finally {
			if (readable.attributes["http.route"]) {
				span.updateName(`fetchHandler ${method} ${readable.attributes["http.route"]}`);
			}
			span.end();
		}
	});
}
function gatherResponseAttributes(response: Response): import("@opentelemetry/api").Attributes {
	throw new Error("Function not implemented.");
}

function exportSpans() {
	throw new Error("Function not implemented.");
}
