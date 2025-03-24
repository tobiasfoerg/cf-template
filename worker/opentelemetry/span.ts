import {
	type AttributeValue,
	type Attributes,
	type Exception,
	type HrTime,
	type Link,
	type Span,
	type SpanContext,
	SpanKind,
	type SpanStatus,
	SpanStatusCode,
	type TimeInput,
} from "@opentelemetry/api";
import {
	type InstrumentationScope,
	hrTimeDuration,
	isAttributeValue,
	isTimeInput,
	sanitizeAttributes,
} from "@opentelemetry/core";
import type { Resource } from "@opentelemetry/resources";
import type { ReadableSpan, TimedEvent } from "@opentelemetry/sdk-trace-base";
import {
	ATTR_EXCEPTION_MESSAGE,
	ATTR_EXCEPTION_STACKTRACE,
	ATTR_EXCEPTION_TYPE,
} from "@opentelemetry/semantic-conventions";

type OnSpanEnd = (span: Span) => void;

interface SpanInit {
	attributes: unknown;
	name: string;
	onEnd: OnSpanEnd;
	resource: Resource;
	spanContext: SpanContext;
	links?: Link[];
	parentSpanId?: string;
	spanKind?: SpanKind;
	startTime?: TimeInput;
}

function transformExceptionAttributes(exception: Exception): Attributes {
	const attributes: Attributes = {};
	if (typeof exception === "string") {
		attributes[ATTR_EXCEPTION_MESSAGE] = exception;
	} else {
		if (exception.code) {
			attributes[ATTR_EXCEPTION_TYPE] = exception.code.toString();
		} else if (exception.name) {
			attributes[ATTR_EXCEPTION_TYPE] = exception.name;
		}
		if (exception.message) {
			attributes[ATTR_EXCEPTION_MESSAGE] = exception.message;
		}
		if (exception.stack) {
			attributes[ATTR_EXCEPTION_STACKTRACE] = exception.stack;
		}
	}
	return attributes;
}

function millisToHr(millis: number): HrTime {
	return [Math.trunc(millis / 1000), (millis % 1000) * 1e6];
}

function getHrTime(input?: TimeInput): HrTime {
	const now = Date.now();
	if (!input) {
		return millisToHr(now);
	}
	if (input instanceof Date) {
		return millisToHr(input.getTime());
	}
	if (typeof input === "number") {
		//TODO: do something with performance.now something
		return millisToHr(input);
	}
	if (Array.isArray(input)) {
		return input;
	}

	const v: never = input;
	throw new Error(`unreachable value: ${JSON.stringify(v)}`);
}

export class SpanImpl implements Span, ReadableSpan {
	name: string;
	private readonly _spanContext: SpanContext;
	private readonly onEnd: OnSpanEnd;
	readonly parentSpanId?: string;
	readonly kind: SpanKind;
	readonly attributes: Attributes;
	status: SpanStatus = {
		code: SpanStatusCode.UNSET,
	};
	endTime: HrTime = [0, 0];
	private _duration: HrTime = [0, 0];
	readonly startTime: HrTime;
	readonly events: TimedEvent[] = [];
	readonly links: Link[];
	readonly resource: Resource;
	instrumentationScope: InstrumentationScope = { name: "@microlabs/otel-cf-workers" };
	private _ended = false;
	private _droppedAttributesCount = 0;
	private _droppedEventsCount = 0;
	private _droppedLinksCount = 0;

	constructor(init: SpanInit) {
		this.name = init.name;
		this._spanContext = init.spanContext;
		this.parentSpanId = init.parentSpanId;
		this.kind = init.spanKind || SpanKind.INTERNAL;
		this.attributes = sanitizeAttributes(init.attributes);
		this.startTime = getHrTime(init.startTime);
		this.links = init.links || [];
		this.resource = init.resource;
		this.onEnd = init.onEnd;
	}

	addLink(link: Link): this {
		this.links.push(link);
		return this;
	}
	addLinks(links: Link[]): this {
		this.links.push(...links);
		return this;
	}

	spanContext(): SpanContext {
		return this._spanContext;
	}

	setAttribute(key: string, value?: AttributeValue): this {
		if (isAttributeValue(value)) {
			this.attributes[key] = value;
		}
		return this;
	}

	setAttributes(attributes: Attributes): this {
		for (const [key, value] of Object.entries(attributes)) {
			this.setAttribute(key, value);
		}
		return this;
	}

	addEvent(name: string, attributesOrStartTime?: Attributes | TimeInput, startTime?: TimeInput): this {
		let _startTime = startTime;
		let _attributesOrStartTime = attributesOrStartTime;

		if (isTimeInput(attributesOrStartTime)) {
			_startTime = attributesOrStartTime;
			_attributesOrStartTime = undefined;
		}

		const attributes = sanitizeAttributes(_attributesOrStartTime);
		const time = getHrTime(_startTime);
		this.events.push({ name, attributes, time });
		return this;
	}

	setStatus(status: SpanStatus): this {
		this.status = status;
		return this;
	}

	updateName(name: string): this {
		this.name = name;
		return this;
	}

	end(endTime?: TimeInput): void {
		if (this._ended) {
			return;
		}
		this._ended = true;
		this.endTime = getHrTime(endTime);
		this._duration = hrTimeDuration(this.startTime, this.endTime);
		this.onEnd(this);
	}

	isRecording(): boolean {
		return !this._ended;
	}

	recordException(exception: Exception, time?: TimeInput): void {
		const attributes = transformExceptionAttributes(exception);
		this.addEvent("exception", attributes, time);
	}

	get duration(): HrTime {
		return this._duration;
	}

	get ended(): boolean {
		return this._ended;
	}

	get droppedAttributesCount(): number {
		return this._droppedAttributesCount;
	}

	get droppedEventsCount(): number {
		return this._droppedEventsCount;
	}

	get droppedLinksCount(): number {
		return this._droppedLinksCount;
	}
}
