import { useState, useEffect } from "react";

/**
 * Isolated timer countdown state machine engine
 * @param {number} focusTime - Focus duration in minutes (default 25)
 * @param {number} breakTime - Break duration in minutes (default 5)
 */
export default function useTimer(focusTime = 25, breakTime = 5) {
  const [secondsLeft, setSecondsLeft] = useState(focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus"); // 'focus' or 'break'

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prevSeconds) => {
          if (prevSeconds <= 1) {
            // Toggle modes smoothly when reaching zero
            if (mode === "focus") {
              setMode("break");
              return breakTime * 60;
            } else {
              setMode("focus");
              return focusTime * 60;
            }
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    // Strict cleanup function to eliminate memory leaks on route changes or pauses
    return () => clearInterval(interval);
  }, [isRunning, mode, focusTime, breakTime]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setMode("focus");
    setSecondsLeft(focusTime * 60);
  };

  return {
    secondsLeft,
    isRunning,
    mode,
    start,
    pause,
    reset,
  };
}
