import dotenv from 'dotenv';
import type ms from 'ms';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-secret',
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue || '60s',
  ADMIN_EMAILS_WHITELIST: (process.env.ADMIN_EMAILS_WHITELIST || '').split(',').map(email => email.trim()).filter(email => email.length > 0),
  
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_TTL: parseInt(process.env.REDIS_TTL || '300', 10),
};

export default config;
