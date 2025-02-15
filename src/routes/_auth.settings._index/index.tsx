import { redirect } from "react-router";
import type { Route } from "./+types";

export const handle = {
	title: "Settings",
};

export function loader(_: Route.LoaderArgs) {
	throw redirect("/settings/profile");
}
