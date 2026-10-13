import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from '../auth/access-token.guard'
import { DashboardService } from './dashboard.service'
import { SalesQueryDto } from './dto/sales-query.dto'

@Controller('dashboard')
@UseGuards(AccessTokenGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboard.getSummary()
  }

  @Get('sales')
  getSales(@Query() query: SalesQueryDto) {
    return this.dashboard.getSales(query.days)
  }

  @Get('inventory-distribution')
  getInventoryDistribution() {
    return this.dashboard.getInventoryDistribution()
  }

  @Get('recent-movements')
  getRecentMovements() {
    return this.dashboard.getRecentMovements()
  }

  @Get('recent-sales')
  getRecentSales() {
    return this.dashboard.getRecentSales()
  }

  @Get('alerts')
  getAlerts() {
    return this.dashboard.getAlerts()
  }
}
