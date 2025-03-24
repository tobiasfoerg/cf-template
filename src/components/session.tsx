import { authClient } from "@/lib/auth/.client";
import { SESSION_FRESH_AGE } from "@/lib/auth/constants";
import { getInputFieldProps } from "@/lib/form/utils";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import dayjs from "dayjs";
import * as React from "react";
import { Form } from "react-router";
import * as v from "valibot";
import { Button, Modal, TextField } from "./ui";

export function waitFor(callback: () => Promise<boolean>) {
	return async function handleEvent<E extends React.SyntheticEvent>(event: E) {
		event.preventDefault();

		try {
			console.log("Waiting for event", event);
			const result = await callback();
			if (result) {
				console.log("Event resolved", event.currentTarget);
				if (event.target instanceof HTMLFormElement) {
					console.log("Submitting form");
				}
			}
		} catch (issue) {
			console.error("Error waiting for event", issue);
		}
	};
}

const schema = v.object({
	email: v.string(),
	password: v.string(),
});

export function useSessionFreshness() {
	const { data } = authClient.useSession();
	const [open, setOpen] = React.useState(false);
	const ref = React.useRef<{
		resolve: (value: boolean | PromiseLike<boolean>) => void;
		reject?: (reason?: unknown) => void;
	} | null>(null);

	const handleOpenChange = React.useCallback((isOpen: boolean) => {
		if (!isOpen) {
			ref.current?.reject?.();
			ref.current = null;
		}
		setOpen(isOpen);
	}, []);

	function handleRefresh() {
		if (data?.session) {
			const sessionAge = dayjs().diff(data.session.createdAt, "seconds");
			if (sessionAge < SESSION_FRESH_AGE) {
				return Promise.resolve(true);
			}
		}
		setOpen(true);
		return new Promise<boolean>((resolve, reject) => {
			ref.current = { resolve, reject };
		});
	}

	const _SessionModal = React.useMemo(() => {
		function SessionModal() {
			const [form, fields] = useForm({
				defaultValue: {
					email: data?.user.email,
					password: ""
				},
				onValidate(context) {
					return parseWithValibot(context.formData, { schema });
				},
				async onSubmit(event, context) {
					const submission = parseWithValibot(context.formData, { schema });
					if (submission.status !== "success") {
						return submission;
					}
					event.preventDefault();

					await authClient.signIn.email({
						email: submission.value.email,
						password: submission.value.password,
						fetchOptions: {
							onSuccess() {
								ref.current?.resolve(true);

								handleOpenChange(false);
							},
							onError(context) {
								ref.current?.reject?.(context.error);
							},
						},
					});
				},
			});
			return (
				<Modal.Content isOpen={open} onOpenChange={handleOpenChange}>
					<Modal.Header>
						<Modal.Title>Refresh Session</Modal.Title>
						<Modal.Description>
							You need a fresh session to perform this action. Please enter your password to refresh your
							session.
						</Modal.Description>
					</Modal.Header>
					<Form {...getFormProps(form)}>
						<Modal.Body>
							<input {...getInputProps(fields.email, { type: "hidden" })} />
							<TextField
								{...getInputFieldProps(fields.password)}
								label="Password"
								autoFocus
								autoComplete="current-password"
								placeholder="********"
								isRevealable
								type="password"
							/>
						</Modal.Body>
						<Modal.Footer>
							<Modal.Close type="reset">Cancel</Modal.Close>
							<Button type="submit">Validate</Button>
						</Modal.Footer>
					</Form>
				</Modal.Content>
			);
		}
		return SessionModal;
	}, [open, data?.user.email, handleOpenChange]);

	return [handleRefresh, _SessionModal] as const;
}
