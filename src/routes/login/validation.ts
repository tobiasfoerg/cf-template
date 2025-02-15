import * as v from "valibot";

export const schema = v.variant("_action", [
	v.object({
		_action: v.literal("LOGIN:EMAIL"),
		email: v.pipe(v.string(), v.nonEmpty(), v.email()),
		password: v.string(),
		rememberMe: v.optional(v.boolean()),
	}),
	v.object({
		_action: v.literal("LOGIN:PASSKEY"),
	}),
]);
