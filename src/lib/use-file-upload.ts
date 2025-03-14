import { toMerged } from "es-toolkit";
import React from "react";
import type { Exact, SetNonNullable, SetRequired } from "type-fest";
import { withProgress } from "./file-upload";

declare global {
	interface RequestInit {
		duplex?: "half" | "full";
	}
}

export type UploadProgress = {
	loaded: number;
	total: number;
	percentage: number;
} & ({ status: "error"; error: string } | { status: "idle" | "done" | "pending" });

export type UploadFn = (input: RequestInfo | URL, init: UploadRequestInit) => Promise<void>;

type UploadRequestInit = SetRequired<SetNonNullable<RequestInit, "body">, "body">;

function set<T extends Record<PropertyKey, unknown>, S extends Exact<Partial<T>, S>>(
	state: S,
): React.SetStateAction<T> {
	return (prev: T) => toMerged(prev, state as Partial<T>);
}

export function useUpload(): [state: UploadProgress, upload: UploadFn] {
	const [state, setState] = React.useState<UploadProgress>({
		loaded: 0,
		total: 0,
		percentage: 0,
		status: "idle",
	});

	async function upload(input: RequestInfo | URL, init: UploadRequestInit) {
		setState(set({ status: "pending" }));
		const response = await fetch(input, {
			method: "POST",
			duplex: "half",
			...init,
			body: await withProgress(init.body, (progress) => {
				setState(set(progress));
			}),
		});

		if (response.ok) {
			setState(set({ status: "done" }));
		} else {
			setState(set({ status: "error", error: response.statusText }));
		}
	}

	return [state, upload];
}
