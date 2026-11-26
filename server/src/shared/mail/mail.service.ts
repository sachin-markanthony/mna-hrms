import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { appConfig } from '../../core/config/app.config.js';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  from?: string;
}

export interface SendMailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

export interface SmtpStatusResult {
  configured: boolean;
  connected: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  error?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly smtpConfig = appConfig().smtp;
  private readonly transporter: Transporter | null;

  constructor() {
    if (this.smtpConfig.user && this.smtpConfig.pass) {
      this.transporter = nodemailer.createTransport({
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        secure: this.smtpConfig.secure,
        auth: {
          user: this.smtpConfig.user,
          pass: this.smtpConfig.pass,
        },
      });
    } else {
      this.transporter = null;
      this.logger.warn('SMTP credentials are not configured (SMTP_USER / SMTP_PASSWORD missing).');
    }
  }

  /** Returns whether SMTP credentials and transporter are configured. */
  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /** Verifies the live SMTP server connection and authentication. */
  async verifyConnection(): Promise<SmtpStatusResult> {
    const base: SmtpStatusResult = {
      configured: this.isConfigured(),
      connected: false,
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      user: this.smtpConfig.user,
      from: this.smtpConfig.from,
    };

    if (!this.transporter) {
      return { ...base, error: 'SMTP_USER or SMTP_PASSWORD is missing in environment' };
    }

    try {
      await this.transporter.verify();
      return { ...base, connected: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SMTP verification error';
      this.logger.error(`SMTP verification failed: ${message}`);
      return { ...base, error: message };
    }
  }

  /** Sends an email via the configured SMTP transporter. */
  async sendMail(options: SendMailOptions): Promise<SendMailResult> {
    if (!this.transporter) {
      throw new ServiceUnavailableException('SMTP is not configured on this server.');
    }

    try {
      const info = await this.transporter.sendMail({
        from: options.from ?? this.smtpConfig.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      const accepted = (info.accepted ?? []).map(String);
      const rejected = (info.rejected ?? []).map(String);

      this.logger.log(`Email sent (${info.messageId}) to ${accepted.join(', ')}`);
      return {
        messageId: info.messageId,
        accepted,
        rejected,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send email';
      this.logger.error(`Failed to send email: ${message}`);
      throw new ServiceUnavailableException(`SMTP delivery failed: ${message}`);
    }
  }

  /** Sends a formatted test email to verify SMTP delivery end-to-end. */
  async sendTestEmail(to: string, subject?: string, message?: string): Promise<SendMailResult> {
    const resolvedSubject = subject?.trim() || 'Mark Anthony HRMS — SMTP Test';
    const resolvedText =
      message?.trim() ||
      'Your Mark Anthony HRMS SMTP configuration is active and delivering emails properly.';

    return this.sendMail({
      to,
      subject: resolvedSubject,
      text: resolvedText,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <h2 style="margin: 0 0 12px;">Mark Anthony HRMS — SMTP Test</h2>
          <p style="margin: 0 0 12px;">${resolvedText}</p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            Sent via ${this.smtpConfig.host}:${this.smtpConfig.port} (${this.smtpConfig.user})
          </p>
        </div>
      `,
    });
  }
}
