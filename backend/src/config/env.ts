import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/kompass'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  OPTIMIZER_URL: z.string().default('http://localhost:8001'),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  WEATHER_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const config = parsed.data
