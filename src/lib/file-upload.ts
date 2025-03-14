const DEFAULT_CHUNK_SIZE = 64 * 1024;

export async function withProgress(
	body: BodyInit,
	onProgress?: (props: { loaded: number; total: number; percentage: number }) => void,
) {
	if (onProgress) {
		const stream = await toReadableStream(body);
		console.log(stream);
		const total = computeBodyLength(body);

		let loaded = 0;

		const chunkTransformStream = new ChunkTransformStream(DEFAULT_CHUNK_SIZE, (bytes) => {
			loaded += bytes;
			onProgress({
				loaded,
				total,
				percentage: (loaded / total) * 100,
			});
		});

		return stream.pipeThrough(chunkTransformStream);
	}

	return body;
}

class ChunkTransformStream extends TransformStream<ArrayBuffer, Uint8Array> {
	constructor(chunkSize: number, onProgress?: (bytes: number) => void) {
		let buffer = new Uint8Array(0);
		super({
			transform(chunk, controller) {
				queueMicrotask(() => {
					const newBuffer = new Uint8Array(buffer.length + chunk.byteLength);
					newBuffer.set(buffer);
					newBuffer.set(new Uint8Array(chunk), buffer.length);
					buffer = newBuffer;

					while (buffer.length >= chunkSize) {
						const newChunk = buffer.slice(0, chunkSize);
						controller.enqueue(newChunk);
						onProgress?.(newChunk.byteLength);
						buffer = buffer.slice(chunkSize);
					}
				});
			},
			flush(controller) {
				queueMicrotask(() => {
					if (buffer.length > 0) {
						controller.enqueue(buffer);
						onProgress?.(buffer.byteLength);
					}
				});
			},
		});
	}
}

async function toReadableStream(value: BodyInit): Promise<ReadableStream<ArrayBuffer | Uint8Array>> {
	if (value instanceof ReadableStream) {
		return value as ReadableStream<ArrayBuffer>;
	}

	if (value instanceof Blob) {
		return value.stream();
	}

	let streamValue: Uint8Array;

	if (value instanceof Uint8Array) {
		streamValue = value;
	} else if (value instanceof ArrayBuffer) {
		streamValue = new Uint8Array(value);
	} else {
		streamValue = stringToUint8Array(value as string);
	}

	return new Blob([streamValue]).stream();
}

function computeBodyLength(body: BodyInit): number {
	if (!body) {
		return 0;
	}

	if (typeof body === "string") {
		return new TextEncoder().encode(body).byteLength;
	}

	if ("byteLength" in body && typeof body.byteLength === "number") {
		// handles Uint8Array, ArrayBuffer, Buffer, and ArrayBufferView
		return body.byteLength;
	}

	if ("size" in body && typeof body.size === "number") {
		// handles Blob and File
		return body.size;
	}

	return 0;
}

function stringToUint8Array(s: string): Uint8Array {
	const enc = new TextEncoder();
	return enc.encode(s);
}
