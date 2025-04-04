import {
	apiKeyClient,
	inferAdditionalFields,
	multiSessionClient,
	organizationClient,
	passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "../.server";
import { ac, admin as adminAc, member as memberAc, owner as ownerAc } from "../permissions";

export const authClient = createAuthClient({
	baseURL: "http://localhost:5173",

	plugins: [
		apiKeyClient(),
		passkeyClient(),
		organizationClient({ ac, roles: { owner: ownerAc, admin: adminAc, member: memberAc } }),
		multiSessionClient(),

		inferAdditionalFields<typeof auth>(),
	],
});

export type Session = typeof authClient.$Infer.Session;

export const { useListPasskeys } = authClient;
