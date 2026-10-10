import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.string().default('false'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_SSL: z.string().default('false'),
  DATABASE_SSL_REJECT_UNAUTHORIZED: z.string().default('true'),
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),
  TICKET_CAPACITY_EARLY_BIRD: z.coerce.number().int().min(0).default(0),
  TICKET_CAPACITY_REGULAR: z.coerce.number().int().min(0).default(0),
  BOOKING_HOLD_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid backend environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Fix the backend environment variables and restart the server.');
}

export const config = {
  ...parsed.data,
  allowedOrigins: parsed.data.FRONTEND_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
  trustProxy: parsed.data.TRUST_PROXY.toLowerCase() === 'true',
  databaseSsl: parsed.data.DATABASE_SSL.toLowerCase() === 'true',
  databaseSslRejectUnauthorized: parsed.data.DATABASE_SSL_REJECT_UNAUTHORIZED.toLowerCase() !== 'false',
};
