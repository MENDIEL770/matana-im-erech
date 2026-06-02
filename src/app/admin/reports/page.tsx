'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), { ssr: false })

// ---------- Types ----------
interface SummaryData {
  revenue: number
  cost: number
  grossProfit: number
  grossProfitPercent: number
  orderCount: number
  avgOrderValue: number
  topProducts: { name: string; revenue: number; quantity: number }[]
  topCustomers: { name: string; chabadHouse: string; revenue: number; orders: number }[]
  revenueByMonth: { month: string; revenue: number; profit: number }[]
}

interface PartnerData {
  year: number
  month: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  operatingExpenses: number
  netProfit: number
  partnerPercent: number
  partnerPayment: number
  agentCommissions: number
}

// ---------- Helpers ----------
const fmt = (n: number) =>
  `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const HEBREW_MONTHS = [
  '', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#0F2747]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ---------- Overview Tab ----------
function OverviewTab({
  summary,
  year,
  month,
  setYear,
  setMonth,
}: {
  summary: SummaryData | null
  year: number
  month: number
  setYear: (y: number) => void
  setMonth: (m: number) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-sm px-3 py-2 text-sm"
        >
          {HEBREW_MONTHS.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-sm px-3 py-2 text-sm"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="הכנסות" value={fmt(summary.revenue)} />
            <KpiCard label="עלויות" value={fmt(summary.cost)} />
            <KpiCard
              label="רווח גולמי"
              value={fmt(summary.grossProfit)}
              sub={`${summary.grossProfitPercent.toFixed(1)}%`}
            />
            <KpiCard
              label="מספר הזמנות"
              value={String(summary.orderCount)}
              sub={`ממוצע ${fmt(summary.avgOrderValue)}`}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
            <h3 className="font-['Ploni'] font-semibold text-[#0F2747] mb-4">
              הכנסות ורווח — 6 חודשים אחרונים
            </h3>
            <RevenueChart data={summary.revenueByMonth} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
              <h3 className="font-['Ploni'] font-semibold text-[#0F2747] mb-3">Top 5 מוצרים</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100">
                    <th className="text-right pb-2 font-medium">מוצר</th>
                    <th className="text-left pb-2 font-medium">יחידות</th>
                    <th className="text-left pb-2 font-medium">הכנסה</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topProducts.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{p.name}</td>
                      <td className="py-2 text-gray-500 text-left">{p.quantity}</td>
                      <td className="py-2 text-[#0F2747] font-medium text-left">{fmt(p.revenue)}</td>
                    </tr>
                  ))}
                  {summary.topProducts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400">אין נתונים</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
              <h3 className="font-['Ploni'] font-semibold text-[#0F2747] mb-3">Top 5 לקוחות</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100">
                    <th className="text-right pb-2 font-medium">שליח</th>
                    <th className="text-right pb-2 font-medium">בית חב&quot;ד</th>
                    <th className="text-left pb-2 font-medium">הכנסה</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topCustomers.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{c.name}</td>
                      <td className="py-2 text-gray-500">{c.chabadHouse}</td>
                      <td className="py-2 text-[#0F2747] font-medium text-left">{fmt(c.revenue)}</td>
                    </tr>
                  ))}
                  {summary.topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400">אין נתונים</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- Partner Tab ----------
function PnlRow({
  label,
  value,
  negative,
  bold,
  highlight,
}: {
  label: string
  value: string
  negative?: boolean
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${
        highlight ? 'bg-[#B08D57]/10 px-3 rounded-sm' : ''
      }`}
    >
      <span className={`text-gray-600 ${bold ? 'font-semibold text-gray-800' : ''}`}>{label}</span>
      <span
        className={`${bold ? 'font-bold text-[#0F2747]' : ''} ${
          highlight ? 'font-bold text-[#B08D57] text-base' : ''
        } ${negative ? 'text-red-500' : ''}`}
      >
        {negative ? '-' : ''}{value}
      </span>
    </div>
  )
}

function PartnerTab({
  year,
  month,
  setYear,
  setMonth,
}: {
  year: number
  month: number
  setYear: (y: number) => void
  setMonth: (m: number) => void
}) {
  const [partnerPercent, setPartnerPercent] = useState(20)
  const [opEx, setOpEx] = useState(0)
  const [data, setData] = useState<PartnerData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch(
      `/api/reports/partner?year=${year}&month=${month}&partnerPercent=${partnerPercent}`
    )
    const json = await res.json()
    setData(json)
  }, [year, month, partnerPercent])

  useEffect(() => { fetchData() }, [fetchData])

  const netProfit = data ? data.grossProfit - data.agentCommissions - opEx : 0
  const partnerPayment = netProfit * (partnerPercent / 100)

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    await fetch('/api/reports/partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year,
        month,
        totalRevenue: data.totalRevenue,
        totalCost: data.totalCost,
        grossProfit: data.grossProfit,
        operatingExpenses: opEx,
        netProfit,
        partnerPercent,
        partnerPayment,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex gap-3 items-center flex-wrap">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-sm px-3 py-2 text-sm"
        >
          {HEBREW_MONTHS.slice(1).map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-sm px-3 py-2 text-sm"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">אחוז שותף:</label>
          <input
            type="number"
            value={partnerPercent}
            onChange={(e) => setPartnerPercent(Number(e.target.value))}
            className="border border-gray-200 rounded-sm px-3 py-2 text-sm w-20"
            min={0}
            max={100}
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>

      {data && (
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
          <h3 className="font-['Ploni'] font-semibold text-[#0F2747] mb-5 text-lg">
            דוח רווח והפסד — {HEBREW_MONTHS[month]} {year}
          </h3>

          <div className="space-y-1 text-sm">
            <PnlRow label='סה"כ הכנסות' value={fmt(data.totalRevenue)} />
            <PnlRow label='סה"כ עלויות' value={fmt(data.totalCost)} negative />
            <PnlRow label="רווח גולמי" value={fmt(data.grossProfit)} bold />
            <PnlRow label="עמלות סוכנים" value={fmt(data.agentCommissions)} negative />
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">הוצאות תפעול</span>
              <div className="flex items-center gap-1">
                <span className="text-red-500">-</span>
                <input
                  type="number"
                  value={opEx}
                  onChange={(e) => setOpEx(Number(e.target.value))}
                  className="border border-gray-200 rounded-sm px-2 py-1 text-sm w-28 text-left"
                  min={0}
                />
              </div>
            </div>
            <PnlRow label="רווח נקי" value={fmt(netProfit)} bold />

            <div className="border-t border-gray-200 pt-3 mt-3">
              <PnlRow
                label={`אחוז שותף (${partnerPercent}%)`}
                value={fmt(partnerPayment)}
                highlight
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#0F2747] text-white px-5 py-2 rounded-sm text-sm hover:bg-[#1a3a6b] transition-colors disabled:opacity-50"
            >
              {saving ? 'שומר...' : saved ? 'נשמר!' : 'שמור דוח'}
            </button>
            <button
              onClick={() => window.print()}
              className="border border-gray-200 text-gray-700 px-5 py-2 rounded-sm text-sm hover:bg-gray-50 transition-colors"
            >
              הדפס
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Products Tab ----------
function ProductsTab({ summary }: { summary: SummaryData | null }) {
  const products = summary?.topProducts ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-right px-4 py-3 font-medium text-gray-600">מוצר</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">יחידות נמכרות</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">הכנסה</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800">{p.name}</td>
              <td className="px-4 py-3 text-gray-500 text-left">{p.quantity}</td>
              <td className="px-4 py-3 text-[#0F2747] font-medium text-left">{fmt(p.revenue)}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-gray-400">אין נתונים לחודש זה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Customers Tab ----------
function CustomersTab({ summary }: { summary: SummaryData | null }) {
  const customers = summary?.topCustomers ?? []

  const tierBadge = (revenue: number) => {
    if (revenue >= 50000)
      return { label: 'GOLD', cls: 'bg-[#B08D57]/20 text-[#7a5f30] border border-[#B08D57]/40' }
    if (revenue >= 20000)
      return { label: 'SILVER', cls: 'bg-gray-100 text-gray-600 border border-gray-300' }
    return { label: 'REGULAR', cls: 'bg-blue-50 text-blue-700 border border-blue-200' }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">בית חב&quot;ד</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">הזמנות</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">הכנסה</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">ממוצע הזמנה</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">דרגה</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => {
            const badge = tierBadge(c.revenue)
            const avg = c.orders > 0 ? c.revenue / c.orders : 0
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.chabadHouse}</td>
                <td className="px-4 py-3 text-gray-500 text-left">{c.orders}</td>
                <td className="px-4 py-3 text-[#0F2747] font-medium text-left">{fmt(c.revenue)}</td>
                <td className="px-4 py-3 text-gray-500 text-left">{fmt(avg)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-sm ${badge.cls}`}>
                    {badge.label}
                  </span>
                </td>
              </tr>
            )
          })}
          {customers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">אין נתונים לחודש זה</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Main Page ----------
export default function ReportsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchSummary = useCallback(async () => {
    const res = await fetch(`/api/reports/summary?year=${year}&month=${month}`)
    const json = await res.json()
    setSummary(json)
  }, [year, month])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const tabs = [
    { id: 'overview', label: 'סקירה כללית' },
    { id: 'partner', label: 'חישוב שותפים' },
    { id: 'products', label: 'מוצרים' },
    { id: 'customers', label: 'לקוחות' },
  ]

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <h1 className="font-['Ploni'] text-2xl font-bold text-[#0F2747]">דוחות רווחיות</h1>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#0F2747] text-[#0F2747]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          summary={summary}
          year={year}
          month={month}
          setYear={setYear}
          setMonth={setMonth}
        />
      )}
      {activeTab === 'partner' && (
        <PartnerTab year={year} month={month} setYear={setYear} setMonth={setMonth} />
      )}
      {activeTab === 'products' && <ProductsTab summary={summary} />}
      {activeTab === 'customers' && <CustomersTab summary={summary} />}
    </div>
  )
}
