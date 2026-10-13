import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { CustomersModule } from './customers/customers.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { HealthController } from './health/health.controller'
import { InventoryModule } from './inventory/inventory.module'
import { MetalRatesModule } from './metal-rates/metal-rates.module'
import { PrismaModule } from './prisma/prisma.module'
import { PurchasesModule } from './purchases/purchases.module'
import { ReportsModule } from './reports/reports.module'
import { SalesModule } from './sales/sales.module'
import { SuppliersModule } from './suppliers/suppliers.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    InventoryModule,
    CategoriesModule,
    PurchasesModule,
    SalesModule,
    CustomersModule,
    SuppliersModule,
    MetalRatesModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
