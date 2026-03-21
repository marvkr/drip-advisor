import { betterAuth } from 'better-auth'
import { expo } from '@better-auth/expo'

export const auth = betterAuth({
  database: {
    url: process.env.DATABASE_URL!,
    type: 'postgres',
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [expo()],
  trustedOrigins: ['drip-advisor://'],
})
