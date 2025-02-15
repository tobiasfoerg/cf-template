import { AUTH_CONTEXT, pull } from "@/context";
import type { Route } from "./+types";

export async function loader({ request }: Route.LoaderArgs) {
	return pull(AUTH_CONTEXT).handler(request);
}

export async function action({ request }: Route.ActionArgs) {
	return pull(AUTH_CONTEXT).handler(request);
}
