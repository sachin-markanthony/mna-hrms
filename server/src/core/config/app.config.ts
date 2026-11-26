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
});
