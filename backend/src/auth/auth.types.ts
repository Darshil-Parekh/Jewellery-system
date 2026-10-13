import { Request } from 'express'
import { UserRole } from '@prisma/client'

export interface AccessTokenPayload {
  sub: string
  email: string
  role: UserRole
}

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload
}
