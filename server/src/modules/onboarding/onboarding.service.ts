import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves employee induction details
   */
  async getEmployeeInduction(emailOrId?: string) {
    const user = await this.prisma.user.findFirst({
      where: emailOrId
        ? {
            OR: [
              { email: emailOrId },
              { id: emailOrId },
              { employeeId: emailOrId },
            ],
          }
        : { email: 'rahul.sharma@maventures.com' },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      return {
        id: 'emp-1042',
        employeeCode: 'MA-2026-089',
        fullName: 'Rahul Sharma',
        department: 'Real Estate Advisory & Investments',
        designation: 'Senior Investment Advisor',
        joiningDate: '10 Feb 2026',
        email: 'rahul.sharma@maventures.com',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      };
    }

    return {
      id: user.id,
      employeeCode: user.employeeId || 'MA-2026-089',
      fullName: user.name,
      department: user.employee?.department?.name || 'Real Estate Advisory & Investments',
      designation: user.employee?.jobTitle || 'Senior Investment Advisor',
      joiningDate: user.dateOfJoining ? user.dateOfJoining.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Feb 2026',
      email: user.email,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    };
  }

  /**
   * Retrieves all 7 core sessions with chapter IDs and calculated completion status
   */
  async getInductionSessions(userId?: string) {
    const employee = await this.getEmployeeInduction(userId);
    const sessions = await this.prisma.inductionSession.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            progress: {
              where: { userId: employee.id },
            },
          },
        },
      },
    });

    return sessions.map((s) => {
      const chapterIds = s.chapters.map((c) => c.id);
      const totalChaps = s.chapters.length;
      let completedChaps = 0;
      let inProgressChaps = 0;

      s.chapters.forEach((c) => {
        const prog = c.progress[0];
        if (prog?.status === 'COMPLETED') completedChaps++;
        else if (prog?.status === 'IN_PROGRESS') inProgressChaps++;
      });

      let status = 'not_started';
      let progressPercentage = 0;

      if (totalChaps > 0) {
        progressPercentage = Math.round((completedChaps / totalChaps) * 100);
        if (completedChaps === totalChaps) {
          status = 'completed';
        } else if (completedChaps > 0 || inProgressChaps > 0) {
          status = 'in_progress';
        }
      }

      if (s.sessionNumber === 7 && completedChaps === 0) {
        status = 'locked';
      }

      return {
        id: s.id,
        sessionNumber: s.sessionNumber,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        chapterStart: s.chapterStart,
        chapterEnd: s.chapterEnd,
        estimatedDuration: s.estimatedDuration,
        status,
        progressPercentage,
        chapterIds,
      };
    });
  }

  /**
   * Retrieves all 22 chapters with individual user progress
   */
  async getInductionChapters(userId?: string) {
    const employee = await this.getEmployeeInduction(userId);
    const chapters = await this.prisma.inductionChapter.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        progress: {
          where: { userId: employee.id },
        },
      },
    });

    return chapters.map((c) => {
      const prog = c.progress[0];
      const rawStatus = prog?.status?.toLowerCase() || (c.isResource ? 'locked' : 'not_started');
      const progressPercentage = prog?.progressPercentage ?? (rawStatus === 'completed' ? 100 : 0);

      return {
        id: c.id,
        chapterNumber: c.chapterNumber,
        title: c.title,
        description: c.description,
        sessionId: c.sessionId,
        estimatedDuration: c.estimatedDuration,
        status: rawStatus,
        progressPercentage,
        isAssessment: c.isAssessment,
        isResource: c.isResource,
      };
    });
  }

  /**
   * Dynamically calculates induction metrics from live progress records
   */
  async getInductionProgress(userId?: string) {
    const employee = await this.getEmployeeInduction(userId);
    const chapters = await this.getInductionChapters(employee.id);
    const sessions = await this.getInductionSessions(employee.id);

    const totalChapters = chapters.length;
    const completedChapters = chapters.filter((c) => c.status === 'completed').length;
    const completedSessions = sessions.filter((s) => s.status === 'completed').length;
    const totalSessions = sessions.length;

    const overallPercentage = Math.round((completedChapters / totalChapters) * 100);

    const nextChapter = chapters.find((c) => c.status !== 'completed' && !c.isResource) || chapters[0];
    const currentSessionId = nextChapter ? nextChapter.sessionId : sessions[0].id;

    let status = 'Not Started';
    if (completedChapters === totalChapters) status = 'Completed';
    else if (completedChapters > 0) status = 'In Progress';

    return {
      employeeId: employee.id,
      totalChapters,
      completedChapters,
      overallPercentage,
      currentSessionId,
      currentChapterId: nextChapter.id,
      lastAccessedAt: 'Today, 11:20 AM',
      completedSessions,
      totalSessions,
      remainingDuration: '1 hour 57 minutes',
      status,
    };
  }

  /**
   * Retrieves active announcements / reminders
   */
  async getNotifications(userId?: string) {
    const notifications = await this.prisma.inductionNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      timestamp: '15 mins ago',
      read: n.read,
      actionLabel: n.actionLabel || undefined,
      actionRoute: n.actionRoute || undefined,
    }));
  }

  /**
   * Marks a notification as read
   */
  async markNotificationRead(id: string) {
    await this.prisma.inductionNotification.updateMany({
      where: { id },
      data: { read: true },
    });
    return { success: true };
  }

  /**
   * Updates chapter progress dynamically (e.g. marking complete)
   */
  async updateChapterProgress(chapterId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED', progressPercentage = 100, userId?: string) {
    const employee = await this.getEmployeeInduction(userId);
    const chapter = await this.prisma.inductionChapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter ${chapterId} not found`);
    }

    const updated = await this.prisma.inductionProgress.upsert({
      where: {
        userId_chapterId: {
          userId: employee.id,
          chapterId,
        },
      },
      update: {
        status,
        progressPercentage,
        lastAccessedAt: new Date(),
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      create: {
        userId: employee.id,
        chapterId,
        status,
        progressPercentage,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    return updated;
  }
}
