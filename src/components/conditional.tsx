import React from "react";

export function Conditional({
	children,
	condition,
}: { children: React.ReactNode; condition: boolean | (() => boolean) }) {
	const __condition = typeof condition === "function" ? condition() : condition;

	return React.Children.map(children, (child) => {
		if (React.isValidElement(child)) {
			if (child.type === Else) {
				if (__condition) {
					return null;
				}
				return React.cloneElement(child, {});
			}

			if (!__condition) {
				return null;
			}
			return React.cloneElement(child, {});
		}
	});
}

export function Else({ children }: { children: React.ReactNode }) {
	return children;
}
