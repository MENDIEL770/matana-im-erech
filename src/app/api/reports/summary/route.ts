import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const now = new Date()
  const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1))

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  // Current month orders (not cancelled)
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
      status: { not: 'CANCELLED' },
    },
    include: {
      customer: { select: { shaliachName: true, chabadHouseName: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const cost = orders.reduce((sum, o) => sum + Number(o.totalCost), 0)
  const grossProfit = revenue - cost
  const grossProfitPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  const orderCount = orders.length
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0

  // Top products
  const productMap = new Map<string, { name: string; revenue: number; quantity: number }>()
  for (const order of orders) {
    for (const item of order.items) {
      const name = item.product?.name ?? item.name
      const existing = productMap.get(name) ?? { name, revenue: 0, quantity: 0 }
      existing.revenue += Number(item.total)
      existing.quantity += item.quantity
      productMap.set(name, existing)
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Top customers
  const customerMap = new Map<string, { name: string; chabadHouse: string; revenue: number; orders: number }>()
  for (const order of orders) {
    const key = order.customerId
    const existing = customerMap.get(key) ?? {
      name: order.customer.shaliachName,
      chabadHouse: order.customer.chabadHouseName,
      revenue: 0,
      orders: 0,
    }
    existing.revenue += Number(order.total)
    existing.orders += 1
    customerMap.set(key, existing)
  }
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Revenue by month (last 6 months)
  const revenueByMonth = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1)
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1)

    const mOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: mStart, lt: mEnd },
        status: { not: 'CANCELLED' },
      },
      select: { total: true, totalCost: true },
    })

    const mRevenue = mOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const mCost = mOrders.reduce((sum, o) => sum + Number(o.totalCost), 0)
    revenueByMonth.push({
      month: HEBREW_MONTHS[d.getMonth()],
      revenue: mRevenue,
      profit: mRevenue - mCost,
    })
  }

  return NextResponse.json({
    revenue,
    cost,
    grossProfit,
    grossProfitPercent,
    orderCount,
    avgOrderValue,
    topProducts,
    topCustomers,
    revenueByMonth,
  })
}
