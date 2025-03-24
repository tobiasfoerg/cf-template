import * as v from "valibot";

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
	DBG: "DBG",
	INF: "INF",
	WRN: "WRN",
	ERR: "ERR",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

const logLevelSchema = v.fallback(v.enum(LogLevel), LogLevel.INF);

export type { Logger };

export class LoggerBuilder {
	private _ctx: ExecutionContext;
	private _loglevel: LogLevel;
	private _reporters: Array<Reporter>;

	constructor(ctx: ExecutionContext) {
		this._ctx = ctx;
		this._reporters = [];
	}
	loglevel(level?: LogLevel | (string & {})) {
		this._loglevel = v.parse(logLevelSchema, level);
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
