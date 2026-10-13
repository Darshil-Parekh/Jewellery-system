import { Injectable } from '@nestjs/common'
import { InventoryStatus, MetalType, Prisma, SaleStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const available = { status: InventoryStatus.AVAILABLE }
    const today = startOfIndiaDay(new Date())

    const [inventory, gold, silver, todaysSales, inspectionCount] =
      await Promise.all([
        this.prisma.inventoryItem.aggregate({
          where: available,
          _count: { _all: true },
          _sum: { purchaseCost: true },
        }),
        this.prisma.inventoryItem.aggregate({
          where: { ...available, metalType: MetalType.GOLD },
          _sum: { netWeight: true },
        }),
        this.prisma.inventoryItem.aggregate({
          where: { ...available, metalType: MetalType.SILVER },
          _sum: { netWeight: true },
        }),
        this.prisma.sale.aggregate({
          where: { soldAt: { gte: today }, status: { not: SaleStatus.VOID } },
          _sum: { totalAmount: true },
        }),
        this.prisma.inventoryItem.count({
          where: { status: InventoryStatus.INSPECTION },
        }),
      ])

    return {
      availablePieces: inventory._count._all,
      goldNetWeightGrams: inventoryDecimal(gold._sum.netWeight),
      silverNetWeightGrams: inventoryDecimal(silver._sum.netWeight),
      inventoryCostValueInr: inventoryDecimal(inventory._sum.purchaseCost),
      todaysSalesInr: inventoryDecimal(todaysSales._sum.totalAmount),
      inspectionItems: inspectionCount,
    }
  }

  async getSales(days: number) {
    const now = new Date()
    const start = startOfIndiaDay(now, 1 - days)
    const end = new Date(startOfIndiaDay(now, 1).getTime() - 1)

    const sales = await this.prisma.sale.findMany({
      where: {
        soldAt: { gte: start, lte: end },
        status: { not: SaleStatus.VOID },
      },
      select: { soldAt: true, totalAmount: true },
      orderBy: { soldAt: 'asc' },
    })
    const dailyTotals = new Map<string, Prisma.Decimal>()

    for (const sale of sales) {
      const date = indiaDateKey(sale.soldAt)
      dailyTotals.set(
        date,
        (dailyTotals.get(date) ?? new Prisma.Decimal(0)).plus(sale.totalAmount),
      )
    }

    const series = []
    for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
      const key = indiaDateKey(date)
      series.push({
        date: key,
        salesInr: (dailyTotals.get(key) ?? new Prisma.Decimal(0)).toFixed(2),
      })
    }

    return { days, hasSales: sales.length > 0, series }
  }

  async getInventoryDistribution() {
    const available = { status: InventoryStatus.AVAILABLE }
    const [diamonds, gold, silver, other] = await Promise.all([
      this.prisma.inventoryItem.count({
        where: {
          ...available,
          OR: [{ hasDiamond: true }, { metalType: MetalType.DIAMOND }],
        },
      }),
      this.prisma.inventoryItem.count({
        where: {
          ...available,
          metalType: MetalType.GOLD,
          hasDiamond: false,
        },
      }),
      this.prisma.inventoryItem.count({
        where: {
          ...available,
          metalType: MetalType.SILVER,
          hasDiamond: false,
        },
      }),
      this.prisma.inventoryItem.count({
        where: {
          ...available,
          metalType: {
            notIn: [MetalType.GOLD, MetalType.SILVER, MetalType.DIAMOND],
          },
          hasDiamond: false,
        },
      }),
    ])

    return [
      { name: 'Gold', pieces: gold },
      { name: 'Silver', pieces: silver },
      { name: 'Diamond', pieces: diamonds },
      { name: 'Other', pieces: other },
    ]
  }

  async getRecentMovements() {
    const movements = await this.prisma.stockMovement.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        inventoryItem: {
          select: {
            tagCode: true,
            product: { select: { name: true } },
          },
        },
        user: { select: { fullName: true } },
      },
    })

    return movements.map((movement) => ({
      id: movement.id,
      tagCode: movement.inventoryItem.tagCode,
      itemName: movement.inventoryItem.product.name,
      type: movement.type,
      weightGrams: inventoryDecimal(movement.weight),
      createdAt: movement.createdAt.toISOString(),
      staffName: movement.user.fullName,
      reference: movement.reference,
    }))
  }

  async getRecentSales() {
    const sales = await this.prisma.sale.findMany({
      where: { status: { not: SaleStatus.VOID } },
      take: 5,
      orderBy: { soldAt: 'desc' },
      include: { customer: { select: { fullName: true } } },
    })

    return sales.map((sale) => ({
      id: sale.id,
      invoiceNo: sale.invoiceNo,
      customerName: sale.customer?.fullName ?? 'Walk-in customer',
      totalAmountInr: inventoryDecimal(sale.totalAmount),
      status: sale.status,
      soldAt: sale.soldAt.toISOString(),
    }))
  }

  async getAlerts() {
    const where = { status: InventoryStatus.INSPECTION }
    const [total, items] = await Promise.all([
      this.prisma.inventoryItem.count({ where }),
      this.prisma.inventoryItem.findMany({
        where,
        take: 10,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          tagCode: true,
          updatedAt: true,
          product: { select: { name: true } },
        },
      }),
    ])

    return {
      total,
      items: items.map((item) => ({
        id: item.id,
        tagCode: item.tagCode,
        itemName: item.product.name,
        message: 'This piece is marked for inspection.',
        updatedAt: item.updatedAt.toISOString(),
      })),
    }
  }
}

function inventoryDecimal(value: { toString(): string } | null) {
  return value?.toString() ?? '0'
}

function startOfIndiaDay(date: Date, offsetDays = 0) {
  const indiaTime = new Date(date.getTime() + 330 * 60_000)
  return new Date(
    Date.UTC(
      indiaTime.getUTCFullYear(),
      indiaTime.getUTCMonth(),
      indiaTime.getUTCDate() + offsetDays,
    ) - 330 * 60_000,
  )
}

function indiaDateKey(date: Date) {
  return new Date(date.getTime() + 330 * 60_000).toISOString().slice(0, 10)
}
