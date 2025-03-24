import { Conditional, Else } from "@/components/conditional";
import { Icon } from "@/components/icon";
import { useSessionFreshness, waitFor } from "@/components/session";
import { Button, type ButtonProps, Card, Heading, Separator, Table, TextField } from "@/components/ui";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithValibot } from "conform-to-valibot";
import * as React from "react";
import { useFetcher } from "react-router";
import type { Info, Route } from "./+types";
import { schema } from "./validation";

export function PasskeySection({ passkeys }: { passkeys: Route.ComponentProps["loaderData"]["passkeys"] }) {
	const [edit, setEdit] = React.useState<string | null>(null);

	const { data, Form } = useFetcher<Info["actionData"]>();

	return (
		<section className="grid grid-flow-row gap-4">
			<Heading>Passkeys</Heading>
			<Separator />
			<p className="text-muted-fg text-sm">
				Passkeys are webauthn credentials that validate your identity using touch, facial recognition, a device
				password, or a PIN. They can be used as a password replacement or as a 2FA method.
			</p>
			<div className="grid grid-flow-row gap-2">
				<Card>
					<Table aria-label="Products">
						<Table.Header>
							<Table.Column isRowHeader>Your passkeys</Table.Column>
							<Table.Column className="w-0">
								<AddPasskeyForm className="place-self-end" intent="outline" />
							</Table.Column>
						</Table.Header>
						<Table.Body
							items={passkeys}
							dependencies={[edit]}
							renderEmptyState={() => (
								<div className="flex flex-col items-center justify-center gap-2 p-8">
									<Icon name="key-round" className="text-2xl text-muted-fg" />
									<p className="text-muted-fg">No passkeys found</p>
									<AddPasskeyForm intent="plain" />
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
												<Button intent="outline" type="button" onPress={() => setEdit(item.id)}>
													<Icon name="pencil" />
												</Button>

												<Form method="post">
													<input type="hidden" name="id" value={item.id} />
													<Button
														type="submit"
														name="__action"
														value="PASSKEY:DELETE"
														intent="outline"
													>
														<Icon name="trash" />
													</Button>
												</Form>
												<Else>
													<Button
														intent="outline"
														type="submit"
														form={`passkey-edit-${item.id}`}
														name="__action"
														value="PASSKEY:UPDATE"
													>
														Save
													</Button>
													<Button
														type="button"
														intent="outline"
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
			</div>
		</section>
	);
}

function AddPasskeyForm({ className, intent }: { className?: string; intent?: ButtonProps["intent"] }) {
	const { data, Form } = useFetcher<Info["actionData"]>();
	const [form, fields] = useForm({
		lastResult: data,
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},
	});
	const [getFreshSession, Modal] = useSessionFreshness();

	return (
		<>
			<Form {...getFormProps(form)} method="POST" className={className} onSubmit={waitFor(getFreshSession)}>
				<Button type="submit" size="extra-small" name={fields._action.name} value="PASSKEY:ADD" intent={intent}>
					add passkey
				</Button>
			</Form>
			<Modal />
		</>
	);
}
