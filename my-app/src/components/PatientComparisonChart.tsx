// components/PatientComparisonChart.tsx
'use client'

import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

interface PatientComparisonDatum {
  patient: string
  week: string
  accuracy: number
  exercises: number
}

interface PatientComparisonChartProps {
  patients: Array<{ id: string; name: string; weeklyProgress?: { week: string; exercises: number; accuracy: number; time: number }[] }>
  metric?: 'accuracy' | 'exercises'
  selectedPatientIds?: string[]
  onTogglePatient?: (id: string) => void
}

const palette = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#0ea5e9','#ec4899']

export default function PatientComparisonChart({ patients, metric = 'accuracy', selectedPatientIds, onTogglePatient }: PatientComparisonChartProps) {
  const filtered = useMemo(() => {
    const enabled = new Set(selectedPatientIds && selectedPatientIds.length ? selectedPatientIds : patients.map(p => p.id))
    // Build data by week combining patients side-by-side
    const weekMap: Record<string, any> = {}
    patients.filter(p => enabled.has(p.id)).forEach((p) => {
      (p.weeklyProgress || []).forEach(w => {
        if (!weekMap[w.week]) weekMap[w.week] = { week: w.week }
        weekMap[w.week][p.id] = metric === 'accuracy' ? Math.round(w.accuracy) : w.exercises
      })
    })
    return Object.values(weekMap).sort((a: any, b: any) => (a.week > b.week ? 1 : -1))
  }, [patients, metric, selectedPatientIds])

  const legendPayload = patients.map((p, idx) => ({ id: p.id, value: p.name, color: palette[idx % palette.length] }))

  const renderLegend = () => {
    return (
      <div className="flex flex-wrap gap-3 px-2 pb-2 text-xs md:text-sm">
        {legendPayload.map(item => {
          const active = !selectedPatientIds?.length || selectedPatientIds.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTogglePatient && onTogglePatient(item.id)}
              className={`flex items-center gap-1 transition-opacity ${active ? 'opacity-100' : 'opacity-40'} hover:opacity-80`}
            >
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-gray-700">{item.value}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filtered} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={metric === 'accuracy' ? (v) => `${v}%` : undefined} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
          <Legend content={renderLegend} />
          {patients.map((p, idx) => (
            !selectedPatientIds?.length || selectedPatientIds.includes(p.id) ? (
              <Line key={p.id} type="monotone" dataKey={p.id} stroke={palette[idx % palette.length]} strokeWidth={2} dot={false} />
            ) : null
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
