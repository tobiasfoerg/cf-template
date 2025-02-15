import * as v from "valibot";

export const schema = v.variant("_action", [
	v.object({
		_action: v.literal("USER:UPDATE"),
		firstName: v.pipe(v.string(), v.nonEmpty()),
		lastName: v.pipe(v.string(), v.nonEmpty()),
		image: v.optional(v.string()),
	}),
]);
