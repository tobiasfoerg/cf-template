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
import { getSessionWithDefaults } from "./lib/cookie.server";
import stylesheet from "./styles/app.css?url";

export async function loader({ request, context }: Route.LoaderArgs) {
	const preferences = await getSessionWithDefaults(request, {
		locale: context.locale,
		theme: "system",
		timezone: context.timezone,
		sidebar: "expanded",
	});

	return {
		preferences,
	};
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	preload(stylesheet, { as: "style" });
	return await serverLoader();
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof clientLoader>("root");
	return (
		<html lang="en" data-theme={data?.preferences.theme}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
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
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
