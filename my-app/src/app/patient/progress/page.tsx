// app/patient/progress/page.tsx
'use client'

import { useStore } from '@/lib/store'
import Charts from '@/components/Charts'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { TrendingUp, Target, Calendar, BarChart3, Award, Zap } from 'lucide-react'

export default function PatientProgress() {
  const { progress, exercises } = useStore()
  const { user } = useUser()
  
  // Get user's first name or fallback to "Patient"
  const userName = user?.firstName || user?.username || "Patient"
  
  const totalCompleted = progress.reduce((sum, p) => sum + p.completed, 0)
  const totalTime = progress.reduce((sum, p) => sum + p.timeSpent, 0)
  const avgAccuracy = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length) 
    : 0
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            {userName}'s Progress Journey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your rehabilitation milestones and celebrate your achievements, {userName}
          </p>
        </motion.div>
        
        {/* Stats Overview with Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <TrendingUp className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <Zap className="h-3 w-3 mr-1" />
                  Active
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Completed</h3>
                <p className="text-3xl font-bold text-gray-800">{totalCompleted}</p>
                <p className="text-xs text-gray-400 mt-1">exercises completed</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl">
                  <Target className="h-7 w-7 text-green-600" />
                </div>
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                  avgAccuracy >= 80 ? 'text-green-600 bg-green-50' : 
                  avgAccuracy >= 60 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
                }`}>
                  {avgAccuracy >= 80 ? 'Excellent' : avgAccuracy >= 60 ? 'Good' : 'Improving'}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Accuracy</h3>
                <p className="text-3xl font-bold text-gray-800">{avgAccuracy}%</p>
                <p className="text-xs text-gray-400 mt-1">precision rate</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl">
                  <Calendar className="h-7 w-7 text-amber-600" />
                </div>
                <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Time
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Time</h3>
                <p className="text-3xl font-bold text-gray-800">{totalTime}</p>
                <p className="text-xs text-gray-400 mt-1">minutes practiced</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl">
                  <BarChart3 className="h-7 w-7 text-purple-600" />
                </div>
                <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  Available
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Exercises</h3>
                <p className="text-3xl font-bold text-gray-800">{exercises.length}</p>
                <p className="text-xs text-gray-400 mt-1">in your program</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Charts Section with Enhanced Design */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-sm opacity-10 group-hover:opacity-15 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Progress Overview</h2>
                  <p className="text-gray-500">Your journey over time</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-100/50">
                <Charts data={progress} type="line" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-sm opacity-10 group-hover:opacity-15 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Weekly Performance</h2>
                  <p className="text-gray-500">Recent activity snapshot</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-2xl p-6 border border-gray-100/50">
                <Charts data={progress.slice(-7)} type="bar" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Motivational Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white shadow-lg">
            <Award className="h-5 w-5 mr-2" />
            <span className="font-medium">Keep up the great work! Every step counts towards your recovery.</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}