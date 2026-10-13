import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { AccessTokenGuard } from './access-token.guard'
import { AuthService } from './auth.service'
import { AuthenticatedRequest } from './auth.types'
import { CreateInitialAdminDto } from './dto/create-initial-admin.dto'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
  ) {}

  @Post('setup')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async setup(
    @Body() dto: CreateInitialAdminDto,
    @Req() request: Request,
  ) {
    return this.auth.createInitialAdmin(
      dto,
      request.header('x-initial-admin-setup-token'),
    )
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(dto)
    this.setRefreshCookie(response, session.refreshToken)
    return { accessToken: session.accessToken, user: session.user }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.[this.auth.refreshCookieName]
    if (!refreshToken) {
      response.status(HttpStatus.NO_CONTENT)
      return
    }

    const session = await this.auth.refresh(refreshToken)
    this.setRefreshCookie(response, session.refreshToken)
    return { accessToken: session.accessToken, user: session.user }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(request.cookies?.[this.auth.refreshCookieName])
    response.clearCookie(
      this.auth.refreshCookieName,
      this.auth.refreshCookieOptions(),
    )
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  me(@Req() request: AuthenticatedRequest) {
    return {
      id: request.user.sub,
      email: request.user.email,
      role: request.user.role,
    }
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie(
      this.auth.refreshCookieName,
      refreshToken,
      this.auth.refreshCookieOptions(),
    )
  }
}
