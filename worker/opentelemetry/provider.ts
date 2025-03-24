import { type Tracer, type TracerOptions, type TracerProvider, context, trace } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import type { Resource } from "@opentelemetry/resources";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WorkerTracer } from "./tracer";

/**
 * Register this TracerProvider for use with the OpenTelemetry API.
 * Undefined values may be replaced with defaults, and
 * null values will be skipped.
 *
 * @param config Configuration object for SDK registration
 */
export class WorkerTracerProvider implements TracerProvider {
	private spanProcessors: SpanProcessor[];
	private resource: Resource;
	private tracers: Record<string, Tracer> = {};

	constructor(spanProcessors: SpanProcessor[], resource: Resource) {
		this.spanProcessors = spanProcessors;
		this.resource = resource;
	}

	getTracer(name: string, version?: string, options?: TracerOptions): Tracer {
		const key = `${name}@${version || ""}:${options?.schemaUrl || ""}`;
		if (!this.tracers[key]) {
			this.tracers[key] = new WorkerTracer(this.spanProcessors, this.resource);
		}
		return this.tracers[key]!;
	}

	register(): void {
		trace.setGlobalTracerProvider(this);
		context.setGlobalContextManager(new AsyncLocalStorageContextManager());
	}
}
