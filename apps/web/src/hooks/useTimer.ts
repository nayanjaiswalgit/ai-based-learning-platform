import { useEffect, useRef, useState, useCallback } from 'react';

export interface TimerConfig {
  initialTime: number; // in seconds
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  autoStart?: boolean;
  countDown?: boolean;
}

export interface TimerState {
  timeLeft: number;
  timeElapsed: number;
  isRunning: boolean;
  isCompleted: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
}

export function useTimer(config: TimerConfig): TimerState {
  const {
    initialTime,
    onComplete,
    onTick,
    autoStart = false,
    countDown = true,
  } = config;

  const [timeLeft, setTimeLeft] = useState(countDown ? initialTime : 0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!isCompleted) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  }, [isCompleted]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isCompleted) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  }, [isCompleted]);

  const reset = useCallback(() => {
    clearTimer();
    setTimeLeft(countDown ? initialTime : 0);
    setTimeElapsed(0);
    setIsRunning(false);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
  }, [initialTime, countDown, clearTimer]);

  const addTime = useCallback((seconds: number) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  }, []);

  useEffect(() => {
    if (isRunning && !isCompleted) {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTimeRef.current) / 1000);

        setTimeElapsed((prev) => prev + 1);

        if (countDown) {
          setTimeLeft((prev) => {
            const newTime = Math.max(0, prev - 1);

            if (newTime === 0) {
              setIsCompleted(true);
              setIsRunning(false);
              clearTimer();
              onComplete?.();
            }

            onTick?.(newTime);
            return newTime;
          });
        } else {
          setTimeLeft((prev) => {
            const newTime = prev + 1;

            if (newTime >= initialTime) {
              setIsCompleted(true);
              setIsRunning(false);
              clearTimer();
              onComplete?.();
            }

            onTick?.(newTime);
            return newTime;
          });
        }

        // Update start time for next iteration
        startTimeRef.current = currentTime;
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [
    isRunning,
    isCompleted,
    countDown,
    initialTime,
    onComplete,
    onTick,
    clearTimer,
  ]);

  return {
    timeLeft,
    timeElapsed,
    isRunning,
    isCompleted,
    start,
    pause,
    resume,
    reset,
    addTime,
  };
}

// Utility function to format time
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Utility function to get time color based on percentage left
export function getTimeColor(timeLeft: number, totalTime: number): string {
  const percentage = (timeLeft / totalTime) * 100;

  if (percentage > 50) return 'text-green-600';
  if (percentage > 25) return 'text-yellow-600';
  if (percentage > 10) return 'text-orange-600';
  return 'text-red-600';
}
