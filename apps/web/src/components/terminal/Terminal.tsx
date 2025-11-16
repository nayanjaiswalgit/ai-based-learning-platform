'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { useTerminal } from '@/hooks/terminal/useTerminal';

export interface TerminalProps {
  sessionId?: string;
  userId: string;
  scenarioId: string;
  theme?: 'dark' | 'light';
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onCheckpointComplete?: (checkpointId: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  sessionId: existingSessionId,
  userId,
  scenarioId,
  theme = 'dark',
  onSessionStart,
  onSessionEnd,
  onCheckpointComplete,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    sessionId,
    isConnected,
    scenario,
    checkpoints,
    startSession,
    sendInput,
    resize,
    validateCheckpoint,
    getHint,
    stopSession,
    output,
  } = useTerminal(userId, scenarioId, existingSessionId);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      fontSize,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme:
        theme === 'dark'
          ? {
              background: '#1e1e1e',
              foreground: '#d4d4d4',
              cursor: '#ffffff',
              selection: '#264f78',
              black: '#000000',
              red: '#cd3131',
              green: '#0dbc79',
              yellow: '#e5e510',
              blue: '#2472c8',
              magenta: '#bc3fbc',
              cyan: '#11a8cd',
              white: '#e5e5e5',
              brightBlack: '#666666',
              brightRed: '#f14c4c',
              brightGreen: '#23d18b',
              brightYellow: '#f5f543',
              brightBlue: '#3b8eea',
              brightMagenta: '#d670d6',
              brightCyan: '#29b8db',
              brightWhite: '#ffffff',
            }
          : {
              background: '#ffffff',
              foreground: '#000000',
              cursor: '#000000',
              selection: '#add6ff',
              black: '#000000',
              red: '#cd3131',
              green: '#00bc00',
              yellow: '#949800',
              blue: '#0451a5',
              magenta: '#bc05bc',
              cyan: '#0598bc',
              white: '#555555',
              brightBlack: '#666666',
              brightRed: '#cd3131',
              brightGreen: '#14ce14',
              brightYellow: '#b5ba00',
              brightBlue: '#0451a5',
              brightMagenta: '#bc05bc',
              brightCyan: '#0598bc',
              brightWhite: '#a5a5a5',
            },
      scrollback: 1000,
      tabStopWidth: 4,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Handle input
    xterm.onData((data) => {
      sendInput(data);
    });

    // Handle paste
    xterm.onPaste((data) => {
      sendInput(data.data);
    });

    // Auto-fit on window resize
    const handleResize = () => {
      fitAddon.fit();
      if (sessionId) {
        resize(xterm.rows, xterm.cols);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, [theme, fontSize]);

  // Write output to terminal
  useEffect(() => {
    if (output && xtermRef.current) {
      xtermRef.current.write(output);
    }
  }, [output]);

  // Handle session start
  useEffect(() => {
    if (sessionId && onSessionStart) {
      onSessionStart(sessionId);
    }
  }, [sessionId, onSessionStart]);

  // Auto-start session
  useEffect(() => {
    if (!existingSessionId && userId && scenarioId) {
      startSession();
    }
  }, [userId, scenarioId, existingSessionId]);

  // Handle font size changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.fontSize = fontSize;
      fitAddonRef.current?.fit();
    }
  }, [fontSize]);

  const handleClear = () => {
    xtermRef.current?.clear();
  };

  const handleCopy = () => {
    const selection = xtermRef.current?.getSelection();
    if (selection) {
      navigator.clipboard.writeText(selection);
    }
  };

  const handleFontSizeIncrease = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const handleFontSizeDecrease = () => {
    setFontSize((prev) => Math.max(prev - 2, 10));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`terminal-container ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : '600px',
        width: '100%',
        border: '1px solid #333',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Terminal Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f0f0f0',
          borderBottom: '1px solid #333',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            Terminal
          </span>
          <span
            style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#888' : '#666',
            }}
          >
            {scenario?.title || 'Loading...'}
          </span>
          {isConnected && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#0dbc79',
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleFontSizeDecrease}
            title="Decrease font size"
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            A-
          </button>
          <button
            onClick={handleFontSizeIncrease}
            title="Increase font size"
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            A+
          </button>
          <button
            onClick={handleClear}
            title="Clear terminal"
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            title="Copy selection"
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            Copy
          </button>
          <button
            onClick={handleFullscreen}
            title="Toggle fullscreen"
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#000',
            }}
          >
            {isFullscreen ? '⊟' : '⊡'}
          </button>
          <button
            onClick={stopSession}
            title="Stop session"
            style={{
              padding: '4px 8px',
              background: '#cd3131',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Terminal Display */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '8px',
          overflow: 'hidden',
        }}
      />

      {/* Checkpoints */}
      {scenario && scenario.checkpoints && scenario.checkpoints.length > 0 && (
        <div
          style={{
            padding: '12px',
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f0f0f0',
            borderTop: '1px solid #333',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            Checkpoints
          </div>
          {scenario.checkpoints.map((checkpoint, index) => (
            <div
              key={checkpoint.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                marginBottom: '4px',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                borderRadius: '4px',
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: checkpoints[checkpoint.id]
                    ? '#0dbc79'
                    : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#fff',
                }}
              >
                {checkpoints[checkpoint.id] ? '✓' : index + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {checkpoint.title}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {checkpoint.description}
                </div>
              </div>
              <button
                onClick={() => validateCheckpoint(checkpoint.id)}
                disabled={checkpoints[checkpoint.id]}
                style={{
                  padding: '4px 12px',
                  backgroundColor: checkpoints[checkpoint.id]
                    ? '#666'
                    : '#2472c8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: checkpoints[checkpoint.id] ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {checkpoints[checkpoint.id] ? 'Completed' : 'Validate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
