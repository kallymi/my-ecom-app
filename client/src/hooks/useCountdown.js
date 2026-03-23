import { useEffect, useState } from "react";

export default function useCountdown(targetDate) {
  const calculate = () => {
    const now = new Date().getTime();
    const end = new Date(targetDate).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculate());

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const updated = calculate();
      if (!updated) {
        clearInterval(interval);
      }
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}