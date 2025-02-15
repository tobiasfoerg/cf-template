import { RouterProvider as RouterProviderPrimitive } from "react-aria-components";
import { type NavigateOptions, type To, useHref, useNavigate } from "react-router";

declare module "react-aria-components" {
	interface RouterConfig {
		routerOptions: NavigateOptions;
		href: To;
	}
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	return (
		<RouterProviderPrimitive navigate={navigate} useHref={useHref}>
			{children}
		</RouterProviderPrimitive>
	);
}
