import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../prisma/prisma.service'
import { AccessTokenPayload } from './auth.types'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    })
  }

  async validate(payload: AccessTokenPayload): Promise<AccessTokenPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    })

    if (!user?.isActive) {
      throw new UnauthorizedException('This account is no longer active.')
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    }
  }
}
