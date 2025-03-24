import { SESSION } from "@/context";
import { auth } from "@/lib/auth/.server";
import { toMerged } from "es-toolkit";
import { redirect } from "react-router";
import { createMiddleware } from "./utils";

type Options = {
	redirectTo: string;
};

const defaults: Options = {
	redirectTo: "/login",
};

export function authenticationMiddleware(opts?: Partial<Options>) {
	const options = toMerged(defaults, opts ?? {});

	return createMiddleware(async ({ request, context }, next) => {
		const session = await auth.api.getSession({
			headers: request.headers,
			query: {
				disableCookieCache: true,
			},
		});

		if (!session) {
			throw redirect(options.redirectTo);
		}

		context.set(SESSION, session);

		return await next();
	});
}
