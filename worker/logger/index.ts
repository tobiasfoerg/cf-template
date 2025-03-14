import { AsyncLocalStorage } from "node:async_hooks";
import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

abstract class BaseLogger {
	protected _ctx: ExecutionContext;
	constructor(ctx: ExecutionContext) {
		this._ctx = ctx;
	}
}

type LogEvent = {
	level: LogLevel;
	timestamp: number;
	message: string;
};

class SpanLogger implements Disposable {
	private _buffer: LogEvent[];
	constructor() {
		this._buffer = [];
	}
	[Symbol.dispose](): void {
		throw new Error("Method not implemented.");
	}
}

class Logger extends BaseLogger implements Disposable {
	private _name: string;
	private _buffer: Array<LogEvent>;
	private _reporters: Array<Reporter>;

	constructor(name: string, reporters: Array<Reporter>, ctx: ExecutionContext) {
		super(ctx);
		this._name = name;
		this._reporters = reporters;
		this._buffer = [];
	}

	middleware() {
		return createMiddleware(async (ctx, next) => {
			const url = new URL(ctx.req.url);
			const start = Date.now();
			this.log({
				level: LogLevel.INFO,
				timestamp: Date.now(),
				message: `REQ: ${ctx.req.method} ${url.pathname}`,
			});

			await next();
			this.log({
				level: LogLevel.INFO,
				timestamp: Date.now(),
				message: `RES: ${ctx.req.method} ${url.pathname} ${ctx.res.status} ${Date.now() - start}ms`,
			});
		});
	}

	log(event: LogEvent) {
		this._buffer.push(event);
	}

	[Symbol.dispose](): void {
		console.log("disposing logger");
		this._ctx.waitUntil(this.report());
	}

	private async report() {
		await Promise.all(this._reporters.map((reporter) => reporter.send(this._buffer)));
	}
}

export const LogLevel = {
	DEBUG: "DBG",
	INFO: "INF",
	WARN: "WRN",
	ERROR: "ERR",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export type { Logger };

export class LoggerBuilder {
	private _ctx: ExecutionContext;
	private _loglevel: string;
	private _reporters: Array<Reporter>;

	constructor(ctx: ExecutionContext) {
		this._ctx = ctx;
		this._reporters = [];
	}
	loglevel(level: LogLevel) {
		this._loglevel = level;
		return this;
	}

	register(reporter: Reporter) {
		this._reporters.push(reporter);
		return this;
	}

	build(name: string) {
		return new Logger(name, this._reporters, this._ctx);
	}
}

abstract class Reporter {
	abstract send(events: Array<LogEvent>): Promise<void>;
}

export class ConsoleReporter extends Reporter {
	async send(events: Array<LogEvent>): Promise<void> {
		for (const event of events) {
			console.log(this.format(event));
		}
	}

	private format(event: LogEvent) {
		return `[${new Date(event.timestamp).toISOString()} ${event.level.toUpperCase()}]  ${event.message}`;
	}
}
