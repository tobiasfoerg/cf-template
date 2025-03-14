import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";
import { withProgress } from "./file-upload";

import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { useFileUpload } from "./use-file-upload";

const handlers = [
	http.post("http://localhost/upload", async ({ request }) => {
		const data = await request.formData();
		const file = data.get("file");

		if (!file) {
			return new HttpResponse("Missing document", { status: 400 });
		}

		if (!(file instanceof File)) {
			return new HttpResponse("Uploaded document is not a File", {
				status: 400,
			});
		}

		return HttpResponse.json({
			contents: await file.text(),
		});
	}),
];

const server = setupWorker(...handlers);

beforeAll(() => server.start({ onUnhandledRequest: "error" }));

afterAll(() => server.stop());

afterEach(() => server.resetHandlers());

describe("File Upload", () => {
	it("should upload a file", async () => {
		const mockFn = vi.fn();

		const body = await withProgress(new Uint8Array(1024 * 1024), (progress) => {
			console.log(progress);
			mockFn(progress);
		});

		const result = await fetch("http://localhost/upload", {
			method: "POST",
			body,
			duplex: "half",
		});

		expect(result.ok).toBe(true);
	});

	it("useFileUpload", async () => {
		const { result } = renderHook(() => useFileUpload("http://localhost/upload"));

		await result.current.upload([
			new File([new Uint8Array(1024 * 1024)], "hello.txt"),
			new File([new Uint8Array(1024 * 1024)], "hello1.txt"),
			new File([new Uint8Array(1024 * 1024)], "hello2.txt"),
		]);

		console.log(result.current.progress[0]);
		expect(result.current.progress[0].status).toBe("done");
	});
});
