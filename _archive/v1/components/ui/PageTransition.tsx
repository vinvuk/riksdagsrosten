"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Props for the PageTransition component.
 * @property children - Content to animate
 */
interface PageTransitionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
}

/**
 * Wraps page content in a framer-motion fade+slide-up animation.
 * Use at the top level of page components for smooth transitions.
 * @param props - Children to wrap and optional motion div props
 * @returns An animated wrapper div
 */
export default function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
