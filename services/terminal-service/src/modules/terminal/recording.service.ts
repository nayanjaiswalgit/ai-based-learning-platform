import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TerminalFrame {
  timestamp: number;
  type: 'input' | 'output' | 'resize';
  data: any;
}

export interface Recording {
  sessionId: string;
  userId: string;
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  frames: TerminalFrame[];
  metadata?: Record<string, any>;
}

@Injectable()
export class RecordingService {
  private readonly logger = new Logger(RecordingService.name);
  private recordings: Map<string, Recording> = new Map();
  private recordingsDir: string;

  constructor(private configService: ConfigService) {
    this.recordingsDir = this.configService.get(
      'RECORDINGS_DIR',
      './recordings',
    );
    this.ensureRecordingsDir();
  }

  /**
   * Start recording a session
   */
  async startRecording(
    sessionId: string,
    userId: string,
    scenarioId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const recording: Recording = {
      sessionId,
      userId,
      scenarioId,
      startTime: new Date(),
      frames: [],
      metadata,
    };

    this.recordings.set(sessionId, recording);

    this.logger.log(`Started recording for session ${sessionId}`);
  }

  /**
   * Record a frame
   */
  recordFrame(
    sessionId: string,
    type: 'input' | 'output' | 'resize',
    data: any,
  ): void {
    const recording = this.recordings.get(sessionId);

    if (!recording) {
      return;
    }

    const frame: TerminalFrame = {
      timestamp: Date.now() - recording.startTime.getTime(),
      type,
      data,
    };

    recording.frames.push(frame);
  }

  /**
   * Stop recording and save
   */
  async stopRecording(sessionId: string): Promise<string> {
    const recording = this.recordings.get(sessionId);

    if (!recording) {
      throw new Error(`Recording for session ${sessionId} not found`);
    }

    recording.endTime = new Date();

    // Save to file
    const filename = await this.saveRecording(recording);

    // Remove from memory
    this.recordings.delete(sessionId);

    this.logger.log(`Stopped recording for session ${sessionId}`);

    return filename;
  }

  /**
   * Save recording to file
   */
  private async saveRecording(recording: Recording): Promise<string> {
    const filename = `${recording.sessionId}-${Date.now()}.json`;
    const filepath = path.join(this.recordingsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(recording, null, 2));

    this.logger.log(`Recording saved: ${filename}`);

    return filename;
  }

  /**
   * Load recording from file
   */
  async loadRecording(filename: string): Promise<Recording> {
    const filepath = path.join(this.recordingsDir, filename);

    const data = await fs.readFile(filepath, 'utf-8');
    const recording = JSON.parse(data);

    recording.startTime = new Date(recording.startTime);
    if (recording.endTime) {
      recording.endTime = new Date(recording.endTime);
    }

    return recording;
  }

  /**
   * List all recordings for a user
   */
  async listUserRecordings(userId: string): Promise<string[]> {
    const files = await fs.readdir(this.recordingsDir);

    const recordings = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const recording = await this.loadRecording(file);
        if (recording.userId === userId) {
          recordings.push(file);
        }
      }
    }

    return recordings;
  }

  /**
   * Delete recording
   */
  async deleteRecording(filename: string): Promise<void> {
    const filepath = path.join(this.recordingsDir, filename);
    await fs.unlink(filepath);

    this.logger.log(`Recording deleted: ${filename}`);
  }

  /**
   * Ensure recordings directory exists
   */
  private async ensureRecordingsDir(): Promise<void> {
    try {
      await fs.access(this.recordingsDir);
    } catch {
      await fs.mkdir(this.recordingsDir, { recursive: true });
      this.logger.log(`Created recordings directory: ${this.recordingsDir}`);
    }
  }

  /**
   * Convert recording to asciicast format (for asciinema)
   */
  async exportToAsciicast(filename: string): Promise<string> {
    const recording = await this.loadRecording(filename);

    const asciicast = {
      version: 2,
      width: 80,
      height: 24,
      timestamp: Math.floor(recording.startTime.getTime() / 1000),
      env: {
        TERM: 'xterm-256color',
        SHELL: '/bin/bash',
      },
    };

    const events = recording.frames
      .filter((frame) => frame.type === 'output')
      .map((frame) => [frame.timestamp / 1000, 'o', frame.data]);

    const asciicastFile = {
      ...asciicast,
      events,
    };

    const asciicastFilename = filename.replace('.json', '.cast');
    const filepath = path.join(this.recordingsDir, asciicastFilename);

    // Write header
    await fs.writeFile(filepath, JSON.stringify(asciicast) + '\n');

    // Append events
    for (const event of events) {
      await fs.appendFile(filepath, JSON.stringify(event) + '\n');
    }

    this.logger.log(`Exported to asciicast: ${asciicastFilename}`);

    return asciicastFilename;
  }
}
