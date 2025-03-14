import { Icon } from "@/components/icon";
import { Button, CommandMenu, Keyboard } from "@/components/ui";
import { authClient } from "@/lib/auth/.client";
import { NAV_ITEMS, groupBy, toFilterString } from "@/lib/navigation";
import * as React from "react";
import { href, useNavigate, useNavigation } from "react-router";

export function CommandPalette() {
	const [isOpen, setIsOpen] = React.useState(false);
	const { state } = useNavigation();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (state !== "idle") {
			setIsOpen(false);
		}
	}, [state]);

	function handleOnAction(fn: () => void) {
		return () => {
			fn();
			setIsOpen(false);
		};
	}

	const nav = groupBy(NAV_ITEMS, "section");

	return (
		<>
			<Button intent="outline" onPress={() => setIsOpen(true)}>
				<Icon name="search" />
				<span className="text-muted-fg">Search...</span>
				<Keyboard keys="⌘K" />
			</Button>
			<CommandMenu shortcut="k" isOpen={isOpen} onOpenChange={setIsOpen}>
				<CommandMenu.Search placeholder="Quick search..." />
				<CommandMenu.List>
					{Object.entries(nav).map(([section, items]) => (
						<CommandMenu.Section key={section} title={section}>
							{items.map((item) => (
								<CommandMenu.Item key={item.title} textValue={toFilterString(item)} href={item.to}>
									<Icon name={item.icon} />
									<CommandMenu.Label>{item.title}</CommandMenu.Label>
								</CommandMenu.Item>
							))}
						</CommandMenu.Section>
					))}
					<CommandMenu.Section title="Actions">
						<CommandMenu.Item
							textValue="Logout"
							onAction={handleOnAction(() =>
								authClient.signOut({
									fetchOptions: {
										onSuccess() {
											navigate(href("/login"), {
												replace: true,
											});
										},
									},
								}),
							)}
						>
							<Icon name="log-out" />
							<CommandMenu.Label>Logout</CommandMenu.Label>
							<CommandMenu.Keyboard keys="⌘L" />
						</CommandMenu.Item>
					</CommandMenu.Section>
				</CommandMenu.List>
			</CommandMenu>
		</>
	);
}
