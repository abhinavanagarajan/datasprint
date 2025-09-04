// app/therapist/patients/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import Charts from '@/components/Charts'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { Calendar, Target, TrendingUp, BarChart3, User } from 'lucide-react'

export default function TherapistPatientDetail() {
  const params = useParams()
  const { patients } = useStore()
  const { user } = useUser()
  
  const patient = patients.find(p => p.id === params.id)
  
  // Get therapist's first name or fallback to "Doctor"
  const therapistName = user?.firstName || user?.username || "Doctor"
  
  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Patient not found</h1>
          <p className="text-gray-600 mt-2">The patient you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }
  
  const totalCompleted = patient.progress.reduce((sum, p) => sum + p.completed, 0)
  const totalTime = patient.progress.reduce((sum, p) => sum + p.timeSpent, 0)
  const avgAccuracy = patient.progress.length > 0 
    ? Math.round(patient.progress.reduce((sum, p) => sum + p.accuracy, 0) / patient.progress.length) 
    : 0
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm text-gray-500">Dr. {therapistName} reviewing patient:</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-100">{patient.name}</h1>
        <p className="text-gray-200">{patient.email}</p>
      </motion.div>
      
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
              <p className="text-2xl text-gray-800 font-bold">{totalCompleted}</p>
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
              <p className="text-2xl text-gray-800 font-bold">{avgAccuracy}%</p>
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
              <p className="text-2xl text-gray-800 font-bold">{patient.streak} days</p>
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
              <h3 className="text-sm text-gray-500">Total Time</h3>
              <p className="text-2xl text-gray-800 font-bold">{totalTime} min</p>
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
        <h2 className="text-xl text-gray-800 font-semibold mb-6">Progress Overview</h2>
        <Charts data={patient.progress} type="line" />
      </motion.div>
      
      {/* Assigned Exercises */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-md mb-8"
      >
        <h2 className="text-xl text-gray-800 font-semibold mb-6">Assigned Exercises</h2>
        
        {patient.assignedExercises.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Exercise</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Difficulty</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Sets × Reps</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Duration</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patient.assignedExercises.map(exercise => (
                  <tr key={exercise.id}>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{exercise.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exercise.difficulty.toLocaleUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-sm">{exercise.sets} × {exercise.reps}</td>
                    <td className="px-4 py-3 text-gray-800 text-sm">{exercise.duration}s</td>
                    <td className="px-4 py-3 text-gray-800 text-sm">{exercise.completed} times</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No exercises assigned to this patient.</p>
        )}
      </motion.div>
      
      {/* Activity Log */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl text-gray-800 font-semibold mb-6">Recent Activity</h2>
        
        {patient.progress.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Exercises Completed</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time Spent</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patient.progress.slice().reverse().map((progress, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-800 text-sm">{progress.date}</td>
                    <td className="px-4 py-3 text-gray-800 text-sm">{progress.completed}</td>
                    <td className="px-4 py-3 text-gray-800 text-sm">{progress.timeSpent} min</td>
                    <td className="px-4 py-3 text-gray-800 text-sm">{progress.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No activity recorded for this patient.</p>
        )}
      </motion.div>
    </div>
  )
}