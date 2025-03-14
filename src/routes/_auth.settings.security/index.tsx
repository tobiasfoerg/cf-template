import { authClient } from "@/lib/auth/.client";
import { APP_NAME } from "@/lib/constants";
import { parseWithValibot } from "conform-to-valibot";
import { UAParser } from "ua-parser-js";
import type { Route } from "./+types";
import { PasskeySection } from "./passkey-section";
import { SessionSection } from "./session-section";
import { schema } from "./validation";

export const handle = {
	title: "Security",
};

export async function clientLoader() {
	const [{ data: passkeys }, { data: sessions }, { data: currentSession }] = await Promise.all([
		authClient.passkey.listUserPasskeys(),
		authClient.listSessions(),
		authClient.getSession(),
	]);

	return {
		passkeys: passkeys ?? [],
		sessions: (sessions ?? []).map((session) => ({
			...session,
			userAgent: session.userAgent ? UAParser(session.userAgent) : null,
			isCurrent: session.token === currentSession?.session.token,
			isExpired: session.expiresAt < new Date(),
		})),
	};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const submission = parseWithValibot(formData, { schema });

	if (submission.status !== "success") {
		return submission.reply();
	}
	const { value: payload } = submission;

	switch (payload._action) {
		case "PASSKEY:ADD": {
			const result = await authClient.passkey.addPasskey({
				name: APP_NAME,
			});

			break;
		}
		case "PASSKEY:DELETE":
			await authClient.passkey.deletePasskey({ id: payload.id });
			break;
		case "PASSKEY:UPDATE":
			await authClient.passkey.updatePasskey({
				id: payload.id,
				name: payload.name,
			});
			break;
	}

	return submission.reply({ resetForm: true });
}

export default function Component({ loaderData, actionData }: Route.ComponentProps) {
	return (
		<div className="grid grid-flow-row gap-8">
			<PasskeySection passkeys={loaderData.passkeys} />
			<SessionSection sessions={loaderData.sessions} />
		</div>
	);
}
