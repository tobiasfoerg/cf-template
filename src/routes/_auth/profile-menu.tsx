import { Icon } from "@/components/icon";
import { authClient } from "@/lib/auth/.client";
import { PROFILE_MENU } from "@/lib/navigation";
import * as React from "react";
import { href, useNavigate } from "react-router";
import { Avatar, Menu } from "ui";

export function ProfileMenu({
	user,
}: {
	user: { email: string; firstName: string; lastName: string; image?: string | null };
}) {
	const navigate = useNavigate();
	const initials = user.firstName[0] + user.firstName[0];

	return (
		<Menu>
			<Menu.Trigger aria-label="Profile" data-slot="menu-trigger" className="ml-auto md:hidden">
				<Avatar shape="square" src={user.image} initials={initials} />
				<div className="hidden md:block text-sm group-data-[sidebar-collapsible=dock]/sidebar-container:hidden">
					{user.firstName} {user.lastName}
					<span className="-mt-0.5 block text-muted-fg">{user.email}</span>
				</div>
				<Icon
					name="chevron-down"
					className="hidden md:block absolute right-3 size-4 group-data-[sidebar-collapsible=dock]/sidebar-container:hidden transition-transform group-pressed:rotate-180"
				/>
			</Menu.Trigger>
			<Menu.Content placement="bottom right" className="sm:min-w-(--trigger-width)">
				<Menu.Section>
					<Menu.Header separator>
						<div className="grid grid-cols-[auto_1fr] gap-2 items-center">
							<Avatar shape="square" src={user.image} initials={initials} />
							<div>
								<span className="block">
									{user.firstName} {user.lastName}
								</span>
								<span className="font-normal text-muted-fg">{user.email}</span>
							</div>
						</div>
					</Menu.Header>
				</Menu.Section>

				{PROFILE_MENU.map((node) => (
					<Menu.Item key={`item-${node.title}`} href={node.to}>
						<Icon name={node.icon} />
						<Menu.Label>{node.title}</Menu.Label>
					</Menu.Item>
				))}
				<Menu.Separator />
				<Menu.Item
					onAction={() =>
						React.startTransition(async () => {
							authClient.signOut({
								fetchOptions: {
									onSuccess() {
										navigate(href("/login"), {
											replace: true,
										});
									},
								},
							});
						})
					}
				>
					<Icon name="log-out" data-slot="icon" />
					<Menu.Label>Logout</Menu.Label>
				</Menu.Item>
			</Menu.Content>
		</Menu>
	);
}
