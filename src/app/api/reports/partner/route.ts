import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const now = new Date()
  const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1))
  const partnerPercent = parseFloat(searchParams.get('partnerPercent') ?? '20')

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
      status: { not: 'CANCELLED' },
    },
    select: { total: true, totalCost: true, agentCommission: true },
  })

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalCost = orders.reduce((sum, o) => sum + Number(o.totalCost), 0)
  const agentCommissions = orders.reduce((sum, o) => sum + Number(o.agentCommission), 0)
  const grossProfit = totalRevenue - totalCost
  const operatingExpenses = 0
  const netProfit = grossProfit - agentCommissions - operatingExpenses
  const partnerPayment = netProfit * (partnerPercent / 100)

  return NextResponse.json({
    year,
    month,
    totalRevenue,
    totalCost,
    grossProfit,
    operatingExpenses,
    netProfit,
    partnerPercent,
    partnerPayment,
    agentCommissions,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    year,
    month,
    totalRevenue,
    totalCost,
    grossProfit,
    operatingExpenses,
    netProfit,
    partnerPercent,
    partnerPayment,
  } = body

  const report = await prisma.monthlyReport.upsert({
    where: { year_month: { year, month } },
    update: {
      totalRevenue,
      totalCost,
      grossProfit,
      operatingExpenses,
      netProfit,
      partnerPercent,
      partnerPayment,
    },
    create: {
      year,
      month,
      totalRevenue,
      totalCost,
      grossProfit,
      operatingExpenses,
      netProfit,
      partnerPercent,
      partnerPayment,
    },
  })

  return NextResponse.json(report)
}
