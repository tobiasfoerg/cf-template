import type { Route } from "./+types";

export function extractBreadcrumbs(matches: Route.ComponentProps["matches"]) {
	const breadcrumbs = new Map<string, string>();
	for (const match of matches) {
		if (!match) continue;

		if (match.pathname === "/") {
			breadcrumbs.set("/", "Dashboard");
			continue;
		}

		if (
			typeof match.handle === "object" &&
			match.handle !== null &&
			"title" in match.handle &&
			typeof match.handle.title === "string"
		) {
			breadcrumbs.set(match.pathname.replace(/\/$/, ""), match.handle.title);
		}
	}

	return breadcrumbs;
}
