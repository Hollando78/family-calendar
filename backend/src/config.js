import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rawDbUrl = process.env.DATABASE_URL || 'file:./db/family-calendar.sqlite';

function normalizeDatabasePath(url) {
  const cleaned = url.startsWith('file:') ? url.replace('file:', '') : url;
  return path.isAbsolute(cleaned) ? cleaned : path.join(rootDir, cleaned);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databasePath: normalizeDatabasePath(rawDbUrl),
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  tokenExpiration: '30d'
};

export default config;
