import type { Route } from "./+types";

import { Icon } from "@/components/icon";
import { Button, Card, Checkbox, TextField } from "@/components/ui";
import { authClient } from "@/lib/auth/.client";
import { getInputFieldProps } from "@/lib/form/utils";
import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithValibot } from "conform-to-valibot";
import * as React from "react";
import { Form, href, redirect } from "react-router";
import { schema } from "./form";

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const { searchParams } = new URL(request.url);

	const submission = parseWithValibot(formData, { schema });
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

			console.log(result);

			if (result.error) {
				// TODO: add error message
				return submission.reply();
			}

			throw redirect(continueWith);
		}
		case "LOGIN:PASSKEY": {
			const result = await authClient.signIn.passkey({ email: submission.value.email });

			if (result?.error) {
				// TODO: add error message
				return submission.reply();
			}

			throw redirect(continueWith);
		}
	}
}

export default function Component({ actionData }: Route.ComponentProps) {
	const [form, fields] = useForm({
		lastResult: actionData,
		onValidate({ formData }) {
			console.log("formData", Object.fromEntries(formData.entries()));
			return parseWithValibot(formData, { schema });
		},
	});

	const checkboxControl = useInputControl(fields.rememberMe);

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
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full p-4 sm:max-w-md">
				<Card.Header>
					<Card.Title>Login</Card.Title>
					<Card.Description>Sign in to your account to access your dashboard.</Card.Description>
				</Card.Header>
				<Card.Content>
					<Form {...getFormProps(form)} className="grid grid-flow-row gap-4" method="POST">
						<TextField
							label="Email"
							autoFocus
							placeholder="example@email.com"
							autoComplete="username webauthn"
							{...getInputFieldProps(fields.email)}
						/>

						<TextField
							label="Password"
							isRevealable
							placeholder="********"
							autoComplete="current-password webauthn"
							{...getInputFieldProps(fields.password)}
							type="password"
						/>

						<Checkbox {...getInputFieldProps(fields.rememberMe)}>Remember me</Checkbox>

						<Button type="submit" name="_action" value="LOGIN:EMAIL">
							Login
						</Button>

						<Button type="submit" name="_action" value="LOGIN:PASSKEY" intent="outline">
							<Icon name="fingerprint">Signin with Passkey</Icon>
						</Button>
					</Form>
				</Card.Content>
			</Card>
		</div>
	);
}
