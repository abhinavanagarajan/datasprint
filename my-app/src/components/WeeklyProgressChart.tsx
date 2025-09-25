// components/WeeklyProgressChart.tsx
'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area
} from 'recharts'

interface WeeklyDatum {
  week: string
  exercises: number
  accuracy: number
  time: number
}

interface WeeklyProgressChartProps {
  data?: WeeklyDatum[]
  height?: number
  compact?: boolean
}

const COLORS = {
  exercises: '#6366f1', // indigo-500
  accuracy: '#f59e0b', // amber-500
  time: '#10b981', // emerald-500
  area: '#6366f11a'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const exercises = payload.find((p: any) => p.dataKey === 'exercises')
  const accuracy = payload.find((p: any) => p.dataKey === 'accuracy')
  const time = payload.find((p: any) => p.dataKey === 'time')
  return (
    <div className="rounded-lg shadow-xl border border-gray-200 bg-white/90 backdrop-blur p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-700">Week {label}</p>
      {exercises && <p className="text-indigo-600">Exercises: <span className="font-medium text-gray-800">{exercises.value}</span></p>}
      {accuracy && <p className="text-amber-600">Accuracy: <span className="font-medium text-gray-800">{Math.round(accuracy.value)}%</span></p>}
      {time && <p className="text-emerald-600">Time: <span className="font-medium text-gray-800">{time.value} min</span></p>}
    </div>
  )
}

export default function WeeklyProgressChart({ data = [], height = 260, compact = false }: WeeklyProgressChartProps) {
  const prepared = useMemo(() => {
    return (data || []).map(d => ({
      ...d,
      // Ensure numbers are bounded and formatted
      accuracy: Number(d.accuracy || 0),
      exercises: Number(d.exercises || 0),
      time: Number((d.time / 60).toFixed(1)) // convert seconds to minutes if needed
    }))
  }, [data])

  if (!prepared.length) {
    return (
      <div className={`w-full ${compact ? 'h-40' : 'h-64'} flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200`}>
        <p className="text-gray-500 text-sm">No weekly progress yet</p>
      </div>
    )
  }

  return (
    <div className={`w-full ${compact ? 'h-48' : 'h-72'} relative`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={prepared} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="accuracyArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.exercises} stopOpacity={0.25} />
              <stop offset="95%" stopColor={COLORS.exercises} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area yAxisId="right" type="monotone" dataKey="accuracy" stroke={COLORS.accuracy} fill="url(#accuracyArea)" strokeWidth={2} />
          <Bar yAxisId="left" dataKey="exercises" barSize={20} radius={[4,4,0,0]} fill={COLORS.exercises} />
          <Line yAxisId="left" type="monotone" dataKey="time" stroke={COLORS.time} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
