import { cn } from "@/utils/classes";
import spriteHref from "./icons/icon.svg";
import type { IconName } from "./icons/types";

interface IconRawProps extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
	name: IconName;
}

export function IconRaw({ name, className, ...props }: IconRawProps) {
	return (
		<svg
			role="graphics-symbol img"
			className={cn("inline-block flex-shrink-0", className)}
			data-name={name}
			data-slot="icon"
			width={24}
			height={24}
			{...props}
		>
			<use href={`${spriteHref}#${name}`} />
		</svg>
	);
}

export interface IconProps extends IconRawProps {
	children?: React.ReactNode;
}

export function Icon({ name, children, className, ...props }: IconProps) {
	if (children) {
		return (
			<span className="inline-flex items-center gap-x-[1ch]">
				<Icon name={name} {...props} className={cn("size-[1em] text-muted-foreground", className)} />
				<span>{children}</span>
			</span>
		);
	}

	return <IconRaw name={name} {...props} className={cn("inline size-[1em] self-center text-[inherit]", className)} />;
}
