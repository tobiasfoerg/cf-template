import { Outlet } from "react-router";
import type { Route } from "./+types";

export const handle = {
	title: "Settings",
};

export default function Component(_: Route.ComponentProps) {
	return <Outlet />;
}
