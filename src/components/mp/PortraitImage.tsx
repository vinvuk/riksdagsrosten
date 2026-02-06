"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortraitImageProps {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "size-8",
  sm: "size-10",
  md: "size-16",
  lg: "size-24",
} as const;

/**
 * Portrait image with automatic fallback to a generic person icon on error.
 * Uses rounded-full for circular crop. Supports four size variants.
 * @param src - Image URL (typically /portraits/{id}.jpg)
 * @param alt - Alt text for accessibility
 * @param size - Size variant: xs (32px), sm (40px), md (64px), lg (96px)
 * @param className - Additional classes
 */
export default function PortraitImage({
  src,
  alt,
  size = "sm",
  className,
}: PortraitImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700",
          sizeMap[size],
          className
        )}
      >
        <User
          aria-hidden="true"
          className={cn(
            "text-zinc-400 dark:text-zinc-500",
            size === "xs" && "size-4",
            size === "sm" && "size-5",
            size === "md" && "size-8",
            size === "lg" && "size-12"
          )}
        />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn(
        "shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 object-cover",
        sizeMap[size],
        className
      )}
    />
  );
}
