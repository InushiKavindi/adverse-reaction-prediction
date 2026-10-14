import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-white shadow-xs hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success:
          "border-emerald-400 bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
        warning:
          "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
        sky:
          "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100",
        pink:
          "border-pink-200 bg-pink-50 text-[#ff2d78] hover:bg-pink-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
