export function parseCookieHeader(cookie: string | null) {
	if (!cookie) return {};
	return cookie.split(";").reduce(
		(acc, cookie) => {
			const [key, value] = cookie.split("=");
			acc[key.trim()] = value;
			return acc;
		},
		{} as Record<string, string>,
	);
}
