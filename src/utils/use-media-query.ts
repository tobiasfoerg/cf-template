import React from "react";
import { useEffect, useState } from "react";

// export const useMediaQuery = (query: string) => {
// 	const [value, setValue] = useState(false);

// 	useEffect(() => {
// 		const onChange = (event: MediaQueryListEvent) => {
// 			setValue(event.matches);
// 		};

// 		const result = matchMedia(query);
// 		result.addEventListener("change", onChange);
// 		setValue(result.matches);

// 		return () => result.removeEventListener("change", onChange);
// 	}, [query]);

// 	return value;
// };

// Store to manage listeners
type MaxQuery = `(max-width: ${string})`;
type MinQuery = `(min-width: ${string})`;

type Query = MaxQuery | MinQuery | `${MinQuery} and ${MaxQuery}` | ({} & string);

// Hook to use the media query
export function useMediaQuery(query: Query, fallback?: boolean) {
	const subscribe = (callback: () => void) => {
		function handleChange(event: MediaQueryListEvent) {
			if (event.matches) {
				callback();
			}
		}
		const mediaQueryList = window.matchMedia(query);
		mediaQueryList.addEventListener("change", handleChange);

		return () => {
			mediaQueryList.removeEventListener("change", handleChange);
		};
	};

	const getSnapshot = () => window.matchMedia(query).matches;
	const getServerSnapshot = () => fallback ?? false;

	return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
