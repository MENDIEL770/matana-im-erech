"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {

    const base =
      "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#2E2A26] text-white hover:bg-[#B08D57]",
      gold:
        "bg-[#B08D57] text-white hover:bg-[#9a7a48]",
      secondary:
        "bg-[#FAF8F5] text-[#2E2A26] border border-[#ECE8E2] hover:bg-[#E9E2D8]",
      outline:
        "border border-[#2E2A26] text-[#2E2A26] hover:bg-[#2E2A26] hover:text-white",
      ghost:
        "text-[#6B6763] hover:text-[#2E2A26] hover:bg-[#FAF8F5]",
      danger:
        "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "text-xs px-4 py-2 gap-1.5",
      md: "text-sm px-6 py-2.5 gap-2",
      lg: "text-sm px-10 py-4 gap-2 tracking-widest uppercase",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
