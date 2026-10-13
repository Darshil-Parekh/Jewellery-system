import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AccessTokenGuard } from './access-token.guard'
import { AccessTokenStrategy } from './access-token.strategy'
import { AuthService } from './auth.service'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = Number(
          config.getOrThrow<string>('ACCESS_TOKEN_TTL_SECONDS'),
        )
        if (!Number.isSafeInteger(expiresIn) || expiresIn < 1) {
          throw new Error('ACCESS_TOKEN_TTL_SECONDS must be a positive integer.')
        }

        return {
          secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, AccessTokenGuard],
  exports: [AccessTokenGuard],
})
export class AuthModule {}
