import { Module } from '@nestjs/common'
import { AccessTokenGuard } from '../auth/access-token.guard'
import { InventoryController } from './inventory.controller'
import { InventoryService } from './inventory.service'

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, AccessTokenGuard],
})
export class InventoryModule {}
