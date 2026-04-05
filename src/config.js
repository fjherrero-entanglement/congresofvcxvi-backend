/**
 * Config — reads env vars with defaults
 */
import 'dotenv/config';

export const config = {
  port:           parseInt(process.env.PORT || '8080'),
  databaseUrl:    process.env.DATABASE_URL,
  jwtSecret:      process.env.JWT_SECRET     || 'dev-secret',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  vapid: {
    publicKey:  process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject:    process.env.VAPID_SUBJECT || 'mailto:admin@vacunar.org.ar',
  },
};
