import { useState, useEffect, useRef } from "react";

export function useTimer(initialSeconds = 1500) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = () => {
    if (!isRunning) setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = (secs = initialSeconds) => {
    setIsRunning(false);
    setSecondsRemaining(secs);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // Cleanup [cite: 143]
    };
  }, [isRunning]);

  return {
    secondsRemaining,
    isRunning,
    start,
    pause,
    reset,
    setSecondsRemaining,
  };
}
