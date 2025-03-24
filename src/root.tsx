import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteLoaderData,
} from "react-router";

import { RouterProvider } from "@/components/router-provider";
import type { Route } from "./+types/root";

import { preload } from "react-dom";
import { SIDEBAR_COOKIE_NAME } from "./components/ui";
import { ClientHintCheck, getHints } from "./lib/client-hints";
import stylesheet from "./styles/app.css?url";
import { parseCookieHeader } from "./utils/parse-cookie-header";

import dayjs from "dayjs";
import { APP_NAME } from "./lib/constants";

export async function loader({ request }: Route.LoaderArgs) {
	const cookies = parseCookieHeader(request.headers.get("cookie"));

	return {
		requestInfo: {
			hints: getHints(request),
			userPreferences: {
				sidebar: cookies[SIDEBAR_COOKIE_NAME] === "true",
			},
		},
	};
}

export const meta: Route.MetaFunction = () => {
	return [{ title: APP_NAME }];
};

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	preload(stylesheet, { as: "style" });
	const data = await serverLoader();
	dayjs.locale(data.requestInfo.hints.locale);
	return data;
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof clientLoader>("root");
	return (
		<html lang="en" data-theme={data?.requestInfo.hints.theme}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Links />
				<Meta />
				<ClientHintCheck />
				<link href={stylesheet} rel="stylesheet" />
			</head>
			<body>
				<RouterProvider>{children}</RouterProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function Component(_: Route.ComponentProps) {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="container mx-auto p-4 pt-16">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full overflow-x-auto p-4">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
