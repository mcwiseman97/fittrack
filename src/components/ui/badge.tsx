import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        purple: "border-transparent bg-neon-purple/20 text-neon-purple border border-neon-purple/30",
        blue: "border-transparent bg-neon-blue/20 text-neon-blue border border-neon-blue/30",
        green: "border-transparent bg-neon-green/20 text-neon-green border border-neon-green/30",
        orange: "border-transparent bg-neon-orange/20 text-neon-orange border border-neon-orange/30",
        red: "border-transparent bg-neon-red/20 text-neon-red border border-neon-red/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
