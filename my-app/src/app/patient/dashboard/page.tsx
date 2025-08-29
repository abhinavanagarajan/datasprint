// app/patient/dashboard/page.tsx
'use client'

import { useStore } from '@/lib/store'
import ExerciseCard from '@/components/ExerciseCard'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Calendar, Award } from 'lucide-react'

export default function PatientDashboard() {
  const { exercises, progress, streak } = useStore()
  
  const completedExercises = exercises.filter(ex => ex.completed > 0).length
  const totalExercises = exercises.length
  const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
  
  const todayProgress = progress.find(p => p.date === new Date().toISOString().split('T')[0])
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Your Dashboard
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
              <h3 className="text-sm text-gray-500">Completion Rate</h3>
              <p className="text-2xl font-bold">{completionRate}%</p>
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
              <h3 className="text-sm text-gray-500">Today's Exercises</h3>
              <p className="text-2xl font-bold">{todayProgress?.completed || 0}</p>
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
              <h3 className="text-sm text-gray-500">Current Streak</h3>
              <p className="text-2xl font-bold">{streak} days</p>
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
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Total Exercises</h3>
              <p className="text-2xl font-bold">{exercises.length}</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Assigned Exercises */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Assigned Exercises</h2>
        
        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise, index) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <div className="text-gray-400 mb-4">No exercises assigned yet</div>
            <p className="text-gray-600">Your therapist will assign exercises for you soon.</p>
          </div>
        )}
      </motion.div>
      
      {/* Motivation Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
      >
        <h3 className="text-xl font-semibold mb-2">Keep up the great work!</h3>
        <p className="mb-4">Consistency is key to recovery. You've completed {completedExercises} exercises so far.</p>
        
        {streak >= 3 && (
          <div className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-300" />
            <span>You're on a {streak}-day streak! Amazing job!</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}