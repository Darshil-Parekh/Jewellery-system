import { Module } from '@nestjs/common'
import { AccessTokenGuard } from '../auth/access-token.guard'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AccessTokenGuard],
})
export class DashboardModule {}
