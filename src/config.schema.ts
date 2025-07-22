import { z } from 'zod';

export const configSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  ENVIRONMENT: z.enum(['local', 'development', 'production', 'test']).default('local'),
});

export type Config = z.infer<typeof configSchema>;
