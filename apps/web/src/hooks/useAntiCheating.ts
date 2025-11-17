import { useEffect, useRef, useState, useCallback } from 'react';

export interface AntiCheatingConfig {
  detectTabSwitch?: boolean;
  detectCopyPaste?: boolean;
  detectRightClick?: boolean;
  detectDevTools?: boolean;
  detectFullscreenExit?: boolean;
  maxTabSwitches?: number;
  maxCopyAttempts?: number;
  onViolation?: (violation: Violation) => void;
  onMaxViolations?: () => void;
}

export interface Violation {
  type:
    | 'TAB_SWITCH'
    | 'COPY_ATTEMPT'
    | 'PASTE_ATTEMPT'
    | 'RIGHT_CLICK'
    | 'DEV_TOOLS'
    | 'FULLSCREEN_EXIT';
  timestamp: number;
  count: number;
}

export interface AntiCheatingState {
  violations: Violation[];
  isFullscreen: boolean;
  isTabFocused: boolean;
  tabSwitchCount: number;
  copyAttemptCount: number;
  startFullscreen: () => Promise<void>;
  exitFullscreen: () => void;
}

export function useAntiCheating(
  config: AntiCheatingConfig = {},
): AntiCheatingState {
  const {
    detectTabSwitch = true,
    detectCopyPaste = true,
    detectRightClick = true,
    detectDevTools = true,
    detectFullscreenExit = true,
    maxTabSwitches = 5,
    maxCopyAttempts = 3,
    onViolation,
    onMaxViolations,
  } = config;

  const [violations, setViolations] = useState<Violation[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyAttemptCount, setCopyAttemptCount] = useState(0);

  const devToolsCheckInterval = useRef<NodeJS.Timeout>();

  const recordViolation = useCallback(
    (type: Violation['type']) => {
      const violation: Violation = {
        type,
        timestamp: Date.now(),
        count:
          type === 'TAB_SWITCH'
            ? tabSwitchCount + 1
            : type === 'COPY_ATTEMPT'
              ? copyAttemptCount + 1
              : 1,
      };

      setViolations((prev) => [...prev, violation]);
      onViolation?.(violation);

      // Update counters
      if (type === 'TAB_SWITCH') {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        if (newCount >= maxTabSwitches) {
          onMaxViolations?.();
        }
      } else if (type === 'COPY_ATTEMPT' || type === 'PASTE_ATTEMPT') {
        const newCount = copyAttemptCount + 1;
        setCopyAttemptCount(newCount);
        if (newCount >= maxCopyAttempts) {
          onMaxViolations?.();
        }
      }
    },
    [
      tabSwitchCount,
      copyAttemptCount,
      maxTabSwitches,
      maxCopyAttempts,
      onViolation,
      onMaxViolations,
    ],
  );

  // Tab Switch Detection
  useEffect(() => {
    if (!detectTabSwitch) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabFocused(false);
        recordViolation('TAB_SWITCH');
      } else {
        setIsTabFocused(true);
      }
    };

    const handleBlur = () => {
      setIsTabFocused(false);
      recordViolation('TAB_SWITCH');
    };

    const handleFocus = () => {
      setIsTabFocused(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [detectTabSwitch, recordViolation]);

  // Copy/Paste Detection
  useEffect(() => {
    if (!detectCopyPaste) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('COPY_ATTEMPT');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('PASTE_ATTEMPT');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('COPY_ATTEMPT');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
    };
  }, [detectCopyPaste, recordViolation]);

  // Right Click Detection
  useEffect(() => {
    if (!detectRightClick) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation('RIGHT_CLICK');
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [detectRightClick, recordViolation]);

  // DevTools Detection (simple heuristic)
  useEffect(() => {
    if (!detectDevTools) return;

    let devToolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !devToolsOpen) {
        devToolsOpen = true;
        recordViolation('DEV_TOOLS');
      } else if (!widthThreshold && !heightThreshold && devToolsOpen) {
        devToolsOpen = false;
      }
    };

    devToolsCheckInterval.current = setInterval(checkDevTools, 1000);

    return () => {
      if (devToolsCheckInterval.current) {
        clearInterval(devToolsCheckInterval.current);
      }
    };
  }, [detectDevTools, recordViolation]);

  // Fullscreen Detection
  useEffect(() => {
    if (!detectFullscreenExit) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isFullscreen) {
        recordViolation('FULLSCREEN_EXIT');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [detectFullscreenExit, isFullscreen, recordViolation]);

  // Fullscreen controls
  const startFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      if (devToolsCheckInterval.current) {
        clearInterval(devToolsCheckInterval.current);
      }
    };
  }, []);

  return {
    violations,
    isFullscreen,
    isTabFocused,
    tabSwitchCount,
    copyAttemptCount,
    startFullscreen,
    exitFullscreen,
  };
}
