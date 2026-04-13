"use client";

import React, { useState, useEffect } from "react";

interface StatProps {
  targetValue: number;
  duration?: number;
  unit?: string;
  color?: string;
}

const RenderStat: React.FC<StatProps> = ({ targetValue, unit = "", duration = 800, color = "text-white" }) => {
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(Math.floor(eased * (targetValue - startValue) + startValue));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return (
    <div className="flex items-end gap-1">
      <span className={`text-5xl font-bold tabular-nums leading-none ${color}`}>{currentValue}</span>
      {unit && <span className={`text-lg font-medium mb-1 ${color} opacity-80`}>{unit}</span>}
    </div>
  );
};

export default RenderStat;
