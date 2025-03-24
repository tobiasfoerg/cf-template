import { Icon } from "@/components/icon";
import { Button, type ButtonProps, Card, Heading, Separator, Table, TextField } from "@/components/ui";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import * as React from "react";
import { useFetcher } from "react-router";
import type { Info, Route } from "./+types";
import { schema } from "./validation";

export function ApiKeySection({ apiKeys }: { apiKeys: Route.ComponentProps["loaderData"]["apiKeys"] }) {
	const [edit, setEdit] = React.useState<string | null>(null);

	const { data, Form } = useFetcher<Info["actionData"]>();

	return (
		<section className="grid grid-flow-row gap-4">
			<Heading>Api Keys</Heading>
			<Separator />
			<p className="text-muted-fg text-sm">
				API keys allow you to access the API. You can create, delete, and update your API keys here.
			</p>
			<div className="grid grid-flow-row gap-2">
				<Card>
					<Table aria-label="Products">
						<Table.Header>
							<Table.Column isRowHeader>Your API keys</Table.Column>
							<Table.Column className="w-0">
								<AddApiKeyForm className="place-self-end" intent="outline" />
							</Table.Column>
						</Table.Header>
						<Table.Body
							items={apiKeys}
							dependencies={[edit]}
							renderEmptyState={() => (
								<div className="flex flex-col items-center justify-center gap-2 p-8">
									<Icon name="key-round" className="text-2xl text-muted-fg" />
									<p className="text-muted-fg">No API keys found</p>
									<AddApiKeyForm intent="plain" />
								</div>
							)}
						>
							{(item) => (
								<Table.Row id={item.id}>
									<Table.Cell />
									<Table.Cell />
								</Table.Row>
							)}
						</Table.Body>
					</Table>
				</Card>
			</div>
		</section>
	);
}

function AddApiKeyForm({ className, intent }: { className?: string; intent?: ButtonProps["intent"] }) {
	const { data, Form } = useFetcher<Info["actionData"]>();
	const [form, fields] = useForm({
		lastResult: data,
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},
	});

	return (
		<Form {...getFormProps(form)} method="POST" className={className}>
			<Button type="submit" size="extra-small" name={fields._action.name} value="PASSKEY:ADD" intent={intent}>
				add api key
			</Button>
		</Form>
	);
}
