import type { ClientHint } from "@epic-web/client-hints";

export const clientHint = {
	cookieName: "CH-locale",
	getValueCode: "Intl.DateTimeFormat().resolvedOptions().locale",
	fallback: "en",
} as const satisfies ClientHint<string>;
