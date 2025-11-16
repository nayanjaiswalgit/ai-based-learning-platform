/**
 * Example: Using the Terminal Service
 *
 * This file demonstrates how to use the Terminal component and hooks
 */

import { Terminal } from '@/components/terminal/Terminal';
import { useTerminal } from '@/hooks/terminal/useTerminal';

// ============================================
// Example 1: Basic Terminal Usage
// ============================================

export function BasicTerminalExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Linux Basics Challenge</h1>
      <Terminal
        userId="user-123"
        scenarioId="scenario-linux-basics"
        theme="dark"
      />
    </div>
  );
}

// ============================================
// Example 2: Terminal with Recording
// ============================================

export function RecordedTerminalExample() {
  const handleSessionStart = (sessionId: string) => {
    console.log('Session started:', sessionId);
    console.log('Recording enabled for this session');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Git Basics with Recording</h1>
      <Terminal
        userId="user-123"
        scenarioId="scenario-git-basics"
        theme="dark"
        onSessionStart={handleSessionStart}
        enableRecording={true}
      />
    </div>
  );
}

// ============================================
// Example 3: Terminal with Checkpoint Tracking
// ============================================

export function TerminalWithCheckpointsExample() {
  const handleCheckpointComplete = (checkpointId: string) => {
    console.log('Checkpoint completed:', checkpointId);
    // You can trigger rewards, notifications, or update progress
  };

  const handleSessionEnd = () => {
    console.log('Session ended');
    // Redirect to summary page or show completion dialog
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Docker Basics Challenge</h1>
      <Terminal
        userId="user-123"
        scenarioId="scenario-docker-basics"
        theme="light"
        onCheckpointComplete={handleCheckpointComplete}
        onSessionEnd={handleSessionEnd}
      />
    </div>
  );
}

// ============================================
// Example 4: Custom Hook Usage
// ============================================

export function CustomTerminalImplementation() {
  const {
    sessionId,
    isConnected,
    scenario,
    checkpoints,
    startSession,
    validateCheckpoint,
    getHint,
    stopSession,
  } = useTerminal('user-123', 'scenario-k8s-basics');

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>{scenario?.title || 'Loading...'}</h1>
        <p>{scenario?.description}</p>

        <div style={{ marginTop: '10px' }}>
          <strong>Status: </strong>
          <span style={{ color: isConnected ? 'green' : 'red' }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {sessionId && (
          <div>
            <strong>Session ID: </strong>
            <code>{sessionId}</code>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={startSession}>Start Session</button>
        <button onClick={stopSession}>Stop Session</button>
        <button onClick={() => getHint(0)}>Get Hint</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Checkpoints</h3>
        {scenario?.checkpoints.map((cp, index) => (
          <div
            key={cp.id}
            style={{
              padding: '10px',
              marginBottom: '5px',
              backgroundColor: checkpoints[cp.id] ? '#d4edda' : '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <div>
              <strong>{index + 1}. {cp.title}</strong>
              {checkpoints[cp.id] && <span> ✓</span>}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {cp.description}
            </div>
            {!checkpoints[cp.id] && (
              <button
                onClick={() => validateCheckpoint(cp.id)}
                style={{ marginTop: '5px' }}
              >
                Validate
              </button>
            )}
          </div>
        ))}
      </div>

      {/* The actual terminal would be rendered here */}
      <div style={{ height: '400px', border: '1px solid #ddd' }}>
        {/* <Terminal component /> */}
      </div>
    </div>
  );
}

// ============================================
// Example 5: Shared Terminal Session
// ============================================

export function SharedTerminalExample() {
  const {
    sessionId,
    shareSession,
    joinSharedSession,
  } = useTerminal('instructor-123', 'scenario-aws-basics');

  const handleShareSession = () => {
    if (sessionId) {
      shareSession();
      // Copy share link to clipboard
      const shareLink = `${window.location.origin}/terminal/join/${sessionId}`;
      navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Instructor View - Shared Terminal</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleShareSession}>
          Share Session
        </button>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Share this terminal with students for live debugging
        </p>
      </div>

      <Terminal
        userId="instructor-123"
        scenarioId="scenario-aws-basics"
        theme="dark"
      />
    </div>
  );
}

// ============================================
// Example 6: Multiple Terminals (Side by Side)
// ============================================

export function MultipleTerminalsExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Compare Linux vs MacOS Commands</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Linux Terminal</h3>
          <Terminal
            userId="user-123"
            scenarioId="scenario-linux-basics"
            theme="dark"
          />
        </div>

        <div>
          <h3>Git Terminal</h3>
          <Terminal
            userId="user-123"
            scenarioId="scenario-git-basics"
            theme="light"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 7: Terminal with Custom Scenario
// ============================================

export async function createCustomScenario() {
  // This would be called from an admin/instructor interface
  const response = await fetch('http://localhost:3007/scenarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Custom Python Challenge',
      description: 'Learn Python basics with hands-on exercises',
      category: 'programming',
      difficulty: 'beginner',
      estimatedTime: 30,
      dockerImage: 'python:3.11-slim',
      checkpoints: [
        {
          id: 'cp1',
          title: 'Print Hello World',
          description: 'Create a Python file that prints "Hello World"',
          validationScript: 'return output.includes("Hello World");',
          order: 1,
        },
        {
          id: 'cp2',
          title: 'Create a Function',
          description: 'Define a function called greet()',
          validationScript: 'return output.includes("def greet");',
          order: 2,
        },
      ],
      hints: [
        'Use print() function to output text',
        'Functions start with the "def" keyword',
      ],
      createdBy: 'admin-123',
    }),
  });

  const scenario = await response.json();
  console.log('Created scenario:', scenario);
  return scenario;
}

// ============================================
// Example 8: WebSocket Direct Usage (Advanced)
// ============================================

import { io, Socket } from 'socket.io-client';

export class TerminalWebSocketClient {
  private socket: Socket;

  constructor(private userId: string, private scenarioId: string) {
    this.socket = io('http://localhost:3007/terminal', {
      withCredentials: true,
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to terminal service');
    });

    this.socket.on('session-started', (data) => {
      console.log('Session started:', data);
    });

    this.socket.on('terminal-output', (data) => {
      console.log('Output:', data.data);
    });

    this.socket.on('checkpoint-validated', (data) => {
      console.log('Checkpoint validated:', data);
    });

    this.socket.on('error', (data) => {
      console.error('Error:', data.message);
    });
  }

  startSession() {
    this.socket.emit('start-session', {
      userId: this.userId,
      scenarioId: this.scenarioId,
      enableRecording: true,
    });
  }

  sendInput(input: string) {
    this.socket.emit('terminal-input', {
      sessionId: 'your-session-id',
      data: input,
    });
  }

  validateCheckpoint(checkpointId: string) {
    this.socket.emit('validate-checkpoint', {
      sessionId: 'your-session-id',
      checkpointId,
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const client = new TerminalWebSocketClient('user-123', 'scenario-linux-basics');
client.startSession();
