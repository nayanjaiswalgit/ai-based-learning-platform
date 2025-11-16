import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create cohort announcement
   * Phase 2: Batch announcements
   */
  async create(data: {
    cohortId: string;
    createdBy: string;
    title: string;
    content: string;
    announcementType?: string;
    isPinned?: boolean;
    sendEmail?: boolean;
    sendNotification?: boolean;
  }) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: data.cohortId },
    });

    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    const announcement = await this.prisma.cohortAnnouncement.create({
      data: {
        cohortId: data.cohortId,
        createdBy: data.createdBy,
        title: data.title,
        content: data.content,
        announcementType: data.announcementType || 'general',
        isPinned: data.isPinned || false,
        sendEmail: data.sendEmail ?? true,
        sendNotification: data.sendNotification ?? true,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    // TODO: Send email and notification if enabled
    // This would integrate with Agent 11's notification service

    return announcement;
  }

  /**
   * Get announcements for a cohort
   */
  async findAll(cohortId: string, filters?: {
    type?: string;
    pinnedOnly?: boolean;
  }) {
    const where: any = { cohortId };

    if (filters?.type) {
      where.announcementType = filters.type;
    }

    if (filters?.pinnedOnly) {
      where.isPinned = true;
    }

    return this.prisma.cohortAnnouncement.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Update announcement
   */
  async update(id: string, data: Partial<{
    title: string;
    content: string;
    isPinned: boolean;
  }>) {
    return this.prisma.cohortAnnouncement.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete announcement
   */
  async delete(id: string) {
    await this.prisma.cohortAnnouncement.delete({
      where: { id },
    });

    return { message: 'Announcement deleted successfully' };
  }
}
