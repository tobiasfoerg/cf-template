import { Icon, IconRaw } from "@/components/icon";
import {
	Breadcrumbs,
	Link,
	Separator,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarItem,
	SidebarLabel,
	SidebarNav,
	SidebarProvider,
	SidebarSection,
	SidebarSectionGroup,
	SidebarTrigger,
} from "@/components/ui";
import { AUTH_CONTEXT, pull } from "@/context";
import { NAV_ITEMS, type NavigationNode, groupBy, isActive } from "@/lib/navigation";
import { Outlet, href, redirect, useLocation } from "react-router";
import type { Route } from "./+types";
import { CommandPalette } from "./command-palette";
import { ProfileMenu } from "./profile-menu";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await pull(AUTH_CONTEXT).api.getSession({
		headers: request.headers,
	});

	if (!session) {
		throw redirect("/login");
	}

	return {
		user: session.user,
	};
}

function extractBreadcrumbs(matches: Route.ComponentProps["matches"]) {
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

export default function Component({ loaderData, matches }: Route.ComponentProps) {
	const breadcrumbs = extractBreadcrumbs(matches);
	const location = useLocation();

	function isCurrent(node: NavigationNode) {
		return isActive(location, node).isActive;
	}

	const nav = groupBy(NAV_ITEMS, "section");

	return (
		<SidebarProvider>
			<Sidebar collapsible="dock">
				<SidebarHeader>
					<Link
						className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
						href={href("/")}
					>
						<SidebarLabel className="font-medium">Dashboard</SidebarLabel>
					</Link>
				</SidebarHeader>

				<SidebarContent>
					<SidebarSectionGroup>
						{Object.entries(nav).map(([section, items]) => (
							<SidebarSection key={section} title={section}>
								{items.map((item) => (
									<SidebarItem
										key={item.title}
										isCurrent={isCurrent(item)}
										href={item.to}
										tooltip={item.title}
									>
										<Icon name={item.icon} />
										<SidebarLabel>{item.title}</SidebarLabel>
									</SidebarItem>
								))}
							</SidebarSection>
						))}
					</SidebarSectionGroup>
				</SidebarContent>

				<SidebarFooter className="hidden md:block mb-4">
					<ProfileMenu user={loaderData.user} />
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<SidebarNav className="border-b">
					<span className="flex items-center gap-x-4">
						<SidebarTrigger className="-mx-2">
							<IconRaw name="panel-left-open" className="hidden md:inline" />
							{/* <IconRaw
								name="panel-left-close"
								className="hidden md:peer-data-[sidebar-state=expanded]:inline"
							/> */}
							<IconRaw name="menu" className="inline md:hidden" />
							<span className="sr-only">Toggle Sidebar</span>
						</SidebarTrigger>
						<Separator className="h-6" orientation="vertical" />
						<Breadcrumbs className="@md:flex hidden">
							{Array.from(breadcrumbs).map(([href, title]) => (
								<Breadcrumbs.Item key={href} href={href}>
									{title}
								</Breadcrumbs.Item>
							))}
						</Breadcrumbs>
					</span>
					<div className="ml-auto">
						<CommandPalette />
					</div>
					<ProfileMenu user={loaderData.user} />
				</SidebarNav>
				<div className="p-4 lg:p-6">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
