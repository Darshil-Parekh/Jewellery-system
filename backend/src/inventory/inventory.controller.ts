import { Controller, Get, UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from '../auth/access-token.guard'
import { InventoryService } from './inventory.service'

@Controller('inventory')
@UseGuards(AccessTokenGuard)
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  findItems() {
    return this.inventory.findItems()
  }

  @Get('summary')
  getSummary() {
    return this.inventory.getSummary()
  }
}
