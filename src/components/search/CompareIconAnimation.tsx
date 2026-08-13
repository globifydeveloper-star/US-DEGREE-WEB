"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function CompareIconAnimation({
  active,
  hovered,
}: {
  active: boolean;
  hovered?: boolean;
}) {
  // Drive the animation straight from props — framer-motion replays the
  // "animate" keyframes when the variant changes to it on hover/active, and the
  // keyframes settle to the same end state as idle/active, so no extra state or
  // timed reset is needed.
  const isAnimating = hovered || active;

  // Framer Motion variants
  const backCardVariants: Variants = {
    idle: { x: 0, y: 0, scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 0.9, 1.05, 1],
      opacity: 0.8,
      transition: { duration: 0.5 },
    },
  };

  const frontCardVariants: Variants = {
    idle: { x: -3, y: 3, opacity: 0, scale: 0.8 },
    active: { x: 0, y: 0, opacity: 1, scale: 1, transition: { duration: 0.3 } },
    animate: {
      x: [-3, 0],
      y: [3, 0],
      opacity: [0, 1],
      scale: [0.8, 1.1, 1],
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const dashVariants1: Variants = {
    idle: { opacity: 0, scale: 0, x: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0.3, 1, 0.5],
      x: [0, 5],
      y: [0, -5],
      transition: { duration: 0.5, delay: 0.1, ease: "easeOut" },
    },
  };

  const dashVariants2: Variants = {
    idle: { opacity: 0, scale: 0, x: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0.3, 1, 0.5],
      x: [0, 6],
      y: [0, -1],
      transition: { duration: 0.5, delay: 0.15, ease: "easeOut" },
    },
  };

  const dashVariants3: Variants = {
    idle: { opacity: 0, scale: 0, x: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0.3, 1, 0.5],
      x: [0, 2],
      y: [0, -6],
      transition: { duration: 0.5, delay: 0.08, ease: "easeOut" },
    },
  };

  return (
    <div className="relative w-4 h-4 flex items-center justify-center select-none pointer-events-none overflow-visible">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full overflow-visible"
      >
        {/* Back Card (Static copy-1) */}
        <motion.rect
          x="3"
          y="7"
          width="11"
          height="13"
          rx="2"
          variants={backCardVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          className="text-current"
        />

        {/* Front Card (Animating copy-2) */}
        <motion.rect
          x="8"
          y="3"
          width="11"
          height="13"
          rx="2"
          variants={frontCardVariants}
          initial="idle"
          animate={isAnimating ? "animate" : active ? "active" : "idle"}
          className="text-current"
        />

        {/* Dash Sparks shooting from top right of front card (around x=19, y=3) */}
        <motion.line
          x1="19"
          y1="3"
          x2="22"
          y2="0"
          strokeWidth="1.5"
          variants={dashVariants1}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          className="text-blue-500"
        />
        <motion.line
          x1="19"
          y1="5"
          x2="23"
          y2="5"
          strokeWidth="1.5"
          variants={dashVariants2}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          className="text-blue-500"
        />
        <motion.line
          x1="18"
          y1="2"
          x2="20"
          y2="-1"
          strokeWidth="1.5"
          variants={dashVariants3}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          className="text-blue-500"
        />
      </svg>
    </div>
  );
}
