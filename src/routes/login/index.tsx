import { type FieldMetadata, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import type { Route } from "./+types";

import { Icon } from "@/components/icon";
import { Button, Card, Checkbox, TextField } from "@/components/ui";
import { authClient } from "@/lib/auth/.client";
import { getErrorProps, getInputFieldProps } from "@/lib/form/utils";
import * as React from "react";
import { Form, href, redirect } from "react-router";
import { schema } from "./validation";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const { searchParams } = new URL(request.url);
	const submission = parseWithValibot(formData, {
		schema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	const continueWith = searchParams.get("continue") ?? href("/");

	switch (submission.value._action) {
		case "LOGIN:EMAIL": {
			const result = await authClient.signIn.email({
				email: submission.value.email,
				password: submission.value.password,
				rememberMe: submission.value.rememberMe,
			});
			if (result.error) {
				const formErrors = [];
				if (result.error.message) {
					formErrors.push(result.error.message);
				}
				return submission.reply({ formErrors });
			}
			throw redirect(continueWith);
		}
		case "LOGIN:PASSKEY": {
			const result = await authClient.signIn.passkey();
			if (result?.error) {
				const formErrors = [];
				if (result.error.message) {
					formErrors.push(result.error.message);
				}
				return submission.reply({ formErrors });
			}
			throw redirect(continueWith);
		}
		default: {
			return submission.reply();
		}
	}
}

export default function Component({ actionData }: Route.ComponentProps) {
	const [form, fields] = useForm({
		lastResult: actionData,
		shouldValidate: "onSubmit",
		shouldRevalidate: "onBlur",
		constraint: getValibotConstraint(schema),
		onValidate({ formData }) {
			return parseWithValibot(formData, { schema });
		},
	});

	React.useEffect(() => {
		if (
			!PublicKeyCredential.isConditionalMediationAvailable ||
			!PublicKeyCredential.isConditionalMediationAvailable()
		) {
			return;
		}

		void authClient.signIn.passkey({ autoFill: true });
	}, []);

	return (
		<div className="flex justify-center min-h-screen items-center">
			<Card className="w-full p-4 sm:max-w-md">
				<Card.Header>
					<Card.Title>Login</Card.Title>
					<Card.Description>Sign in to your account to access your dashboard.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Form className="grid grid-flow-row gap-4" method="POST" {...getFormProps(form)}>
						{form.errors && (
							<ul className="text-danger text-sm">
								{form.errors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						)}
						<TextField
							label="Email"
							{...getInputFieldProps(fields.email)}
							autoComplete="username webauthn"
						/>
						<TextField
							label="Password"
							{...getInputFieldProps(fields.password, { type: "password" })}
							type="password"
							autoComplete="current-password webauthn"
							isRevealable
						/>
						<Checkbox {...getInputProps(fields.rememberMe, { type: "checkbox" })}>Remember me</Checkbox>
						<Button type="submit" name="_action" value="LOGIN:EMAIL">
							Login
						</Button>

						<Button type="submit" name="_action" value="LOGIN:PASSKEY" appearance="outline">
							<Icon name="fingerprint">Signin with Passkey</Icon>
						</Button>
					</Form>
				</Card.Content>
			</Card>
		</div>
	);
}
