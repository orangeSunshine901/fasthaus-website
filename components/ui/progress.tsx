"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: number;
  orientation?: "horizontal" | "vertical";
};

function clampProgress(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, orientation = "horizontal", ...props }, ref) => {
    const progress = clampProgress(value);
    const isVertical = orientation === "vertical";

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        data-orientation={orientation}
        className={cn(
          "relative overflow-hidden rounded-full bg-[var(--color-border)]",
          isVertical ? "h-full w-1.5" : "h-2 w-full",
          className
        )}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className={cn(
            "absolute rounded-full bg-[var(--color-accent-amber)] transition-all duration-150 ease-out",
            isVertical ? "left-0 top-0 w-full" : "left-0 top-0 h-full"
          )}
          style={isVertical ? { height: `${progress}%` } : { width: `${progress}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
