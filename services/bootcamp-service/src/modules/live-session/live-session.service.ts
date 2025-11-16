import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ZoomIntegrationService } from './integrations/zoom.service';
import { GoogleMeetIntegrationService } from './integrations/google-meet.service';

@Injectable()
export class LiveSessionService {
  constructor(
    private prisma: PrismaService,
    private zoomService: ZoomIntegrationService,
    private googleMeetService: GoogleMeetIntegrationService,
  ) {}

  /**
   * Schedule a live session
   * Phase 3: Live session scheduling
   */
  async scheduleSession(data: {
    cohortId: string;
    title: string;
    sessionDate: Date;
    durationMinutes?: number;
    provider?: 'zoom' | 'google_meet';
    notes?: string;
  }) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: data.cohortId },
      include: { bootcamp: true },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    // Create meeting link based on provider
    let meetingLink = '';
    let meetingId = '';

    try {
      if (data.provider === 'zoom') {
        const meeting = await this.zoomService.createMeeting({
          topic: data.title,
          startTime: data.sessionDate,
          duration: data.durationMinutes || 90,
        });
        meetingLink = meeting.join_url;
        meetingId = meeting.id.toString();
      } else if (data.provider === 'google_meet') {
        const meeting = await this.googleMeetService.createMeeting({
          summary: data.title,
          startTime: data.sessionDate,
          duration: data.durationMinutes || 90,
        });
        meetingLink = meeting.hangoutLink;
        meetingId = meeting.id;
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
      // Continue without meeting link
    }

    const session = await this.prisma.cohortSession.create({
      data: {
        cohortId: data.cohortId,
        title: data.title,
        sessionDate: data.sessionDate,
        durationMinutes: data.durationMinutes || 90,
        meetingLink: meetingLink || 'TBD',
        notes: data.notes,
      },
      include: {
        cohort: {
          include: {
            bootcamp: true,
          },
        },
      },
    });

    // TODO: Send session reminders (integrate with Agent 11's notification service)

    return session;
  }

  /**
   * Get all sessions for a cohort
   */
  async findAllByCohort(cohortId: string, filters?: {
    upcoming?: boolean;
    past?: boolean;
  }) {
    const where: any = { cohortId };

    if (filters?.upcoming) {
      where.sessionDate = { gte: new Date() };
    } else if (filters?.past) {
      where.sessionDate = { lt: new Date() };
    }

    return this.prisma.cohortSession.findMany({
      where,
      include: {
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: {
        sessionDate: filters?.past ? 'desc' : 'asc',
      },
    });
  }

  /**
   * Get session details
   */
  async findOne(id: string) {
    const session = await this.prisma.cohortSession.findUnique({
      where: { id },
      include: {
        cohort: {
          include: {
            bootcamp: true,
            enrollments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        attendance: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * Update session
   */
  async update(id: string, data: Partial<{
    title: string;
    sessionDate: Date;
    durationMinutes: number;
    meetingLink: string;
    recordingUrl: string;
    notes: string;
  }>) {
    return this.prisma.cohortSession.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete session
   */
  async delete(id: string) {
    const session = await this.prisma.cohortSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.cohortSession.delete({ where: { id } });

    return { message: 'Session deleted successfully' };
  }

  /**
   * Record attendance
   * Phase 3: Attendance tracking
   */
  async recordAttendance(sessionId: string, userId: string, attended: boolean) {
    const session = await this.prisma.cohortSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const attendance = await this.prisma.sessionAttendance.upsert({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      update: {
        attended,
        leaveTime: attended ? new Date() : undefined,
      },
      create: {
        sessionId,
        userId,
        attended,
        joinTime: attended ? new Date() : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return attendance;
  }

  /**
   * Mark attendance as recorded
   */
  async markAttendanceRecorded(sessionId: string) {
    return this.prisma.cohortSession.update({
      where: { id: sessionId },
      data: { attendanceRecorded: true },
    });
  }

  /**
   * Get attendance report for a session
   */
  async getAttendanceReport(sessionId: string) {
    const session = await this.findOne(sessionId);

    const totalStudents = session.cohort.enrollments.filter(
      e => e.enrollmentStatus === 'active',
    ).length;

    const attendedCount = session.attendance.filter(a => a.attended).length;
    const attendanceRate = totalStudents > 0 ? (attendedCount / totalStudents) * 100 : 0;

    return {
      session: {
        id: session.id,
        title: session.title,
        sessionDate: session.sessionDate,
      },
      stats: {
        totalStudents,
        attended: attendedCount,
        absent: totalStudents - attendedCount,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      attendance: session.attendance,
    };
  }

  /**
   * Upload session recording
   * Phase 3: Session recordings storage
   */
  async uploadRecording(sessionId: string, recordingUrl: string) {
    const session = await this.prisma.cohortSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.cohortSession.update({
      where: { id: sessionId },
      data: { recordingUrl },
    });
  }

  /**
   * Get session recording
   * Phase 3: Recording playback for missed sessions
   */
  async getRecording(sessionId: string) {
    const session = await this.prisma.cohortSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        title: true,
        sessionDate: true,
        recordingUrl: true,
        durationMinutes: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.recordingUrl) {
      throw new NotFoundException('Recording not available for this session');
    }

    return session;
  }

  /**
   * Send session reminders (scheduled job)
   * Phase 3: Session reminders (email + push)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendUpcomingSessionReminders() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find sessions starting in the next 24 hours
    const upcomingSessions = await this.prisma.cohortSession.findMany({
      where: {
        sessionDate: {
          gte: now,
          lte: in24Hours,
        },
      },
      include: {
        cohort: {
          include: {
            enrollments: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    for (const session of upcomingSessions) {
      // TODO: Send email and push notifications to all enrolled students
      // This would integrate with Agent 11's notification service
      console.log(`Reminder: Session "${session.title}" starts at ${session.sessionDate}`);
    }
  }
}
