import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

// Grid Background Component
export const GridBackground = ({
  className,
  children,
  gridSize = 50,
  gridColor = "#e4e4e7",
  darkGridColor = "#555555",
  showFade = false,
  fadeIntensity = 20,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative w-full min-h-screen bg-white dark:bg-black transition-colors duration-300",
        className
      )}
      style={{
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundImage: `radial-gradient(circle, var(--dot-color) 2px, transparent 2px)`,
        backgroundPosition: '0 0',
      }}
      {...props}
    >
      {showFade && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white dark:bg-black"
          style={{
            maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
            WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
            zIndex: 5,
          }}
        />
      )}

      <div className="relative w-full min-h-screen" style={{zIndex: 10}}>{children}</div>
    </div>
  );
};

export default GridBackground;
