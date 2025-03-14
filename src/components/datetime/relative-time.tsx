import { Tooltip } from "@/components/ui";
import { useIsomorphicLayoutEffect } from "@/utils/use-isomorphic-layout-effect";
import dayjs from "dayjs";
import * as React from "react";

class RefreshEmitter {
	private interval: number | null | NodeJS.Timeout = null;
	private listeners = new Set<() => void>();

	subscribe(callback: () => void) {
		this.listeners.add(callback);
		if (!this.interval) {
			this.interval = setInterval(() => {
				for (const listener of this.listeners) {
					listener();
				}
			}, 60 * 1000);
		}
		return () => {
			this.listeners.delete(callback);
			if (this.listeners.size === 0 && this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}
		};
	}
}

const emitter = new RefreshEmitter();

export interface RelativeTimeProps extends Omit<React.HTMLAttributes<HTMLTimeElement>, "children"> {
	value: dayjs.ConfigType;
}

export function RelativeTime({ value: defaultDate, ...props }: RelativeTimeProps) {
	const date = dayjs(defaultDate);

	const [timeString, setTimeString] = React.useState(() => date.fromNow());

	useIsomorphicLayoutEffect(() => {
		if (!date) {
			return;
		}
		const unsubscribe = emitter.subscribe(() => {
			setTimeString(date.fromNow());
		});

		return () => unsubscribe();
	}, []);

	if (!date) {
		return null;
	}

	return (
		<Tooltip>
			<Tooltip.Trigger className="outline-none">
				<time dateTime={date.toISOString()} {...props}>
					{timeString}
				</time>
			</Tooltip.Trigger>
			<Tooltip.Content showArrow={false}>{date.format("llll")}</Tooltip.Content>
		</Tooltip>
	);
}
