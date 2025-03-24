const unwrapSymbol = Symbol("unwrap");

type Wrapped<T> = { [unwrapSymbol]: T } & T;

export function isWrapped<T>(item: T): item is Wrapped<T> {
	return item && !!(item as Wrapped<T>)[unwrapSymbol];
}

export function isProxyable(item: unknown) {
	return (item !== null && typeof item === "object") || typeof item === "function";
}

export function wrap<T extends object>(item: T, handler: ProxyHandler<T>, autoPassthrough = true): T {
	if (isWrapped(item) || !isProxyable(item)) {
		return item;
	}
	const proxyHandler = Object.assign({}, handler);
	proxyHandler.get = (target, prop, receiver) => {
		if (prop === unwrapSymbol) {
			return item;
		}
		if (handler.get) {
			return handler.get(target, prop, receiver);
		}
		if (prop === "bind") {
			return () => receiver;
		}
		if (autoPassthrough) {
			return passthroughGet(target, prop);
		}
	};
	proxyHandler.apply = (target, thisArg, argArray) => {
		if (handler.apply) {
			return handler.apply(unwrap(target), unwrap(thisArg), argArray);
		}
	};
	return new Proxy(item, proxyHandler);
}

export function unwrap<T extends object>(item: T): T {
	if (item && isWrapped(item)) {
		return item[unwrapSymbol];
	}
	return item;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function passthroughGet(target: any, prop: string | symbol, thisArg?: any) {
	const unwrappedTarget = unwrap(target);
	const value = Reflect.get(unwrappedTarget, prop);
	if (typeof value === "function") {
		if (value.constructor.name === "RpcProperty") {
			return (...args: unknown[]) => unwrappedTarget[prop](...args);
		}
		// biome-ignore lint lint/style/noParameterAssign: <explanation>
		thisArg = thisArg || unwrappedTarget;
		return value.bind(thisArg);
	}
	return value;
}
