import { defineConfig, env } from 'prisma/config'

import 'dotenv/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: `postgresql://${env('POSTGRES_OWNER_USER')}:${env('POSTGRES_OWNER_PASSWORD')}@${env('POSTGRES_HOST')}:${env('POSTGRES_PORT')}/${env('POSTGRES_DB')}`,
  },
})
