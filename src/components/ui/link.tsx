import {
  Link as LinkPrimitive,
  type LinkProps as LinkPrimitiveProps,
  composeRenderProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"

const linkStyles = tv({
  base: "outline-0 outline-offset-2 transition-[color,_opacity] focus-visible:outline-2 focus-visible:outline-ring forced-colors:outline-[Highlight]",
  variants: {
    intent: {
      unstyled: "text-current",
      primary: "text-primary hover:underline",
      secondary: "text-secondary-fg hover:underline",
    },
    isDisabled: {
      true: "cursor-default opacity-60 forced-colors:disabled:text-[GrayText]",
    },
  },
  defaultVariants: {
    intent: "unstyled",
  },
})

interface LinkProps extends LinkPrimitiveProps {
  intent?: "primary" | "secondary" | "unstyled"
  ref?: React.RefObject<HTMLAnchorElement>
}

const Link = ({ className, ref, ...props }: LinkProps) => {
  return (
    <LinkPrimitive
      ref={ref}
      {...props}
      className={composeRenderProps(className, (className, renderProps) =>
        linkStyles({ ...renderProps, intent: props.intent, className }),
      )}
    >
      {(values) => (
        <>{typeof props.children === "function" ? props.children(values) : props.children}</>
      )}
    </LinkPrimitive>
  )
}

export type { LinkProps }
export { Link, linkStyles }
