export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const appConfig = () => ({
  port: Number(getRequiredEnv('PORT')),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
    expiresIn: getRequiredEnv('JWT_EXPIRES_IN'),
    refreshExpiresIn: getRequiredEnv('JWT_REFRESH_EXPIRES_IN'),
  },
  observe: {
    appKey: process.env.OBSERVE_APP_KEY ?? '',
    appSecret: process.env.OBSERVE_APP_SECRET ?? '',
  },
  smtp: {
    host: (process.env.SMTP_HOST ?? 'smtp.gmail.com').trim(),
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE.trim().toLowerCase() === 'true'
      : Number(process.env.SMTP_PORT ?? 465) === 465,
    user: (process.env.SMTP_USER ?? '').trim(),
    pass: (process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS ?? '').trim(),
    from: (
      process.env.SMTP_FROM ??
      process.env.SMTP_USER ??
      'Mark Anthony HRMS <no-reply@markanthony.in>'
    ).trim(),
  },
});
