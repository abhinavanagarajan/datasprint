// app/patient/progress/page.tsx
'use client'

import { useStore } from '@/lib/store'
import Charts from '@/components/Charts'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Calendar, BarChart3 } from 'lucide-react'

export default function PatientProgress() {
  const { progress, exercises } = useStore()
  
  const totalCompleted = progress.reduce((sum, p) => sum + p.completed, 0)
  const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0)
  const avgAccuracy = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length) 
    : 0
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Your Progress
      </motion.h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Total Completed</h3>
              <p className="text-2xl font-bold">{totalCompleted}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Avg. Accuracy</h3>
              <p className="text-2xl font-bold">{avgAccuracy}%</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Total Time</h3>
              <p className="text-2xl font-bold">{totalTime} min</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-100"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Exercises</h3>
              <p className="text-2xl font-bold">{exercises.length}</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Progress Charts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-md mb-8"
      >
        <h2 className="text-xl font-semibold mb-6">Progress Overview</h2>
        <Charts data={progress} type="line" />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-6">Weekly Performance</h2>
        <Charts data={progress.slice(-7)} type="bar" />
      </motion.div>
    </div>
  )
}