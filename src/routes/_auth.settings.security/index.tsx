import * as React from "react";
import { Form } from "react-router";

import { Conditional, Else } from "@/components/conditional";
import { Icon } from "@/components/icon";
import { Button, Card, Heading, Separator, Table, TextField } from "@/components/ui";
import { authClient } from "@/lib/auth/.client";
import type { Route } from "./+types";

export const handle = {
	title: "Security",
};

export async function clientLoader() {
	const [{ data: passkeys = [] }, { data: sessions = [] }] = await Promise.all([
		authClient.passkey.listUserPasskeys(),
		authClient.listSessions(),
	]);

	return {
		passkeys,
		sessions,
	};
}

clientLoader.hydrate = true as const;

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const action = formData.get("__action");

	switch (action) {
		case "PASSKEY:ADD":
			await authClient.passkey.addPasskey();
			break;
		case "PASSKEY:DELETE":
			await authClient.passkey.deletePasskey({ id: formData.get("id") as string });
			break;
		case "PASSKEY:UPDATE":
			await authClient.passkey.updatePasskey({
				id: formData.get("id") as string,
				name: formData.get("name") as string,
			});
			break;
		default:
			throw new Error(`Invalid action: ${action}`);
	}

	return null;
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const [edit, setEdit] = React.useState<string | null>(null);
	return (
		<div>
			<section className="grid grid-flow-row gap-4">
				<Heading>Passkeys</Heading>
				<Separator />
				<p className="text-sm text-muted-fg">
					Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a
					device password, or a PIN.{" "}
				</p>
				<div className="grid grid-flow-row gap-2">
					<Card>
						<Table aria-label="Products">
							<Table.Header>
								<Table.Column isRowHeader>Your passkeys</Table.Column>
								<Table.Column className="w-0" />
							</Table.Header>
							<Table.Body
								items={loaderData.passkeys ?? []}
								dependencies={[edit]}
								renderEmptyState={() => (
									<div className="flex flex-col items-center justify-center p-8 gap-2">
										<Icon name="key-round" className="text-2xl text-muted-fg" />
										<p className="text-muted-fg">No passkeys found</p>
										<Form method="post">
											<Button
												type="submit"
												name="__action"
												value="PASSKEY:ADD"
												appearance="plain"
											>
												add a passkey
											</Button>
										</Form>
									</div>
								)}
							>
								{(item) => (
									<Table.Row id={item.id}>
										<Table.Cell>
											<Conditional condition={item.id !== edit}>
												<Icon name="key-round">{item.name}</Icon>
												<p>added on {item.createdAt.toLocaleString()}</p>
												<Else>
													<Form id={`passkey-edit-${item.id}`} method="post">
														<input type="hidden" name="id" value={item.id} />
														<TextField name="name" defaultValue={item.name} />
													</Form>
												</Else>
											</Conditional>
										</Table.Cell>
										<Table.Cell>
											<div className="grid grid-flow-col gap-2">
												<Conditional condition={item.id !== edit}>
													<Button
														appearance="outline"
														type="button"
														onPress={() => setEdit(item.id)}
													>
														<Icon name="pencil" />
													</Button>

													<Form method="post">
														<input type="hidden" name="id" value={item.id} />
														<Button
															type="submit"
															name="__action"
															value="PASSKEY:DELETE"
															appearance="outline"
														>
															<Icon name="trash" />
														</Button>
													</Form>
													<Else>
														<Button
															appearance="outline"
															type="submit"
															form={`passkey-edit-${item.id}`}
															name="__action"
															value="PASSKEY:UPDATE"
														>
															Save
														</Button>
														<Button
															type="button"
															appearance="outline"
															onPress={() => setEdit(null)}
														>
															Cancel
														</Button>
													</Else>
												</Conditional>
											</div>
										</Table.Cell>
									</Table.Row>
								)}
							</Table.Body>
						</Table>
					</Card>
					<Form method="post" className="place-self-end">
						<Button type="submit" name="__action" value="PASSKEY:ADD" appearance="outline">
							add a passkey
						</Button>
					</Form>
				</div>
			</section>
			<section className="grid grid-flow-row gap-4">
				<Heading>Sessions</Heading>
				<Separator />
				<p className="text-sm text-muted-fg">
					Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a
					device password, or a PIN.{" "}
				</p>
				<pre>{JSON.stringify(loaderData.sessions, undefined, 2)}</pre>
			</section>
		</div>
	);
}
