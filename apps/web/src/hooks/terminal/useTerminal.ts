import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Scenario {
  title: string;
  description: string;
  checkpoints: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
}

export interface UseTerminalReturn {
  sessionId: string | null;
  isConnected: boolean;
  scenario: Scenario | null;
  checkpoints: Record<string, boolean>;
  output: string | null;
  startSession: () => void;
  sendInput: (data: string) => void;
  resize: (rows: number, cols: number) => void;
  validateCheckpoint: (checkpointId: string) => void;
  getHint: (hintIndex: number) => void;
  stopSession: () => void;
}

export const useTerminal = (
  userId: string,
  scenarioId: string,
  existingSessionId?: string,
): UseTerminalReturn => {
  const [sessionId, setSessionId] = useState<string | null>(
    existingSessionId || null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [checkpoints, setCheckpoints] = useState<Record<string, boolean>>({});
  const [output, setOutput] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to terminal service
    const socket = io(
      process.env.NEXT_PUBLIC_TERMINAL_SERVICE_URL ||
        'http://localhost:3007/terminal',
      {
        withCredentials: true,
      },
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to terminal service');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from terminal service');
      setIsConnected(false);
    });

    socket.on('session-started', (data: { sessionId: string; scenario: Scenario }) => {
      console.log('Session started:', data.sessionId);
      setSessionId(data.sessionId);
      setScenario(data.scenario);

      // Initialize checkpoints
      const initialCheckpoints: Record<string, boolean> = {};
      data.scenario.checkpoints.forEach((cp) => {
        initialCheckpoints[cp.id] = false;
      });
      setCheckpoints(initialCheckpoints);
    });

    socket.on('terminal-output', (data: { sessionId: string; data: string }) => {
      setOutput(data.data);
    });

    socket.on('checkpoint-validated', (data: {
      sessionId: string;
      checkpointId: string;
      isValid: boolean;
    }) => {
      console.log('Checkpoint validated:', data.checkpointId, data.isValid);
      setCheckpoints((prev) => ({
        ...prev,
        [data.checkpointId]: data.isValid,
      }));
    });

    socket.on('scenario-completed', (data: { sessionId: string }) => {
      console.log('Scenario completed!');
      // You can emit an event or show a success message here
    });

    socket.on('hint', (data: { sessionId: string; hint: string; index: number }) => {
      console.log('Hint:', data.hint);
      // Show hint to user
      setOutput(`\r\n💡 Hint: ${data.hint}\r\n`);
    });

    socket.on('session-stopped', (data: { sessionId: string }) => {
      console.log('Session stopped');
      setSessionId(null);
      setIsConnected(false);
    });

    socket.on('terminal-closed', (data: { sessionId: string }) => {
      console.log('Terminal closed');
      setSessionId(null);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Terminal error:', data.message);
      setOutput(`\r\n❌ Error: ${data.message}\r\n`);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, scenarioId]);

  const startSession = useCallback(() => {
    if (socketRef.current && !sessionId) {
      console.log('Starting session...');
      socketRef.current.emit('start-session', { userId, scenarioId });
    }
  }, [userId, scenarioId, sessionId]);

  const sendInput = useCallback(
    (data: string) => {
      if (socketRef.current && sessionId) {
        socketRef.current.emit('terminal-input', { sessionId, data });
      }
    },
    [sessionId],
  );

  const resize = useCallback(
    (rows: number, cols: number) => {
      if (socketRef.current && sessionId) {
        socketRef.current.emit('terminal-resize', { sessionId, rows, cols });
      }
    },
    [sessionId],
  );

  const validateCheckpoint = useCallback(
    (checkpointId: string) => {
      if (socketRef.current && sessionId) {
        socketRef.current.emit('validate-checkpoint', {
          sessionId,
          checkpointId,
        });
      }
    },
    [sessionId],
  );

  const getHint = useCallback(
    (hintIndex: number) => {
      if (socketRef.current && sessionId) {
        socketRef.current.emit('get-hint', { sessionId, hintIndex });
      }
    },
    [sessionId],
  );

  const stopSession = useCallback(() => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('stop-session', { sessionId });
      setSessionId(null);
    }
  }, [sessionId]);

  return {
    sessionId,
    isConnected,
    scenario,
    checkpoints,
    output,
    startSession,
    sendInput,
    resize,
    validateCheckpoint,
    getHint,
    stopSession,
  };
};
