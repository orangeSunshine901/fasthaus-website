"use client";

import Marquee from "./marquee";
import { cn } from "@/lib/utils";

interface AnnouncementRibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Content to scroll in the ribbon. Accepts any React node.
   * Defaults to the May 2026 changelog announcement.
   */
  message?: React.ReactNode;

  /**
   * Number of times the message is repeated to fill the track.
   * @default 5
   */
  repeat?: number;

  /**
   * Pause scrolling when the user hovers over the ribbon.
   * @default true
   */
  pauseOnHover?: boolean;
}

function DefaultMessage() {
  return (
    <span>
      <span className="whitespace-nowrap px-12 font-(family-name:--font-display) font-light text-neutral-900">
        New components and live demos
      </span>
      <span className="text-neutral-900">&middot;</span>
    </span>
  );
}

export default function AnnouncementRibbon({
  message,
  repeat = 5,
  pauseOnHover = true,
  className,
  ...props
}: AnnouncementRibbonProps) {
  const content = message ?? <DefaultMessage />;

  return (
    <div
      className={cn(
        "relative flex h-11 w-full items-center overflow-hidden",
        "bg-[#ff7a1a]",
        "border-b border-black/8",
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-hidden">
        <Marquee repeat={repeat} applyMask={false}>
          {content}
        </Marquee>
      </div>
    </div>
  );
}
