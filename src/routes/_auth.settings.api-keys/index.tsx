import { authClient } from "@/lib/auth/.client";
import { APP_NAME } from "@/lib/constants";
import { parseWithValibot } from "conform-to-valibot";
import type { Route } from "./+types";
import { ApiKeySection } from "./api-keys-section";
import { schema } from "./validation";

export const handle = {
	title: "API Keys",
};

export async function clientLoader() {
	const { data } = await authClient.apiKey.list();

	return {
		apiKeys: data ?? [],
	};
}

clientLoader.hydrate = true as const;

export async function clientAction({ request }: Route.ClientActionArgs) {
	const formData = await request.formData();
	const submission = parseWithValibot(formData, { schema });

	if (submission.status !== "success") {
		return submission.reply();
	}
	const { value } = submission;

	switch (value._action) {
		case "PASSKEY:ADD":
			authClient.apiKey.create({});
			await authClient.passkey.addPasskey({
				name: APP_NAME,
			});
			break;
		case "PASSKEY:DELETE":
			await authClient.passkey.deletePasskey({ id: value.id });
			break;
		case "PASSKEY:UPDATE":
			await authClient.passkey.updatePasskey({
				id: value.id,
				name: value.name,
			});
			break;
	}

	return submission.reply({ resetForm: true });
}

export default function Component({ loaderData, actionData }: Route.ComponentProps) {
	return (
		<div className="grid grid-flow-row gap-8">
			<ApiKeySection apiKeys={loaderData.apiKeys} />
		</div>
	);
}
