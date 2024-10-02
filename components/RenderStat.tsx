import React, { useState, useEffect } from "react";

interface StatProps {
  targetValue: number;
  duration?: number;
  unit: string;
}

const RenderStat: React.FC<StatProps> = ({ targetValue, unit, duration = 1000 }) => {
  const [currentValue, setCurrentValue] = useState<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const newValue = Math.min(
        Math.floor((progress / duration) * (targetValue - startValue)) + startValue,
        targetValue
      );
      setCurrentValue(newValue);

      if (newValue < targetValue) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return (
    <div className="flex justify-center items-center">
        <span className="text-7xl">{currentValue}</span>
        <span className="relative top-8">{unit}</span>
    </div>
  );
};

export default RenderStat;
