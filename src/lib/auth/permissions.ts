import { adminAc, createAccessControl, defaultStatements, memberAc, ownerAc } from "better-auth/plugins/access";

const statement = {
	...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
	...ownerAc.statements,
});

export const admin = ac.newRole({
	...adminAc.statements,
});

export const member = ac.newRole({
	...memberAc.statements,
});
