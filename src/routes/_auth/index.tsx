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
	SidebarSeparator,
	SidebarTrigger,
} from "@/components/ui";
import { SESSION } from "@/context";
import { NAV_ITEMS, type NavigationNode, groupBy, isActive } from "@/lib/navigation";
import { authenticationMiddleware } from "@/middlewares/authentication.server";
import { Outlet, href, useLocation } from "react-router";
import type { Route } from "./+types";
import { extractBreadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";
import { ProfileMenu } from "./profile-menu";

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [authenticationMiddleware()];

export async function loader({ context }: Route.LoaderArgs) {
	const session = context.get(SESSION);

	return {
		user: session.user,
	};
}

export default function Component({ loaderData, matches }: Route.ComponentProps) {
	const breadcrumbs = extractBreadcrumbs(matches);
	const location = useLocation();

	function isCurrent(node: NavigationNode) {
		return isActive(location, node).isActive;
	}

	const nav = groupBy(NAV_ITEMS, "section");

	return (
		<SidebarProvider defaultOpen={matches[0].data.requestInfo.userPreferences.sidebar}>
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
				<SidebarSeparator className="mb-0" />
				<SidebarFooter className="hidden md:block">
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
