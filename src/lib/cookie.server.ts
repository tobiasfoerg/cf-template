import { createCookieSessionStorage } from "react-router";

export type Theme = "light" | "dark" | "system";

export type UserPreferences = {
	theme: Theme;
	locale: Intl.LocalesArgument;
	timezone: Intl.DateTimeFormatOptions["timeZone"];
	sidebar: "expanded" | "collapsed";
};

export const { getSession, commitSession, destroySession } = createCookieSessionStorage<UserPreferences>({
	cookie: {
		name: "user-preferences",
		maxAge: 60 * 60 * 24 * 7,
		sameSite: "lax",
	},
});

export async function getSessionWithDefaults(request: Request, fallback: UserPreferences): Promise<UserPreferences> {
	const session = await getSession(request.headers.get("cookie"));
	return {
		...fallback,
		...session.data,
	};
}
