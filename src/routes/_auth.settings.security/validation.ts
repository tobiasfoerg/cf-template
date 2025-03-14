import * as v from "valibot";

export const schema = v.variant("_action", [
	v.object({
		_action: v.literal("PASSKEY:ADD"),
	}),
	v.object({
		_action: v.literal("PASSKEY:DELETE"),
		id: v.pipe(v.string(), v.nonEmpty()),
	}),
	v.object({
		_action: v.literal("PASSKEY:UPDATE"),
		id: v.pipe(v.string(), v.nonEmpty()),
		name: v.pipe(v.string(), v.nonEmpty()),
	}),
]);
