import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CalendarIntegrationService } from './calendar-integration.service';

@Injectable()
export class OneOnOneMeetingService {
  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarIntegrationService,
  ) {}

  /**
   * Set mentor availability
   * Phase 4: Mentor availability scheduling
   */
  async setAvailability(mentorId: string, slots: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone?: string;
  }>) {
    // Delete existing availability
    await this.prisma.mentorAvailability.deleteMany({
      where: { mentorId },
    });

    // Create new availability slots
    const availability = await this.prisma.mentorAvailability.createMany({
      data: slots.map(slot => ({
        mentorId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone || 'UTC',
        isActive: true,
      })),
    });

    return availability;
  }

  /**
   * Get mentor availability
   */
  async getAvailability(mentorId: string) {
    return this.prisma.mentorAvailability.findMany({
      where: {
        mentorId,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  /**
   * Book 1:1 meeting
   * Phase 4: Student booking system
   */
  async bookMeeting(data: {
    mentorId: string;
    studentId: string;
    cohortId?: string;
    scheduledAt: Date;
    durationMinutes?: number;
    agenda?: string;
    studentNotes?: string;
    provider?: 'zoom' | 'google_meet';
  }) {
    // Check if mentor is available at this time
    const dayOfWeek = data.scheduledAt.getDay();
    const timeStr = data.scheduledAt.toTimeString().slice(0, 5); // HH:MM format

    const availability = await this.prisma.mentorAvailability.findFirst({
      where: {
        mentorId: data.mentorId,
        dayOfWeek,
        startTime: { lte: timeStr },
        endTime: { gte: timeStr },
        isActive: true,
      },
    });

    if (!availability) {
      throw new BadRequestException('Mentor is not available at this time');
    }

    // Check for conflicting meetings
    const endTime = new Date(data.scheduledAt.getTime() + (data.durationMinutes || 30) * 60000);

    const conflicting = await this.prisma.oneOnOneMeeting.findFirst({
      where: {
        mentorId: data.mentorId,
        status: { in: ['scheduled', 'completed'] },
        scheduledAt: {
          gte: data.scheduledAt,
          lt: endTime,
        },
      },
    });

    if (conflicting) {
      throw new BadRequestException('This time slot is already booked');
    }

    // Create calendar event
    let calendarEventId = '';
    let meetingLink = '';

    try {
      const calendarEvent = await this.calendarService.createEvent({
        summary: `1:1 Meeting: Student & Mentor`,
        startTime: data.scheduledAt,
        duration: data.durationMinutes || 30,
        attendees: [data.studentId, data.mentorId],
        provider: data.provider || 'google_meet',
      });

      calendarEventId = calendarEvent.id;
      meetingLink = calendarEvent.meetingLink;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
    }

    // Create meeting
    const meeting = await this.prisma.oneOnOneMeeting.create({
      data: {
        mentorId: data.mentorId,
        studentId: data.studentId,
        cohortId: data.cohortId,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes || 30,
        meetingProvider: data.provider || 'google_meet',
        meetingLink: meetingLink || 'TBD',
        calendarEventId,
        agenda: data.agenda,
        studentNotes: data.studentNotes,
        status: 'scheduled',
      },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
        student: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    // TODO: Send automated meeting reminders (integrate with Agent 11)

    return meeting;
  }

  /**
   * Get meetings for a user (mentor or student)
   */
  async getUserMeetings(userId: string, role: 'mentor' | 'student', filters?: {
    status?: string;
    upcoming?: boolean;
  }) {
    const where: any = role === 'mentor'
      ? { mentorId: userId }
      : { studentId: userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.status = 'scheduled';
    }

    return this.prisma.oneOnOneMeeting.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
        student: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
        cohort: true,
        actionItems: true,
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  /**
   * Get meeting details
   */
  async findOne(id: string) {
    const meeting = await this.prisma.oneOnOneMeeting.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
        student: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePictureUrl: true,
            profile: true,
          },
        },
        cohort: true,
        actionItems: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return meeting;
  }

  /**
   * Cancel meeting
   */
  async cancel(id: string, userId: string) {
    const meeting = await this.prisma.oneOnOneMeeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    if (meeting.mentorId !== userId && meeting.studentId !== userId) {
      throw new BadRequestException('You do not have permission to cancel this meeting');
    }

    // Delete calendar event
    if (meeting.calendarEventId) {
      try {
        await this.calendarService.deleteEvent(meeting.calendarEventId);
      } catch (error) {
        console.error('Failed to delete calendar event:', error);
      }
    }

    return this.prisma.oneOnOneMeeting.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Add meeting notes
   * Phase 4: Meeting notes and follow-ups
   */
  async addNotes(id: string, userId: string, notes: string) {
    const meeting = await this.prisma.oneOnOneMeeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    const field = meeting.mentorId === userId ? 'mentorNotes' : 'studentNotes';

    return this.prisma.oneOnOneMeeting.update({
      where: { id },
      data: { [field]: notes },
    });
  }

  /**
   * Add action items
   * Phase 4: Meeting notes and follow-ups
   */
  async addActionItem(meetingId: string, data: {
    description: string;
    assignedTo?: string;
    dueDate?: Date;
  }) {
    const meeting = await this.prisma.oneOnOneMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    return this.prisma.meetingActionItem.create({
      data: {
        meetingId,
        description: data.description,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
      },
    });
  }

  /**
   * Complete action item
   */
  async completeActionItem(actionItemId: string) {
    return this.prisma.meetingActionItem.update({
      where: { id: actionItemId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Mark meeting as completed
   */
  async markCompleted(id: string, recordingUrl?: string) {
    return this.prisma.oneOnOneMeeting.update({
      where: { id },
      data: {
        status: 'completed',
        recordingUrl,
      },
    });
  }

  /**
   * Send meeting reminders (scheduled job)
   * Phase 4: Automated meeting reminders
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendMeetingReminders() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingMeetings = await this.prisma.oneOnOneMeeting.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: in24Hours,
        },
        status: 'scheduled',
        reminderSent: false,
      },
      include: {
        mentor: true,
        student: true,
      },
    });

    for (const meeting of upcomingMeetings) {
      // TODO: Send email and push notifications
      // This would integrate with Agent 11's notification service
      console.log(`Reminder: Meeting with ${meeting.mentor.username} and ${meeting.student.username} at ${meeting.scheduledAt}`);

      await this.prisma.oneOnOneMeeting.update({
        where: { id: meeting.id },
        data: { reminderSent: true },
      });
    }
  }
}
