import { Avatar, Heading, Link, Separator, TextField } from "@/components/ui";
import { authClient } from "@/lib/auth/.client";
import { getInputFieldProps } from "@/lib/form/utils";
import { getFormProps, useForm } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { Form, href, redirect } from "react-router";
import type { Route } from "./+types";
import { schema } from "./validation";

export const handle = {
	title: "Profile",
};

export async function clientLoader() {
	const result = await authClient.getSession();

	if (!result.data) {
		throw redirect(href("/login"));
	}

	return {
		user: result.data.user,
	};
}

export async function clientAction() {
	return null;
}

export default function Component({ loaderData, actionData }: Route.ComponentProps) {
	const [form, fields] = useForm({
		lastResult: actionData,
		shouldValidate: "onSubmit",
		shouldRevalidate: "onBlur",
		constraint: getValibotConstraint(schema),
		defaultValue: {
			firstName: loaderData.user.firstName,
			lastName: loaderData.user.lastName,
		},
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},
	});

	return (
		<div>
			<section className="grid grid-flow-row gap-4">
				<Heading>Profile</Heading>
				<Separator />
				<Form method="POST" {...getFormProps(form)}>
					<div className="grid grid-cols-[1fr_auto] gap-16">
						<Avatar className="col-start-2 size-20 *:size-20" src={loaderData.user.image} />
						<div className="row-start-1 grid grid-flow-row gap-4">
							<TextField label="FirstName" {...getInputFieldProps(fields.firstName)} />
							<TextField label="LastName" {...getInputFieldProps(fields.lastName)} />
						</div>
					</div>
				</Form>
			</section>
		</div>
	);
}
