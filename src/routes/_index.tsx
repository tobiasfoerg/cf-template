import { Link } from "react-router";
import type { Route } from "./+types/_index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Component(_: Route.ComponentProps) {
	return (
		<div>
			<h1>Hallo</h1>

			<Link to="/test">Test</Link>
		</div>
	);
}
