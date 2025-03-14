import type { HonoEnv } from "@worker/app";
import type { Context } from "hono";
import { type unstable_InitialContext, unstable_createContext } from "react-router";
import type { Session } from "./lib/auth/.client";

export const CONTEXT = unstable_createContext<Context<HonoEnv>>();
export const ENV = unstable_createContext<Env>();

export const SESSION = unstable_createContext<Session>();

export function getLoadContext(ctx: Context<HonoEnv>): unstable_InitialContext {
	const map = new Map();
	map.set(ENV, ctx.env);
	map.set(CONTEXT, ctx);
	return map;
}
