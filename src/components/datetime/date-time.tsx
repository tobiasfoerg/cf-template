import { Tooltip } from "@/components/ui";
import dayjs from "dayjs";

export interface DateTimeProps extends Omit<React.HTMLAttributes<HTMLTimeElement>, "children"> {
	value: dayjs.ConfigType;
}

export function DateTime({ value, ...props }: DateTimeProps) {
	const date = dayjs(value);

	if (!date) {
		return null;
	}

	return (
		<Tooltip>
			<Tooltip.Trigger className="outline-none">
				<time dateTime={date.toISOString()} {...props}>
					{date.format("llll")}
				</time>
			</Tooltip.Trigger>
			<Tooltip.Content showArrow={false}>{date.format("llll")}</Tooltip.Content>
		</Tooltip>
	);
}
