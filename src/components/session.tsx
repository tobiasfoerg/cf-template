import { authClient } from "@/lib/auth/.client";
import { SESSION_FRESH_AGE } from "@/lib/auth/constants";
import dayjs from "dayjs";
import * as React from "react";
import { Form } from "react-router";
import { Button, Modal } from "./ui";

export function waitFor(callback: () => Promise<boolean>) {
	let dispatched = false;
	return async function handleEvent<E extends React.SyntheticEvent>(event: E) {
		if (!dispatched) {
			event.preventDefault();

			const result = await callback();
			if (result) {
				dispatched = true;
				event.target.dispatchEvent(new Event(event.type, event));
			}
		}
		dispatched = false;
	};
}

export function useSessionFreshness() {
	const { data } = authClient.useSession();
	const [open, setOpen] = React.useState(false);
	const ref = React.useRef<{
		resolve: (value: boolean | PromiseLike<boolean>) => void;
		reject?: (reason?: unknown) => void;
	} | null>(null);

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			ref.current?.reject?.();
			ref.current = null;
		}
		setOpen(isOpen);
	}

	function SessionModal() {
		return (
			<Modal.Content isOpen={open} onOpenChange={handleOpenChange}>
				<Modal.Header>
					<Modal.Title>Nice! Let's beef up your account.</Modal.Title>
					<Modal.Description>
						2FA beefs up your account's defense. Pop in your password to keep going.
					</Modal.Description>
				</Modal.Header>
				<Form
					onSubmit={async () => {
						const result = await authClient.signIn.email({
							email: data.user.email,
						});

						if (result.data) {
							ref.current?.resolve(true);
						} else {
							ref.current?.reject?.(result.error);
						}
						handleOpenChange(false);
					}}
				>
					<Modal.Body>test</Modal.Body>
					<Modal.Footer>
						<Modal.Close>Cancel</Modal.Close>
						<Button type="submit">Turn on 2FA</Button>
					</Modal.Footer>
				</Form>
			</Modal.Content>
		);
	}

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

	return [handleRefresh, SessionModal] as const;
}
