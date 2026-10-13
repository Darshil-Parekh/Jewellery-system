import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(projectRoot, 'backend', '.env')

try {
  await mkdir(dirname(envPath), { recursive: true })
  const databasePassword = randomBytes(24).toString('hex')
  const values = [
    `DATABASE_URL=postgresql://jewellery:${databasePassword}@localhost:5433/jewellery_stock?schema=public`,
    `POSTGRES_PASSWORD=${databasePassword}`,
    `JWT_ACCESS_SECRET=${randomBytes(48).toString('hex')}`,
    `REFRESH_TOKEN_PEPPER=${randomBytes(48).toString('hex')}`,
    `INITIAL_ADMIN_SETUP_TOKEN=${randomBytes(32).toString('hex')}`,
    'PORT=3001',
    'FRONTEND_ORIGIN=http://localhost:5173',
    'ACCESS_TOKEN_TTL_SECONDS=900',
    'REFRESH_TOKEN_TTL_DAYS=7',
    'COOKIE_SECURE=false',
  ]

  await writeFile(envPath, `${values.join('\n')}\n`, { flag: 'wx', mode: 0o600 })
  console.log('Created backend/.env with fresh development secrets.')
  console.log('This file is ignored by Git. Keep its contents private.')
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error('backend/.env already exists; no files were changed.')
    process.exitCode = 1
  } else {
    throw error
  }
}
