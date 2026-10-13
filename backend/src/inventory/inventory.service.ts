import { Injectable } from '@nestjs/common'
import { InventoryStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findItems() {
    const items = await this.prisma.inventoryItem.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            category: { select: { name: true } },
          },
        },
      },
    })

    return items.map((item) => ({
      id: item.id,
      sku: item.sku,
      tagCode: item.tagCode,
      productName: item.product.name,
      category: item.product.category.name,
      metalType: item.metalType,
      purityLabel: item.purityLabel,
      grossWeightGrams: item.grossWeight.toString(),
      netWeightGrams: item.netWeight.toString(),
      purchaseCostInr: item.purchaseCost.toString(),
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    }))
  }

  async getSummary() {
    const [available, inspection] = await Promise.all([
      this.prisma.inventoryItem.count({
        where: { status: InventoryStatus.AVAILABLE },
      }),
      this.prisma.inventoryItem.count({
        where: { status: InventoryStatus.INSPECTION },
      }),
    ])

    return { available, inspection }
  }
}
