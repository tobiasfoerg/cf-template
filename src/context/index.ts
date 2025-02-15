import type { DB } from "@/db";
import type { initServerAuth } from "@/lib/auth/.server";
import { createContext } from "@ryanflorence/async-provider";

declare module "react-router" {
	interface AppLoadContext {
		timezone: string;
		locale: string;
		cf: Request["cf"];
	}
}

export * from "@ryanflorence/async-provider";

export const AUTH_CONTEXT = createContext<ReturnType<typeof initServerAuth>>();
export const DB_CONTEXT = createContext<DB>();
