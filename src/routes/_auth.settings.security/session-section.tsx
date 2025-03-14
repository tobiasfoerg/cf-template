import { RelativeTime } from "@/components/datetime/relative-time";
import { Icon } from "@/components/icon";
import { Button, Card, Heading, Separator, Table, Tooltip } from "@/components/ui";
import { authClient } from "@/lib/auth/.client";
import React from "react";
import { useRevalidator } from "react-router";
import type { Route } from "./+types";

export function SessionSection({ sessions }: { sessions: Route.ComponentProps["loaderData"]["sessions"] }) {
	const { revalidate } = useRevalidator();
	return (
		<section className="grid grid-flow-row gap-4">
			<Heading>Sessions</Heading>
			<Separator />
			<p className="text-sm text-muted-fg">
				Manage your active sessions. You can revoke access to your account from any of the devices listed below.
			</p>
			<div className="grid grid-flow-row gap-2">
				<Card>
					<Table aria-label="Products">
						<Table.Header>
							<Table.Column isRowHeader>Your sessions</Table.Column>
							<Table.Column className="w-0">
								<Button intent="outline" size="extra-small">
									Revoke all
								</Button>
							</Table.Column>
						</Table.Header>
						<Table.Body items={sessions ?? []}>
							{(item) => (
								<Table.Row id={item.token}>
									<Table.Cell>
										<div className="grid grid-cols-[auto_1fr] gap-4 items-center">
											<div>
												<Icon name="monitor" className="size-10" />
											</div>
											<div>
												<p className="text-base font-medium">
													{item.userAgent?.browser.name} on {item.userAgent?.os.name}
												</p>
												<p className="text-sm">
													{item.isCurrent ? (
														"Your current session"
													) : (
														<>
															created{" "}
															<RelativeTime
																className="font-medium"
																value={item.createdAt}
															/>
														</>
													)}
												</p>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell className="text-right">
										<Tooltip>
											<Button
												intent="outline"
												type="button"
												onPress={async () => {
													React.startTransition(async () => {
														// TODO: move to clientAction
														await authClient.revokeSession({ token: item.token });
														await revalidate();
													});
												}}
											>
												<Icon name="trash" />
											</Button>
											<Tooltip.Content showArrow={false}>Revoke session</Tooltip.Content>
										</Tooltip>
									</Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table>
				</Card>
			</div>
		</section>
	);
}
