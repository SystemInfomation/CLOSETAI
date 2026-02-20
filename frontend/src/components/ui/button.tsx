"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-[#00f5ff]/80 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#00f5ff] to-[#00c8d6] text-black box-glow-cyan hover:shadow-[0_0_25px_rgba(0,245,255,0.6)]",
        "primary-lime":
          "bg-gradient-to-r from-[#39ff14] to-[#2ecc11] text-black box-glow-lime hover:shadow-[0_0_25px_rgba(57,255,20,0.6)]",
        secondary:
          "bg-transparent border border-[#00f5ff]/30 text-[#00f5ff] hover:bg-[#00f5ff]/10 hover:border-[#00f5ff]/50 hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]",
        outline:
          "bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20",
        ghost:
          "bg-transparent text-[#e0e0e0] hover:text-white hover:bg-white/5",
        destructive:
          "bg-[#ff0033]/20 text-[#ff0033] border border-[#ff0033]/30 hover:bg-[#ff0033]/30 hover:border-[#ff0033]/50",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        whileHover={{ scale: loading ? 1 : 1.04 }}
        whileTap={{ scale: loading ? 1 : 0.96 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
