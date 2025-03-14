import { auth } from "@/lib/auth/.server";
import type { Permissions } from "@/lib/auth/permissions";
import { toMerged } from "es-toolkit";
import { createMiddleware } from "./utils";

type Options = {
	permission: Partial<Permissions>;
};

const defaults: Options = {
	permission: {},
};

export function authorizationMiddleware(opts?: Partial<Options>) {
	const options = toMerged(defaults, opts ?? {});

	return createMiddleware(async ({ request }, next) => {
		const { success, error } = await auth.api.hasPermission({
			headers: request.headers,
			body: {
				permission: options.permission,
			},
		});

		if (!success) {
			throw new Response("Not Authorized", { status: 403 });
		}

		return await next();
	});
}
