import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-tight relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:from-primary-dark hover:to-primary shadow-business hover:shadow-business-lg hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground hover:from-red-600 hover:to-red-700 shadow-business hover:shadow-business-lg hover:scale-[1.02] active:scale-[0.98]",
        success:
          "bg-gradient-to-r from-success to-green-600 text-success-foreground hover:from-green-600 hover:to-green-700 shadow-business hover:shadow-business-lg hover:scale-[1.02] active:scale-[0.98]",
        warning:
          "bg-gradient-to-r from-warning to-orange-600 text-warning-foreground hover:from-orange-600 hover:to-orange-700 shadow-business hover:shadow-business-lg hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-gray-200 dark:border-gray-700 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 shadow-business hover:shadow-business-md hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary-hover text-secondary-foreground hover:from-secondary-hover hover:to-muted shadow-business hover:shadow-business-md hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
