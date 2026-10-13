import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Prisma, User, UserRole } from '@prisma/client'
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { compare, hash, truncates } from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { CreateInitialAdminDto } from './dto/create-initial-admin.dto'
import { LoginDto } from './dto/login.dto'
import { AccessTokenPayload } from './auth.types'

const PASSWORD_ROUNDS = 12
const REFRESH_COOKIE_NAME = 'jewellery_refresh'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async createInitialAdmin(
    dto: CreateInitialAdminDto,
    setupToken: string | undefined,
  ) {
    const configuredToken = this.config.getOrThrow<string>(
      'INITIAL_ADMIN_SETUP_TOKEN',
    )

    if (!setupToken || !this.safeEqual(setupToken, configuredToken)) {
      throw new ForbiddenException('The administrator setup token is invalid.')
    }
    if (truncates(dto.password)) {
      throw new BadRequestException(
        'Passwords must be no more than 72 UTF-8 bytes.',
      )
    }

    const passwordHash = await hash(dto.password, PASSWORD_ROUNDS)

    try {
      const admin = await this.prisma.$transaction(
        async (transaction) => {
          const existingUsers = await transaction.user.count()
          if (existingUsers > 0) {
            throw new ConflictException(
              'Administrator setup has already been completed.',
            )
          }

          return transaction.user.create({
            data: {
              fullName: dto.fullName.trim(),
              email: dto.email,
              passwordHash,
              role: UserRole.ADMIN,
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          })
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      )

      return admin
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Administrator setup was already completed by another request.',
        )
      }
      throw error
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    const passwordMatches =
      user?.isActive &&
      !truncates(dto.password) &&
      (await compare(dto.password, user.passwordHash))

    if (!passwordMatches) {
      throw new UnauthorizedException('Email or password is incorrect.')
    }

    return this.createSession(user)
  }

  async refresh(refreshToken: string | undefined) {
    const parsed = this.parseRefreshToken(refreshToken)
    if (!parsed) {
      throw new UnauthorizedException('Your session has expired.')
    }

    const session = await this.prisma.refreshSession.findUnique({
      where: { id: parsed.id },
      include: { user: true },
    })
    const now = new Date()

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= now ||
      !session.user.isActive ||
      !this.safeEqual(
        session.refreshTokenHash,
        this.hashRefreshToken(refreshToken!),
      )
    ) {
      throw new UnauthorizedException('Your session has expired.')
    }

    const nextRefreshToken = this.makeRefreshToken(parsed.id)
    const rotation = await this.prisma.refreshSession.updateMany({
      where: {
        id: parsed.id,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { refreshTokenHash: this.hashRefreshToken(nextRefreshToken) },
    })

    if (rotation.count !== 1) {
      throw new UnauthorizedException('Your session has expired.')
    }

    return {
      accessToken: await this.createAccessToken(session.user),
      refreshToken: nextRefreshToken,
      user: this.publicUser(session.user),
    }
  }

  async logout(refreshToken: string | undefined) {
    const parsed = this.parseRefreshToken(refreshToken)
    if (!parsed || !refreshToken) {
      return
    }

    await this.prisma.refreshSession.updateMany({
      where: {
        id: parsed.id,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    })
  }

  toPublicUser(user: User) {
    return this.publicUser(user)
  }

  refreshCookieOptions() {
    const days = this.positiveInteger('REFRESH_TOKEN_TTL_DAYS')

    return {
      httpOnly: true,
      secure:
        this.config.get<string>('COOKIE_SECURE') === 'true' ||
        this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
      path: '/api/v1/auth',
      maxAge: days * 24 * 60 * 60 * 1000,
    }
  }

  get refreshCookieName() {
    return REFRESH_COOKIE_NAME
  }

  private async createSession(user: User) {
    const id = randomUUID()
    const refreshToken = this.makeRefreshToken(id)
    const expiresAt = new Date()
    expiresAt.setDate(
      expiresAt.getDate() + this.positiveInteger('REFRESH_TOKEN_TTL_DAYS'),
    )

    await this.prisma.refreshSession.create({
      data: {
        id,
        userId: user.id,
        refreshTokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
      },
    })

    return {
      accessToken: await this.createAccessToken(user),
      refreshToken,
      user: this.publicUser(user),
    }
  }

  private async createAccessToken(user: User) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }
    return this.jwt.signAsync(payload)
  }

  private makeRefreshToken(id: string) {
    return `${id}.${randomBytes(32).toString('hex')}`
  }

  private parseRefreshToken(token: string | undefined) {
    if (!token) {
      return null
    }

    const separator = token.indexOf('.')
    if (separator < 1 || separator === token.length - 1) {
      return null
    }

    const id = token.slice(0, separator)
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return null
    }

    return { id }
  }

  private hashRefreshToken(token: string) {
    return createHmac(
      'sha256',
      this.config.getOrThrow<string>('REFRESH_TOKEN_PEPPER'),
    )
      .update(token)
      .digest('hex')
  }

  private safeEqual(left: string, right: string) {
    const leftHash = createHmac('sha256', 'constant-time-compare')
      .update(left)
      .digest()
    const rightHash = createHmac('sha256', 'constant-time-compare')
      .update(right)
      .digest()
    return timingSafeEqual(leftHash, rightHash)
  }

  private positiveInteger(name: string) {
    const value = Number(this.config.getOrThrow<string>(name))
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new Error(`${name} must be a positive integer.`)
    }
    return value
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    }
  }
}
