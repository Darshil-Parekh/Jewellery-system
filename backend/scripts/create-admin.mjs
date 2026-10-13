import { readFile } from 'node:fs/promises'
import { confirm, input, isCancel, password } from '@inquirer/prompts'

const envFile = await readFile(new URL('../.env', import.meta.url), 'utf8')
const setupToken = envFile
  .split(/\r?\n/)
  .find((line) => line.startsWith('INITIAL_ADMIN_SETUP_TOKEN='))
  ?.slice('INITIAL_ADMIN_SETUP_TOKEN='.length)

if (!setupToken) {
  throw new Error('INITIAL_ADMIN_SETUP_TOKEN is missing from backend/.env.')
}

const fullName = await input({
  message: 'Administrator name',
  validate: (value) =>
    value.trim().length >= 2 || 'Enter at least two characters.',
})
const email = await input({
  message: 'Administrator email',
  validate: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
    'Enter a valid email address.',
})
const adminPassword = await password({
  message: 'Choose a password (at least 12 characters)',
  mask: '*',
  validate: (value) =>
    (value.length >= 12 && Buffer.byteLength(value, 'utf8') <= 72) ||
    'Choose at least 12 characters and no more than 72 UTF-8 bytes.',
})
const confirmation = await password({
  message: 'Confirm the password',
  mask: '*',
  validate: (value) =>
    value === adminPassword || 'The passwords do not match.',
})
const accepted = await confirm({
  message: `Create the first administrator account for ${email.trim()}?`,
  default: false,
})

if ([fullName, email, adminPassword, confirmation, accepted].some(isCancel)) {
  console.log('Administrator setup cancelled.')
  process.exit(0)
}
if (!accepted) {
  console.log('Administrator setup cancelled.')
  process.exit(0)
}

const response = await fetch('http://localhost:3001/api/v1/auth/setup', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-initial-admin-setup-token': setupToken,
  },
  body: JSON.stringify({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: adminPassword,
  }),
})
const result = await response.json().catch(() => null)

if (!response.ok) {
  const reason = result?.message
  throw new Error(
    Array.isArray(reason) ? reason.join(' ') : reason || `HTTP ${response.status}`,
  )
}

console.log(`Administrator ${result.email} created. Sign in at /login.`)
