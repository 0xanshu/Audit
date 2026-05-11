"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "~/lib/utils";

/* ─── Card ──────────────────────────────────────────────────────────────────── */

const cardVariants = cva("rounded-xl transition-all duration-200", {
  variants: {
    variant: {
      default: "bg-white border border-sand-200 shadow-sm hover:shadow-md",
      primary: "bg-white border border-sand-200 shadow-sm",
      glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-sm",
      flat: "bg-sand-50 border border-sand-200",
      borderless: "bg-transparent shadow-none border-none",
    },
    size: {
      default: "p-6",
      sm: "p-4",
      lg: "p-8",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size }), className)}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-4 space-y-1.5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-ink text-lg leading-tight font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sand-600 text-sm leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 flex items-center gap-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ─── Button ────────────────────────────────────────────────────────────────── */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] font-medium leading-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30",
  {
    variants: {
      variant: {
        default:
          "bg-aqua text-ink hover:bg-aqua-shade hover:text-white shadow-sm",
        primary:
          "bg-aqua text-ink hover:bg-aqua-shade hover:text-white shadow-sm",
        secondary:
          "bg-sand-200 text-ink hover:bg-sand-300 border border-sand-300",
        outline:
          "border border-sand-300 bg-transparent text-ink hover:bg-sand-100",
        ghost: "text-ink-soft hover:bg-sand-200",
        glass:
          "bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        link: "text-aqua underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-2.5 text-sm",
        sm: "px-4 py-1.5 text-xs",
        lg: "px-8 py-3.5 text-base",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const ButtonUI = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
ButtonUI.displayName = "ButtonUI";

/* ─── Badge ─────────────────────────────────────────────────────────────────── */

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-aqua-tint text-sea border border-aqua/20",
        primary: "bg-aqua text-ink",
        secondary: "bg-sand-200 text-sand-900",
        outline: "border border-sand-300 text-sand-600",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        danger: "bg-red-50 text-red-700 border border-red-200",
        ghost: "text-sand-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warning";
}

function StatCard({
  label,
  value,
  subtext,
  icon,
  tone = "default",
}: StatCardProps) {
  const toneStyles = {
    default: "bg-white border-black/0",
    success: "bg-emerald-50 border-emerald-200",
    warning: "bg-amber-50 border-amber-200",
  };

  return (
    <div className={cn("rounded-xl border p-6", toneStyles[tone])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sand-600 text-sm font-medium tracking-wide uppercase">
            {label}
          </p>
          <p className="text-ink mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>
          {subtext && <p className="text-sand-600 mt-1 text-sm">{subtext}</p>}
        </div>
        {icon && <div className="text-sand-400">{icon}</div>}
      </div>
    </div>
  );
}

/* ─── Input ─────────────────────────────────────────────────────────────────── */

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "border-sand-300 bg-sand-50 text-ink placeholder:text-sand-600 focus:ring-aqua h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:outline-none",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

/* ─── Label ─────────────────────────────────────────────────────────────────── */

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-ink text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

/* ─── Separator ───────────────────────────────────────────────────────────── */

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-sand-200 h-px", className)} {...props} />
));
Separator.displayName = "Separator";

/* ─── Exported ────────────────────────────────────────────────────────────── */

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ButtonUI as Button,
  ButtonUI,
  Badge,
  StatCard,
  Input,
  Label,
  Separator,
  cardVariants,
  badgeVariants,
};
