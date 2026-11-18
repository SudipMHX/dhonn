import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-xs hover:bg-foreground/90 active:bg-foreground/80 dark:bg-foreground dark:text-background",
        primary:
          "bg-indigo-600 text-white shadow-xs shadow-indigo-600/20 hover:bg-indigo-500 active:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500",
        outline:
          "border-border bg-card/60 text-foreground shadow-xs backdrop-blur-xs hover:border-border/80 hover:bg-secondary active:bg-secondary/70",
        secondary:
          "border border-border/40 bg-secondary text-secondary-foreground hover:border-border hover:bg-secondary/80 active:bg-secondary/60",
        ghost:
          "text-foreground/80 hover:bg-secondary/80 hover:text-foreground active:bg-secondary",
        destructive:
          "border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white dark:bg-destructive/20 dark:hover:bg-destructive dark:hover:text-white",
        link: "h-auto p-0 text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
        subtle:
          "border border-indigo-200/50 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 active:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70",
      },
      size: {
        xs: "h-7 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium [&_svg:not([class*='size-'])]:size-3.5",
        default:
          "h-9 gap-2 rounded-xl px-3.5 text-sm font-medium [&_svg:not([class*='size-'])]:size-4",
        md: "h-10 gap-2 rounded-xl px-4 text-sm font-medium [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 gap-2.5 rounded-xl px-5 text-sm font-medium sm:text-base [&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-9 rounded-xl p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-7 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg":
          "size-10 rounded-xl p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
