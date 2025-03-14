import type { ClientHint } from "@epic-web/client-hints";

export const clientHint = {
	cookieName: "CH-device-width",
	getValueCode: "window.innerWidth",
	fallback: 0,
} as const satisfies ClientHint<number>;

export function subscribeToWidthChange(
	subscriber: (width: number) => void,
	cookieName: string = clientHint.cookieName,
) {
	function handleChange() {
		const value = window.innerWidth;
		document.cookie = `${cookieName}=${value}; Max-Age=31536000; Path=/;`;
		subscriber(value);
	}
	window.addEventListener("resize", handleChange);

	return () => {
		window.removeEventListener("resize", handleChange);
	};
}
