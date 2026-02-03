"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PortraitImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Client component for rendering MP portrait images with graceful fallback.
 * Shows a placeholder silhouette when the image fails to load.
 * @param src - Image source URL
 * @param alt - Alt text for the image
 * @param size - Size variant: sm (64px), md (80px), lg (112px)
 */
export default function PortraitImage({
  src,
  alt,
  size = "md",
}: PortraitImageProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-base-300 shrink-0",
        sizeClasses[size]
      )}
    >
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-base-300">
          <svg
            className="w-1/2 h-1/2 text-base-content/30"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
