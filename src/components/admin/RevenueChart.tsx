'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  month: string
  revenue: number
  profit: number
}

interface RevenueChartProps {
  data: DataPoint[]
}

const formatCurrency = (value: number) =>
  `₪${value.toLocaleString('he-IL', { minimumFractionDigits: 0 })}`

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-3 text-sm" dir="rtl">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'revenue' ? 'הכנסות' : 'רווח'}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}K`}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          orientation="right"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (value === 'revenue' ? 'הכנסות' : 'רווח')}
          iconType="square"
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="revenue" name="revenue" fill="#0F2747" radius={[3, 3, 0, 0]} />
        <Bar dataKey="profit" name="profit" fill="#B08D57" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
