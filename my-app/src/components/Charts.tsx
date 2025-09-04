// components/Charts.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ProgressData } from '@/lib/store'

interface ChartsProps {
  data: ProgressData[]
  type?: 'line' | 'bar'
}

const Charts = ({ data, type = 'line' }: ChartsProps) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
        <p className="text-gray-500">No progress data available yet</p>
      </div>
    )
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      {type === 'line' ? (
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="completed" stroke="#8884d8" />
          <Line type="monotone" dataKey="timeSpent" stroke="#82ca9d" />
          <Line type="monotone" dataKey="accuracy" stroke="#ffc658" />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#8884d8" />
          <Bar dataKey="timeSpent" fill="#82ca9d" />
          <Bar dataKey="accuracy" fill="#ffc658" />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

export default Charts