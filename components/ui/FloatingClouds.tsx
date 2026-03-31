"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Cloud {
  id: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  direction: "ltr" | "rtl";
  blur: number;
}

interface FloatingCloudsProps {
  number?: number;
  className?: string;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
}

function generateClouds(count: number, minSize: number, maxSize: number, minSpeed: number, maxSpeed: number): Cloud[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 90,
    size: Math.random() * (maxSize - minSize) + minSize,
    opacity: Math.random() * 0.4 + 0.08,
    duration: Math.random() * (maxSpeed - minSpeed) + minSpeed,
    delay: Math.random() * -30,
    direction: Math.random() > 0.5 ? "ltr" : "rtl",
    blur: Math.random() * 3,
  }));
}

export function FloatingClouds({
  number = 15,
  className,
  minSize = 24,
  maxSize = 72,
  minSpeed = 20,
  maxSpeed = 50,
}: FloatingCloudsProps) {
  const [clouds, setClouds] = useState<Cloud[]>([]);

  useEffect(() => {
    setClouds(generateClouds(number, minSize, maxSize, minSpeed, maxSpeed));
  }, [number, minSize, maxSize, minSpeed, maxSpeed]);

  return (
    <>
      <style>{`
        @keyframes cloud-ltr {
          0%   { transform: translateX(-120px); }
          100% { transform: translateX(calc(100vw + 120px)); }
        }
        @keyframes cloud-rtl {
          0%   { transform: translateX(calc(100vw + 120px)); }
          100% { transform: translateX(-120px); }
        }
      `}</style>
      <div
        className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
        aria-hidden="true"
      >
        {clouds.map((cloud) => (
          <span
            key={cloud.id}
            style={{
              position: "absolute",
              top: `${cloud.top}%`,
              left: 0,
              fontSize: `${cloud.size}px`,
              opacity: cloud.opacity,
              filter: `blur(${cloud.blur}px)`,
              lineHeight: 1,
              userSelect: "none",
              animation: `${cloud.direction === "ltr" ? "cloud-ltr" : "cloud-rtl"} ${cloud.duration}s linear ${cloud.delay}s infinite`,
              willChange: "transform",
            }}
          >
            ☁️
          </span>
        ))}
      </div>
    </>
  );
}
