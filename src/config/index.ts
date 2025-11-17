import dotenv from 'dotenv';
import type ms from 'ms';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-secret',
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue || '60s',
};

export default config;
