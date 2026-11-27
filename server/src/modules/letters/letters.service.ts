import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { MailService } from '../../shared/mail/mail.service.js';
import { LetterType, LetterStatus, Prisma } from '@prisma/client';
import { CreateLetterDto } from './dto/create-letter.dto.js';
import { LetterFilterDto } from './dto/letter-filter.dto.js';
import { SendLetterEmailDto } from './dto/send-email.dto.js';
import { generateLetterPdfBuffer } from './utils/pdf-generator.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LettersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
  ) {}

  async createLetter(dto: CreateLetterDto, actorUserId?: string, meta?: RequestMeta) {
    const letterType = dto.letterType || LetterType.OFFER_LETTER;
    const year = new Date().getFullYear();

    // Generate unique sequential reference number
    const count = await this.prisma.officialLetter.count({
      where: { letterType },
    });
    const prefix =
      letterType === LetterType.OFFER_LETTER
        ? 'OL'
        : letterType === LetterType.EXPERIENCE_LETTER
        ? 'EL'
        : 'IL';
    const refNumber = `MAV/HR/${prefix}/${year}/${String(count + 1).padStart(4, '0')}`;

    // Compute annual/monthly gross salary reciprocity
    let annualGross = dto.annualGrossCtc;
    let monthlyGross = dto.monthlyGross;
    if (annualGross && !monthlyGross) {
      monthlyGross = Math.round(annualGross / 12);
    } else if (monthlyGross && !annualGross) {
      annualGross = Math.round(monthlyGross * 12);
    }

    const joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : null;
    const relievingDate = dto.relievingDate ? new Date(dto.relievingDate) : null;
    const validUntil = dto.validUntil ? new Date(dto.validUntil) : null;

    let resolvedEmployeeId = dto.employeeId;
    if (!resolvedEmployeeId) {
      const matchedUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: dto.recipientEmail.trim().toLowerCase() },
            ...(dto.employeeCode?.trim() ? [{ employeeId: dto.employeeCode.trim() }] : []),
          ],
        },
        select: { employee: { select: { id: true } } },
      });
      if (matchedUser?.employee?.id) {
        resolvedEmployeeId = matchedUser.employee.id;
      }
    }

    const letter = await this.prisma.officialLetter.create({
      data: {
        refNumber,
        letterType,
        status: LetterStatus.ISSUED,
        recipientName: dto.recipientName.trim(),
        recipientEmail: dto.recipientEmail.trim().toLowerCase(),
        recipientPhone: dto.recipientPhone?.trim(),
        designation: dto.designation.trim(),
        department: dto.department.trim(),
        annualGrossCtc: annualGross,
        monthlyGross: monthlyGross,
        joiningDate,
        relievingDate,
        employeeCode: dto.employeeCode?.trim(),
        recipientGender: dto.recipientGender?.trim(),
        workLocation: dto.workLocation || 'Bangalore, Karnataka',
        probationMonths: dto.probationMonths ?? 3,
        validUntil,
        ceoName: dto.ceoName || 'Mark Anthony Fegradoe',
        ceoTitle: dto.ceoTitle || 'Founder & Chief Executive Officer',
        headOfHrName: dto.headOfHrName || 'Shilpa Kumari P',
        headOfHrTitle: dto.headOfHrTitle || 'Head of Finance and Human Resources',
        customNotes: dto.customNotes,
        candidateId: dto.candidateId,
        employeeId: resolvedEmployeeId,
        createdById: actorUserId,
      },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            appliedRole: true,
            department: true,
          },
        },
      },
    });

    // Form System Audit Log (Strictly Append-Only)
    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      const actionType =
        letterType === LetterType.OFFER_LETTER
          ? 'OFFER_LETTER_GENERATED'
          : letterType === LetterType.EXPERIENCE_LETTER
          ? 'EXPERIENCE_LETTER_GENERATED'
          : 'INTERNSHIP_LETTER_GENERATED';

      await this.auditService.log({
        actorUserId: actor,
        actionType,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        newValuePayload: {
          letterId: letter.id,
          refNumber: letter.refNumber,
          letterType: letter.letterType,
          recipientName: letter.recipientName,
          recipientEmail: letter.recipientEmail,
          designation: letter.designation,
          department: letter.department,
          annualGrossCtc: letter.annualGrossCtc,
          monthlyGross: letter.monthlyGross,
          joiningDate: letter.joiningDate,
          relievingDate: letter.relievingDate,
          employeeCode: letter.employeeCode,
          recipientGender: letter.recipientGender,
          workLocation: letter.workLocation,
          ceoName: letter.ceoName,
          headOfHrName: letter.headOfHrName,
          candidateId: letter.candidateId,
          employeeId: letter.employeeId,
          source: letter.candidateId ? 'CANDIDATE_IMPORT' : letter.employeeId ? 'EMPLOYEE_IMPORT' : 'MANUAL',
        },
      });
    }

    return letter;
  }

  async getLetters(filter?: LetterFilterDto) {
    const where: Prisma.OfficialLetterWhereInput = {};

    if (filter?.letterType) {
      where.letterType = filter.letterType;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.search) {
      const q = filter.search.trim();
      where.OR = [
        { recipientName: { contains: q, mode: 'insensitive' } },
        { recipientEmail: { contains: q, mode: 'insensitive' } },
        { refNumber: { contains: q, mode: 'insensitive' } },
        { designation: { contains: q, mode: 'insensitive' } },
      ];
    }

    const letters = await this.prisma.officialLetter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const emails = Array.from(
      new Set(letters.map((l) => l.recipientEmail.toLowerCase()).filter(Boolean)),
    );
    const existingUsers = emails.length
      ? await this.prisma.user.findMany({
          where: { email: { in: emails }, isArchived: false },
          select: { email: true, employee: { select: { id: true } } },
        })
      : [];
    const onboardedEmailSet = new Set(
      existingUsers.filter((u) => Boolean(u.employee)).map((u) => u.email.toLowerCase()),
    );

    return letters.map((l) => ({
      ...l,
      isEmployeeCreated: Boolean(l.employeeId) || onboardedEmailSet.has(l.recipientEmail.toLowerCase()),
    }));
  }

  async getLetterById(id: string) {
    const letter = await this.prisma.officialLetter.findUnique({
      where: { id },
      include: {
        candidate: true,
        employee: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!letter) {
      throw new NotFoundException(`Official Letter #${id} not found.`);
    }

    let isEmployeeCreated = Boolean(letter.employeeId || letter.employee);
    if (!isEmployeeCreated && letter.recipientEmail) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: letter.recipientEmail.toLowerCase() },
        select: { isArchived: true, employee: { select: { id: true } } },
      });
      isEmployeeCreated = Boolean(existingUser && !existingUser.isArchived && existingUser.employee);
    }

    return {
      ...letter,
      isEmployeeCreated,
    };
  }

  async logLetterAction(
    id: string,
    action: 'DOWNLOADED' | 'PRINTED' | 'EMAILED',
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    const letter = await this.getLetterById(id);
    const actor = actorUserId || (await this.resolveFallbackActorId());

    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: `OFFICIAL_LETTER_${action}`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        newValuePayload: {
          letterId: letter.id,
          refNumber: letter.refNumber,
          letterType: letter.letterType,
          recipientName: letter.recipientName,
          action,
        },
      });
    }

    return { success: true };
  }

  async revokeLetter(id: string, actorUserId?: string, meta?: RequestMeta) {
    const letter = await this.getLetterById(id);

    if (letter.candidateResponse === 'ACCEPTED' || letter.isEmployeeCreated || letter.employeeId) {
      throw new BadRequestException(
        'Cannot revoke a letter that has already been accepted or onboarded.',
      );
    }

    const updated = await this.prisma.officialLetter.update({
      where: { id },
      data: { status: LetterStatus.REVOKED },
    });

    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: 'OFFER_LETTER_REVOKED',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        oldValuePayload: {
          status: letter.status,
        },
        newValuePayload: {
          letterId: letter.id,
          refNumber: letter.refNumber,
          recipientName: letter.recipientName,
          status: LetterStatus.REVOKED,
        },
      });
    }

    return updated;
  }

  async sendLetterEmail(
    id: string,
    dto?: SendLetterEmailDto,
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    const letter = await this.getLetterById(id);

    if (letter.status === LetterStatus.REVOKED) {
      throw new BadRequestException('Cannot email a revoked letter.');
    }

    if (letter.emailSentAt) {
      throw new BadRequestException(
        'Email has already been sent for this letter. Awaiting candidate response (Accept or Reject).',
      );
    }

    const recipient = dto?.recipientEmail?.trim() || letter.recipientEmail;
    const isExperience = letter.letterType === LetterType.EXPERIENCE_LETTER;
    const defaultSubject = isExperience
      ? `Experience & Relieving Certificate — ${letter.recipientName} (Ref: ${letter.refNumber})`
      : `Formal Offer of Employment: ${letter.designation} — Mark Anthony Ventures (Ref: ${letter.refNumber})`;
    const subject = dto?.subject?.trim() || defaultSubject;

    // 1. Prepare PDF Attachment
    let pdfBuffer: Buffer;
    if (dto?.pdfBase64) {
      const cleanBase64 = dto.pdfBase64
        .replace(/^data:[^,]+,/, '')
        .replace(/\s+/g, '');
      const decoded = Buffer.from(cleanBase64, 'base64');
      // Verify valid PDF header (%PDF), otherwise fall back to server-side generator
      if (decoded.length > 100 && decoded.subarray(0, 4).toString('ascii') === '%PDF') {
        pdfBuffer = decoded;
      } else {
        pdfBuffer = await generateLetterPdfBuffer(letter);
      }
    } else {
      pdfBuffer = await generateLetterPdfBuffer(letter);
    }

    const safeRecipientName = letter.recipientName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const defaultPrefix = isExperience ? 'Experience_Letter' : 'Offer_Letter';
    const attachmentFileName =
      dto?.pdfFileName?.trim() || `${defaultPrefix}_${safeRecipientName}.pdf`;

    // 2. Prepare Email Body (Exact structure requested by user)
    const text = this.buildOfferLetterEmailText(letter, dto?.customMessage);
    const html = this.buildOfferLetterEmailHtml(letter, dto?.customMessage);

    // 3. Dispatch via SMTP
    const result = await this.mailService.sendMail({
      to: recipient,
      cc: dto?.ccEmails,
      subject,
      html,
      text,
      attachments: [
        {
          filename: attachmentFileName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    const now = new Date();
    await this.prisma.officialLetter.update({
      where: { id },
      data: {
        emailSentAt: now,
        emailSentTo: recipient,
        candidateResponse: 'PENDING',
      },
    });

    const nowIso = now.toISOString();
    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: 'OFFER_LETTER_EMAILED',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        newValuePayload: {
          letterId: letter.id,
          refNumber: letter.refNumber,
          recipientName: letter.recipientName,
          recipientEmail: recipient,
          subject,
          attachmentFileName,
          pdfSizeBytes: pdfBuffer.length,
          messageId: result.messageId,
          acceptedRecipients: result.accepted,
          sentAt: nowIso,
        },
      });
    }

    return {
      success: true,
      messageId: result.messageId,
      sentTo: recipient,
      subject,
      attachmentFileName,
      sentAt: nowIso,
    };
  }

  async recordCandidateResponse(
    id: string,
    response: 'ACCEPTED' | 'REJECTED',
    remarks?: string,
    actorUserId?: string,
    meta?: RequestMeta,
  ) {
    if (response !== 'ACCEPTED' && response !== 'REJECTED') {
      throw new BadRequestException('Response must be ACCEPTED or REJECTED.');
    }

    const letter = await this.getLetterById(id);
    if (letter.letterType !== LetterType.OFFER_LETTER) {
      throw new BadRequestException('Accept / Reject response tracking applies only to Offer Letters.');
    }

    if (!letter.emailSentAt) {
      throw new BadRequestException('Email must be sent to the candidate before recording Accept/Reject.');
    }

    if (letter.candidateResponse === 'ACCEPTED' || letter.candidateResponse === 'REJECTED') {
      throw new BadRequestException(`Candidate response has already been recorded as ${letter.candidateResponse}.`);
    }

    const now = new Date();
    const updated = await this.prisma.officialLetter.update({
      where: { id },
      data: {
        candidateResponse: response,
        respondedAt: now,
        responseRemarks: remarks?.trim() || null,
      },
    });

    const actor = actorUserId || (await this.resolveFallbackActorId());
    if (actor) {
      await this.auditService.log({
        actorUserId: actor,
        actionType: response === 'ACCEPTED' ? 'OFFER_LETTER_ACCEPTED' : 'OFFER_LETTER_REJECTED',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        oldValuePayload: {
          letterId: letter.id,
          candidateResponse: letter.candidateResponse || 'PENDING',
        },
        newValuePayload: {
          letterId: letter.id,
          refNumber: letter.refNumber,
          recipientName: letter.recipientName,
          recipientEmail: letter.recipientEmail,
          candidateResponse: response,
          remarks: remarks?.trim() || null,
          recordedBy: 'HR',
          respondedAt: now.toISOString(),
        },
      });
    }

    return updated;
  }

  private buildOfferLetterEmailHtml(letter: any, customMessage?: string): string {
    const textContent = this.buildOfferLetterEmailText(letter, customMessage);
    const paragraphs = textContent.split('\n\n');
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; margin: 0; padding: 12px 0;">
  ${paragraphs
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #1e293b;">${p.replace(/\n/g, '<br>')}</p>`,
    )
    .join('\n')}
</body>
</html>`.trim();
  }

  private buildOfferLetterEmailText(letter: any, customMessage?: string): string {
    const deadlineDate = letter.validUntil
      ? new Date(letter.validUntil).toLocaleDateString('en-GB')
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 3);
          return d.toLocaleDateString('en-GB');
        })();

    const signName = letter.headOfHrName || 'Shilpa Kumari P';
    const signTitle = letter.headOfHrTitle || 'Head of Finance and Human Resources';

    if (customMessage) {
      return customMessage.trim();
    }

    if (letter.letterType === LetterType.EXPERIENCE_LETTER) {
      return `
Dear ${letter.recipientName},

Please find attached your official Experience & Relieving Certificate from M&A Ventures${letter.employeeCode ? ` (Employee ID: ${letter.employeeCode})` : ''}.

We appreciate the services rendered during your tenure with the organization and wish you success and prosperity in all your future endeavors.

Best regards,
${signName}
${signTitle}
Mark Anthony Ventures
      `.trim();
    }

    return `
Dear ${letter.recipientName},
 
We are pleased to offer you the position of ${letter.designation} at Mark Anthony Ventures.
 
Attached to this email is your offer letter, which includes details about your job title, start date, and other important information about your role. Please take the time to review this document carefully and let us know if you have any questions or concerns.
 
We ask that you review the offer letter by ${deadlineDate} to confirm your acceptance of this position.
 
We look forward to welcoming you to our team and working with you in the coming weeks and months. Please let us know if you have any questions or concerns about the onboarding process or your new role.
 
Best regards,
${signName}
${signTitle} 
Mark Anthony Ventures
    `.trim();
  }

  private async resolveFallbackActorId(): Promise<string | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'HR_ADMIN', 'HR_COORDINATOR'] } },
      select: { id: true },
    });
    return user?.id;
  }
}
