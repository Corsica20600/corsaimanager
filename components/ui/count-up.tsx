"use client";

import { useEffect, useMemo, useState } from "react";

type CountUpProps = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
};

export function CountUp({ value, duration = 1200, prefix = "", suffix = "" }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const target = useMemo(() => Math.max(0, value), [value]);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
