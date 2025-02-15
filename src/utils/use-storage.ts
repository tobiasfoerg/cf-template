import * as React from "react";
import { useEventCallback } from "./use-event-callback";
import { useEventListener } from "./use-event-listener";

declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface WindowEventMap {
		"local-storage": CustomEvent;
	}
}

type UseLocalStorageOptions<T> = {
	serializer?: (value: T) => string;
	deserializer?: (value: string) => T;
	initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useLocalStorage<T>(
	key: string,
	initialValue: T | (() => T),
	options: UseLocalStorageOptions<T> = {},
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
	const { initializeWithValue = true } = options;

	const serializer = React.useCallback<(value: T) => string>(
		(value) => {
			if (options.serializer) {
				return options.serializer(value);
			}

			return JSON.stringify(value);
		},
		[options],
	);

	const deserializer = React.useCallback<(value: string) => T>(
		(value) => {
			if (options.deserializer) {
				return options.deserializer(value);
			}
			if (value === "undefined") {
				return undefined as unknown as T;
			}

			const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

			let parsed: unknown;
			try {
				parsed = JSON.parse(value);
			} catch (error) {
				console.error("Error parsing JSON:", error);
				return defaultValue;
			}

			return parsed as T;
		},
		[options, initialValue],
	);

	const readValue = React.useCallback((): T => {
		const initialValueToUse = initialValue instanceof Function ? initialValue() : initialValue;

		if (IS_SERVER) {
			return initialValueToUse;
		}

		try {
			const raw = window.localStorage.getItem(key);
			return raw ? deserializer(raw) : initialValueToUse;
		} catch (error) {
			console.warn(`Error reading localStorage key “${key}”:`, error);
			return initialValueToUse;
		}
	}, [initialValue, key, deserializer]);

	const [storedValue, setStoredValue] = React.useState(() => {
		if (initializeWithValue) {
			return readValue();
		}

		return initialValue instanceof Function ? initialValue() : initialValue;
	});

	const setValue: React.Dispatch<React.SetStateAction<T>> = useEventCallback((value) => {
		if (IS_SERVER) {
			console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
		}

		try {
			const newValue = value instanceof Function ? value(readValue()) : value;

			window.localStorage.setItem(key, serializer(newValue));

			setStoredValue(newValue);

			window.dispatchEvent(new StorageEvent("local-storage", { key }));
		} catch (error) {
			console.warn(`Error setting localStorage key “${key}”:`, error);
		}
	});

	const removeValue = useEventCallback(() => {
		if (IS_SERVER) {
			console.warn(`Tried removing localStorage key “${key}” even though environment is not a client`);
		}

		const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

		window.localStorage.removeItem(key);

		setStoredValue(defaultValue);

		window.dispatchEvent(new StorageEvent("local-storage", { key }));
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		setStoredValue(readValue());
	}, [key]);

	const handleStorageChange = React.useCallback(
		(event: StorageEvent | CustomEvent) => {
			if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
				return;
			}
			setStoredValue(readValue());
		},
		[key, readValue],
	);

	useEventListener("storage", handleStorageChange);
	useEventListener("local-storage", handleStorageChange);

	return [storedValue, setValue, removeValue];
}
