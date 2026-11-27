import { ServiceUnavailableException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockVerify = vi.fn();
const mockSendMail = vi.fn();

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      verify: mockVerify,
      sendMail: mockSendMail,
    })),
  },
}));

describe('MailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PORT = '3000';
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_SECURE = 'true';
    process.env.SMTP_USER = 'sachin.markanthony@gmail.com';
    process.env.SMTP_PASSWORD = 'test-app-password';
    process.env.SMTP_FROM = 'Mark Anthony HRMS <sachin.markanthony@gmail.com>';
  });

  it('should report configured and verify connection when credentials exist', async () => {
    mockVerify.mockResolvedValueOnce(true);
    const { MailService } = await import('./mail.service.js');
    const service = new MailService();

    expect(service.isConfigured()).toBe(true);
    const status = await service.verifyConnection();
    expect(status).toMatchObject({
      configured: true,
      connected: true,
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      user: 'sachin.markanthony@gmail.com',
    });
  });

  it('should send email and return delivery metadata', async () => {
    mockSendMail.mockResolvedValueOnce({
      messageId: '<msg-1@gmail.com>',
      accepted: ['user@example.com'],
      rejected: [],
    });

    const { MailService } = await import('./mail.service.js');
    const service = new MailService();
    const result = await service.sendTestEmail('user@example.com', 'Hello', 'Body');

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Mark Anthony HRMS <sachin.markanthony@gmail.com>',
        to: 'user@example.com',
        subject: 'Hello',
        text: 'Body',
      }),
    );
    expect(result).toEqual({
      messageId: '<msg-1@gmail.com>',
      accepted: ['user@example.com'],
      rejected: [],
    });
  });

  it('should throw ServiceUnavailableException when SMTP credentials are missing', async () => {
    process.env.SMTP_USER = '';
    process.env.SMTP_PASSWORD = '';

    const { MailService } = await import('./mail.service.js');
    const service = new MailService();

    expect(service.isConfigured()).toBe(false);
    await expect(service.sendMail({ to: 'user@example.com', subject: 'Hi', text: 'Test' })).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
