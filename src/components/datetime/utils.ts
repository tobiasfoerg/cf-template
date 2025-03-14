export type DateValue = Date | number | string | undefined | null;

export function getDate(value?: DateValue) {
	if (typeof value === "undefined" || value === null) {
		return null;
	}
	return new Date(value);
}
