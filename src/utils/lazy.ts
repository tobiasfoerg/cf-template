export function lazy<Args extends unknown[], T>(fn: (...args: Args) => T): (...args: Args) => T {
	let _value: T | null = null;

	const ret: (...args: Args) => T = (...args: Args) => {
		if (_value === null) {
			_value = fn(...args);
		}

		return _value;
	};

	return ret;
}
