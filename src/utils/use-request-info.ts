import { useRouteLoaderData } from "react-router";
import type { Info } from "../+types/root";

export function useRequestInfo() {
	const data = useRouteLoaderData<Info["loaderData"]>("root");
	if (!data) {
		throw new Error("No request info available");
	}

	return data.requestInfo;
}
