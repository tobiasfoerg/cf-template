import type { WorkerEntrypoint } from "cloudflare:workers";

type FetchMethodDecorator = (
	target: WorkerEntrypoint,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<WorkerEntrypoint["fetch"]>,
) => void;

class Tracer {
	public isTracingEnabled(): boolean {
		return true;
	}
	public captureFetch(): FetchMethodDecorator {
		return (_target, _propertyKey, descriptor) => {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const originalMethod = descriptor.value!;
			const tracerRef = this;

			descriptor.value = function (this: WorkerEntrypoint, request) {
				if (!tracerRef.isTracingEnabled()) {
					return originalMethod.apply(this, [request]);
				}

				let result: Response | Promise<Response>;

				try {
					result = originalMethod.apply(this, [request]);
				} catch (issue) {
					// biome-ignore lint/complexity/noUselessCatch: <explanation>
					throw issue;
				} finally {
				}

				return result;
			};

			return descriptor;
		};
	}
}
