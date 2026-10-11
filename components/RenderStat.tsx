"use client";

import React, { useState, useEffect } from "react";
import { prefersReducedMotion } from "../utils/motion";

interface StatProps {
  targetValue: number;
  duration?: number;
  unit?: string;
  color?: string;
}

const RenderStat: React.FC<StatProps> = ({ targetValue, unit = "", duration = 800, color = "text-ink" }) => {
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCurrentValue(targetValue);
      return;
    }
    let start: number | null = null;
    let frameId = 0;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(Math.floor(eased * (targetValue - startValue) + startValue));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration]);

  return (
    <div className="flex items-end gap-1">
      <span className={`text-5xl font-bold tabular-nums leading-none ${color}`}>{currentValue}</span>
      {unit && <span className={`text-lg font-medium mb-1 ${color} opacity-80`}>{unit}</span>}
    </div>
  );
};

export default RenderStat;
