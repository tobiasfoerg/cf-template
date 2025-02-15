import type { IconName } from "@/components/icon/icons/types";
import { type Location, type To, href, resolvePath } from "react-router";
import type { SimplifyDeep } from "type-fest";

export type NavigationNode = SimplifyDeep<{
	title: string;
	end?: true;
	icon: IconName;
	to: To;
	section: string;
	keywords: Array<string>;
}>;

export type Section = {
	title: string;
	children: Array<NavigationNode>;
};

export function isActive<T extends Pick<NavigationNode, "to" | "end">>(
	location: Location,
	node: T,
): T & { isActive: boolean } {
	const { pathname: toPathname } = resolvePath(node.to);
	const { pathname: currentPathname } = location;

	const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
	const isActive =
		currentPathname === toPathname ||
		(!node.end && currentPathname.startsWith(toPathname) && currentPathname.charAt(endSlashPosition) === "/");

	return { ...node, isActive };
}

export const NAV_ITEMS = [
	{
		title: "Home",
		icon: "layout-dashboard",
		to: href("/"),
		end: true,
		section: "Dashboard",
		keywords: ["home", "dashboard"],
	},
	{
		title: "Profile",
		icon: "user",
		to: href("/settings/profile"),
		end: true,
		section: "Settings",
		keywords: ["account", "settings", "profile", "user"],
	},
	{
		title: "Security",
		icon: "shield-alert",
		to: href("/settings/security"),
		end: true,
		section: "Settings",
		keywords: ["security", "settings", "password", "passkey"],
	},
] as const satisfies Array<NavigationNode>;

export const PROFILE_MENU: Array<NavigationNode> = [
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	NAV_ITEMS.find((item) => item.title === "Profile")!,
];

type Grouped<T> = {
	[key: string]: T[];
};

export function groupBy<T, K extends keyof T>(array: T[], key: K): Grouped<T> {
	return array.reduce((result: Grouped<T>, currentValue: T) => {
		const groupKey = currentValue[key] as unknown as string; // Ensure key is a string
		if (!result[groupKey]) {
			result[groupKey] = [];
		}
		result[groupKey].push(currentValue);
		return result;
	}, {});
}

export function toFilterString(node: NavigationNode) {
	return `${node.title} ${node.section} ${node.keywords.join(" ")}`;
}
