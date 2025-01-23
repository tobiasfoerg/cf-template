import { createRequestHandler } from "react-router";

export default {
	async fetch(request, _env, _ctx): Promise<Response> {
		const requestHandler = createRequestHandler(
			// @ts-expect-error - virtual module provided by React Router at build time
			() => import("virtual:react-router/server-build"),
			import.meta.env.MODE,
		);
		return await requestHandler(request);
	},
} satisfies ExportedHandler<Env>;
