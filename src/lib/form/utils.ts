import { type FieldMetadata, getInputProps } from "@conform-to/react";

export function getErrorProps<Schema = unknown, FormSchema extends Record<string, unknown> = Record<string, unknown>>(
	field: FieldMetadata<Schema, FormSchema, string | string[]>,
): {
	isInvalid: boolean;
	errorMessage: string | undefined;
} {
	const isInvalid = Boolean(field.errors);
	const errorMessage = Array.isArray(field.errors) ? field.errors?.join(", ") : field.errors;
	return {
		isInvalid,
		errorMessage,
	};
}

export function getInputFieldProps<
	Schema = unknown,
	FormSchema extends Record<string, unknown> = Record<string, unknown>,
>(
	field: FieldMetadata<Schema, FormSchema, string | string[]>,
	options: Parameters<typeof getInputProps>[1] = { type: "text" },
) {
	const inputProps = getInputProps(field, options);
	return {
		...inputProps,
		...getErrorProps(field),
		isRequired: field.required,
	};
}
